import uniqueValidator from 'mongoose-unique-validator';
import timestamps from 'mongoose-timestamp';
import Mongoose from 'mongoose';

export const DeviceSchema = new Mongoose.Schema(
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
  }
}, {
  collection: 'device',
  toObject: { getters: true },
  toJSON: { getters: true }
}
);

DeviceSchema.plugin(uniqueValidator);
DeviceSchema.plugin(timestamps);
DeviceSchema.index({ createdAt: 1, updatedAt: 1 });

const Device = Mongoose.model('Device', DeviceSchema);

//Queries
Device.getDeviceById = async function (id) {
  try {
    const device = await Device.findById(id)
      
    if (device) {
      return device;
    } else {
      return new Error(`Device not found.`, { argumentName: '_id' });
    }
  } catch (exception) {
    return exception;
  }
}

Device.findDevices = async ({ filter, offset, limit, sort }) => {
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
  const devices = await Device.find(filter, null, { skip: offset, limit: limit, sort: sort })
    
  const total = await Device.countDocuments(filter);
  return {
    devices,
    total
  };
}

// Mutations
Device.createDevice = async function ({ device }, { user }, pubsub) {
  try {
    const newDevice = await Device.create(device)
    const result = await Device.find({ _id: newDevice._id })
      
    pubsub.publish('deviceCreated', { deviceCreated: result[0] });
    return result[0];
  } catch (exception) {
    return exception;
  }
};

Device.updateDevice = async function ({ device }, { user }, pubsub) {
  try {
    if (device._id) {
      let deviceToUpdate = await Device.findById(device._id)
        
      if (deviceToUpdate) {
        for (let field in device) {
          if (deviceToUpdate[field] !== device[field] &&
            device[field] !== undefined) {
            deviceToUpdate[field] = device[field];
          }
        }
        await deviceToUpdate.save();
        pubsub.publish('deviceUpdated', { deviceUpdated: deviceToUpdate });
        return deviceToUpdate;
      } else {
        return new Error(`Device not found.`, { argumentName: '_id' });
      }
    } else {
      return new Error('No ID specified.', { argumentName: '_id' });
    }
  } catch (exception) {
    return exception;
  }
};

Device.deleteDevice = async function ({ id }, { user }, pubsub) {
  try {
    const device = await Device.findById(id)
      
    if (device) {
      device.deleted = true;
      const res = await device.save();
      pubsub.publish('deviceDeleted', { deviceDeleted: res });
      return 
    } else {
      return new Error(`Device not found.`, { argumentName: '_id' });
    }
  } catch (exception) {
    return exception;
  }
};

export default Device;