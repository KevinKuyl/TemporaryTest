import uniqueValidator from 'mongoose-unique-validator';
import timestamps from 'mongoose-timestamp';
import Mongoose from 'mongoose';

export const PWMDeviceSchema = new Mongoose.Schema(
  {
  name: {
    type: String,
    required: true,
    unique: true
  },
  pin: {
    type: String,
    required: true,
    unique: true
  },
  value: {
    type: Number,
    required: true,
    unique: false
  }
}, {
  collection: 'pwmdevice',
  toObject: { getters: true },
  toJSON: { getters: true }
}
);

PWMDeviceSchema.plugin(uniqueValidator);
PWMDeviceSchema.plugin(timestamps);
PWMDeviceSchema.index({ createdAt: 1, updatedAt: 1 });

const PWMDevice = Mongoose.models.PWMDevice || Mongoose.model('PWMDevice', PWMDeviceSchema);

//Queries
PWMDevice.getPWMDeviceById = async function (id) {
  try {
    const pwmdevice = await PWMDevice.findById(id)
      
    if (pwmdevice) {
      return pwmdevice;
    } else {
      return new Error(`PWMDevice not found.`, { argumentName: '_id' });
    }
  } catch (exception) {
    return exception;
  }
}

PWMDevice.findPWMDevices = async ({ filter, offset, limit, sort }) => {
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
  const pwmdevices = await PWMDevice.find(filter, null, { skip: offset, limit: limit, sort: sort })
    
  const total = await PWMDevice.countDocuments(filter);
  return {
    pwmdevices,
    total
  };
}

// Mutations
PWMDevice.createPWMDevice = async function ({ pwmdevice }, { user }, pubsub) {
  try {
    const newPWMDevice = await PWMDevice.create(pwmdevice)
    const result = await PWMDevice.find({ _id: newPWMDevice._id })
      
    pubsub.publish('pwmdeviceCreated', { pwmdeviceCreated: result[0] });
    return result[0];
  } catch (exception) {
    return exception;
  }
};

PWMDevice.updatePWMDevice = async function ({ pwmdevice }, { user }, pubsub) {
  try {
    if (pwmdevice._id) {
      let pwmdeviceToUpdate = await PWMDevice.findById(pwmdevice._id)
        
      if (pwmdeviceToUpdate) {
        for (let field in pwmdevice) {
          if (pwmdeviceToUpdate[field] !== pwmdevice[field] &&
            pwmdevice[field] !== undefined) {
            pwmdeviceToUpdate[field] = pwmdevice[field];
          }
        }
        await pwmdeviceToUpdate.save();
        pubsub.publish('pwmdeviceUpdated', { pwmdeviceUpdated: pwmdeviceToUpdate });
        return pwmdeviceToUpdate;
      } else {
        return new Error(`PWMDevice not found.`, { argumentName: '_id' });
      }
    } else {
      return new Error('No ID specified.', { argumentName: '_id' });
    }
  } catch (exception) {
    return exception;
  }
};

PWMDevice.deletePWMDevice = async function ({ id }, { user }, pubsub) {
  try {
    const pwmdevice = await PWMDevice.findById(id)
      
    if (pwmdevice) {
      pwmdevice.deleted = true;
      const res = await pwmdevice.save();
      pubsub.publish('pwmdeviceDeleted', { pwmdeviceDeleted: res });
      return 
    } else {
      return new Error(`PWMDevice not found.`, { argumentName: '_id' });
    }
  } catch (exception) {
    return exception;
  }
};

export default PWMDevice;