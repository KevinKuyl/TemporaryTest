import uniqueValidator from 'mongoose-unique-validator';
import timestamps from 'mongoose-timestamp';
import Mongoose from 'mongoose';

export const InputSchema = new Mongoose.Schema(
  {
  name: {
    type: String,
    required: true,
    unique: true
  },
  pin: {
    type: Number,
    required: true,
    unique: true
  },
  value: {
    type: Number, //binary
    required: true,
    unique: false
  },
}, {
  collection: 'input',
  toObject: { getters: true },
  toJSON: { getters: true }
}
);

InputSchema.plugin(uniqueValidator);
InputSchema.plugin(timestamps);
InputSchema.index({ createdAt: 1, updatedAt: 1 });

const Input = Mongoose.model('Input', InputSchema);

//Queries
Input.getInputById = async function (id) {
  try {
    const input = await Input.findById(id)
      .populate('devices') 
    if (input) {
      return input;
    } else {
      return new Error(`Input not found.`, { argumentName: '_id' });
    }
  } catch (exception) {
    return exception;
  }
}

Input.findInputs = async ({ filter, offset, limit, sort }) => {
  const searchFields = [] // which fields contain a search function?
  for (let field in filter) {
    if (searchFields.includes(field)) {
      // fields defined in the searchFields array will be searched with a regex
      filter[field] = {
        $regex: RegExp('.*' + filter[field] + '.*'),
        $options: 'i'
      };
    }
    if (filter[field] == undefined) {
      delete filter[field];
    }
  }
  const inputs = await Input.find(filter, null, { skip: offset, limit: limit, sort: sort })
    .populate('devices') 
  const total = await Input.countDocuments(filter);
  return {
    inputs,
    total
  };
}

// Mutations
Input.createInput = async function ({ input }, { user }, pubsub) {
  try {
    const newInput = await Input.create(input)
    const result = await Input.find({ _id: newInput._id })
      .populate('devices') 
    pubsub.publish('inputCreated', { inputCreated: result[0] });
    return result[0];
  } catch (exception) {
    return exception;
  }
};

Input.updateInput = async function ({ input }, { user }, pubsub) {
  try {
    if (input._id) {
      let inputToUpdate = await Input.findById(input._id)
        .populate('devices') 
      if (inputToUpdate) {
        for (let field in input) {
          if (inputToUpdate[field] !== input[field] &&
            input[field] !== undefined) {
            inputToUpdate[field] = input[field];
          }
        }
        await inputToUpdate.save();
        pubsub.publish('inputUpdated', { inputUpdated: inputToUpdate });
        return inputToUpdate;
      } else {
        return new Error(`Input not found.`, { argumentName: '_id' });
      }
    } else {
      return new Error('No ID specified.', { argumentName: '_id' });
    }
  } catch (exception) {
    return exception;
  }
};

Input.deleteInput = async function ({ id }, { user }, pubsub) {
  try {
    const input = await Input.findById(id)
      .populate('devices') 
    if (input) {
      input.deleted = true;
      const res = await input.save();
      pubsub.publish('inputDeleted', { inputDeleted: res });
      return 
    } else {
      return new Error(`Input not found.`, { argumentName: '_id' });
    }
  } catch (exception) {
    return exception;
  }
};

export default Input;