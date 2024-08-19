import { createModule, gql } from 'graphql-modules';
import Composer from '../../utils/Composer.js';
import Model from './models/input.js';

const typeDefs = Composer.GQLFromModel(Model, {
  // exclude: ['user'],
  // queries: ['myInput: [Input]!'],
  // mutations: ['upsertFullInput(input: [UpdateInputInput]): [Input]!'],
  // subscriptions: ['inputAdded: Input'],
  log: false
});

const resolvers = Composer.resolversFromModel(Model, {
  // queries: { myInput: 'getFullInput' },
  // mutations: { upsertFullInput: 'upsertFullInput' },
  //subscriptions: { 
    //public: {inputAdded: 'inputAdded'},
    //private: {inputAdded: 'inputAdded'} // not implemented yet
  // },
  log: false
});

export default createModule({
  id: 'input',
  dirname: 'Input',
  typeDefs,
  resolvers
});
