import { gql } from "graphql-tag";
import pkg from "graphql-subscriptions";
import {permissions} from "../services/subscriptionPermissions.js";
const { PubSub, withFilter } = pkg;
const pubsub = new PubSub();

const Composer = {
  getType(field, inputType = false, options) {
    let type;
    switch (field.type) {
      case String:
        type = 'String';
        break;
      case Number:
        type = 'Int';
        break;
      case Boolean:
        type = 'Boolean';
        break;
      case Date:
        type = 'String';
        break;
      case Array:
        type = 'Array';
        break;
      default:
        if (field.ref) {
          if (inputType) {
            type = 'String';
            if (Array.isArray(field?.type) || Array.isArray(field)) {
              type = '[String]';
            }
          }
          else {
            type = field.ref;
            if (Array.isArray(field?.type) || Array.isArray(field)) {
              type = `[${[field.ref]}]`;
            }
          }
        }
        else if (Array.isArray(field.type)) {
          type = `[${this.getType({ type: field.type[0], ref: field.type[0].ref }, inputType)}]`;
        }
        else if (Array.isArray(field)) {
          type = `[${this.getType({ type: field[0], ref: field[0].ref }, inputType)}]`;
        }
        break;
    }
    if (field.required && (!inputType || inputType == 'create') && !options?.unrequire?.includes(field)) {
      type += '!';
    }
    return type;
  },

  resolversFromModel(model, options) {
    const res = {
      Query: {
        [model.modelName.toLowerCase()]: async (_, input, ctx) => {
          console.log('get', model.modelName, 'by id', input);
          return model[`get${model.modelName}ById`](input, ctx)
        },
        [`${model.modelName.toLowerCase()}s`]: async (_, input, ctx) => {
          console.log('find', model.modelName, 'by', input);
          return model[`find${model.modelName}s`](input, ctx)
        }
      },
      Mutation: {},
      Subscription: {
        [`${model.modelName.toLowerCase()}Created`]: {
          subscribe: withFilter(() => pubsub.asyncIterator([`${model.modelName.toLowerCase()}Created`]), (payload, variables, context, info) => {
            //see if there are permissions for the subscription
            console.log('subscription', `${model.modelName.toLowerCase()}Created`)
            console.log('payload', payload)
            console.log('context', context)
            console.log('variables', variables)
            console.log('info', info)
            if (permissions[`${model.modelName.toLowerCase()}Created`]) {
              //run the permission check
              return permissions[`${model.modelName.toLowerCase()}Created`](payload, variables, context, info);
            }
            return true
          })
        },
        [`${model.modelName.toLowerCase()}Updated`]: {
          subscribe: withFilter(() => pubsub.asyncIterator([`${model.modelName.toLowerCase()}Updated`]), (payload, variables, context, info) => {
            //see if there are permissions for the subscription
            console.log('subscription', `${model.modelName.toLowerCase()}Updated`)
            if (permissions[`${model.modelName.toLowerCase()}Updated`]) {
              //run the permission check
              console.log('running permission check for', `${model.modelName.toLowerCase()}Updated`)
              return permissions[`${model.modelName.toLowerCase()}Updated`](payload, variables, context, info);
            }
            return true
          })
        },
        [`${model.modelName.toLowerCase()}Deleted`]: {
          subscribe: withFilter(() => pubsub.asyncIterator([`${model.modelName.toLowerCase()}Deleted`]), (payload, variables, context, info) => {
            //see if there are permissions for the subscription
            console.log('subscription', `${model.modelName.toLowerCase()}Deleted`)
            if (permissions[`${model.modelName.toLowerCase()}Deleted`]) {
              //run the permission check
              console.log('running permission check for', `${model.modelName.toLowerCase()}Deleted`)
              return permissions[`${model.modelName.toLowerCase()}Deleted`](payload, variables, context, info);
            }
            return true
          })
        },
      }
    }

    if (!options?.exclude?.includes(`create`)) {
      res.Mutation[`create${model.modelName}`] = async (_, input, ctx) => {
        return model[`create${model.modelName}`]({ ...input }, ctx, pubsub)
      }
    }
    if (!options?.exclude?.includes(`update`)) {
      res.Mutation[`update${model.modelName}`] = async (_, input, ctx) => {
        return model[`update${model.modelName}`]({ ...input }, ctx, pubsub)
      }
    }
    if (!options?.exclude?.includes(`delete`)) {
      res.Mutation[`delete${model.modelName}`] = async (_, input, ctx) => {
        return model[`delete${model.modelName}`]({ ...input }, ctx, pubsub)
      }
    }

    //add custom queries
    if (options?.queries) {
      for (let query in options?.queries) {
        res.Query[query] = async (_, input, ctx) => {
          return model[options.queries[query]]({ ...input }, ctx)
        }
      }
    }

    //add custom mutations
    if (options?.mutations) {
      for (let mutation in options?.mutations) {
        if(typeof options.mutations[mutation] === 'string') {
          res.Mutation[mutation] = async (_, input, ctx) => {
            return model[options.mutations[mutation]]({ ...input }, ctx, pubsub)
          }
        }
        else {
          res.Mutation[mutation] = async (_, input, ctx) => {
            return options.mutations[mutation]({ ...input }, ctx, pubsub)
          }
        }
      }
    }

    //add subscriptions
    if (options?.subscriptions) {
      for (let subscription in options?.subscriptions) {
        res.Subscription[subscription] = {
          subscribe: withFilter(
            () => pubsub.asyncIterator([subscription]),
            (payload, variables, context, info) => {
              //see if there are permissions for the subscription
              console.log('subscription', subscription)
              if (permissions[subscription]) {
                //run the permission check
                console.log('running permission check for', subscription)
                return permissions[subscription](payload, variables, context, info);
              }
              return true
            }
          )
        }
      }
    }
    if (options?.log) console.log(res);
    return res;
  },

  GQLFromModel(model, options) {
    const defs = (inputType = false, isFilter = false) => {
      let res = '';
      for (let field in model.schema.obj) {
        if (!options?.exclude?.includes(field)) {
	    if (!isFilter || Composer.getType(model.schema.obj[field], inputType, options).includes('[')) {
		  res += `
	  ${field}: ${Composer.getType(model.schema.obj[field], inputType, options)}`;
	    } else {
          	res += `
  		${field}: [${Composer.getType(model.schema.obj[field], inputType, options)}]`;
	  }
        } 
      }
      //add custom fields
      if (options?.include) {
        for (let include in options?.include) {
          res += `
  ${options?.include[include]}`;
        }
      }
      return res;
    }

    //generate graphql schema from mongoose model
    let typeDefs = `
type ${model.modelName} {
`;
    if(!options?.exclude?.includes('_id')) {
      typeDefs += `  _id: String!`;
    }
    typeDefs += `  ${defs()}
}
`
    //add result type
    typeDefs += `
type ${model.modelName}Result {
  total: Int!
  ${model.modelName.toLowerCase()}s: [${model.modelName}]!
}
`
    //add custom types
    if (options?.types) {
      for (let type of options.types) {
        typeDefs += `
${type}`;
      }
    }

    //generate input types
    typeDefs += `
input create${model.modelName}Input {`;
    typeDefs += `  ${defs('create')}
}
`
    typeDefs += `
input update${model.modelName}Input {
  _id: String!`;
    typeDefs += `  ${defs(true)}
}
`
    //generate find input type
    typeDefs += `
input find${model.modelName}Input {`;
    typeDefs += `  ${defs(true, true)}
}
`
    const prefix = options?.root ? '' : 'extend ';
    typeDefs += `
${prefix}type Query {
  ${model.modelName.toLowerCase()}s(filter: find${model.modelName}Input, limit: Int, offset: Int, sort: sortInput): ${model.modelName}Result!
  ${model.modelName.toLowerCase()}(_id: String!) : ${model.modelName}!`
    //add custom queries
    if (options?.queries) {
      for (let query of options.queries) {
        typeDefs += `
  ${query}`;
      }
    }
    typeDefs += `
}
        
${prefix}type Mutation {
`
    if (!options?.exclude?.includes(`create${model.modelName}`)) {
      typeDefs += `  create${model.modelName}(${model.modelName.toLowerCase()}: create${model.modelName}Input): ${model.modelName}!
`   }
    if (!options?.exclude?.includes(`update${model.modelName}`)) {
      typeDefs += `  update${model.modelName}(${model.modelName.toLowerCase()}: update${model.modelName}Input): ${model.modelName}!
`   }
    if (!options?.exclude?.includes(`delete${model.modelName}`)) {
      typeDefs += `  delete${model.modelName}(_id: String!): ${model.modelName}!`
    }

    //add custom queries
    if (options?.mutations) {
      for (let query of options.mutations) {
        typeDefs += `
  ${query}`;
      }
    }

    typeDefs += `
}`;

typeDefs += `
${prefix}type Subscription {
`
      //add CRUD subscriptions
      if (!options?.exclude?.includes(`${model.modelName.toLowerCase()}Created`)) {
        typeDefs += `  ${model.modelName.toLowerCase()}Created: ${model.modelName}!
`
      }
      if (!options?.exclude?.includes(`${model.modelName.toLowerCase()}Updated`)) {
        typeDefs += `  ${model.modelName.toLowerCase()}Updated: ${model.modelName}!
`
      }
      if (!options?.exclude?.includes(`${model.modelName.toLowerCase()}Deleted`)) {
        typeDefs += `  ${model.modelName.toLowerCase()}Deleted: ${model.modelName}!
`
      }

    // Subscription
    if (options?.subscriptions) {

      for (let subscription of options.subscriptions) {
        typeDefs += `  ${subscription}`
      }
    }
    typeDefs += `
  }`;
    if (options?.log) console.log(typeDefs);
    return gql`${typeDefs}`;
  }
}

export default Composer;
export { pubsub };
