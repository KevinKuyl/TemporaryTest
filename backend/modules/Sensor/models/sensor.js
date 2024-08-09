import uniqueValidator from 'mongoose-unique-validator';
import timestamps from 'mongoose-timestamp';
import Mongoose from 'mongoose';

export const SensorSchema = new Mongoose.Schema(
  {
  name: {
    type: String,
    required: false,
    unique: false
  },
  values: {
    type: String,
    required: false,
    unique: false
  }
}, {
  collection: 'sensor',
  toObject: { getters: true },
  toJSON: { getters: true }
}
);

SensorSchema.plugin(uniqueValidator);
SensorSchema.plugin(timestamps);
SensorSchema.index({ createdAt: 1, updatedAt: 1 });

const Sensor = Mongoose.model('Sensor', SensorSchema);

//Queries
Sensor.getSensorById = async function (id) {
  try {
    const sensor = await Sensor.findById(id)
      
    if (sensor) {
      return sensor;
    } else {
      return new Error(`Sensor not found.`, { argumentName: '_id' });
    }
  } catch (exception) {
    return exception;
  }
}

Sensor.findSensors = async ({ filter, offset, limit, sort }) => {
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
  const sensors = await Sensor.find(filter, null, { skip: offset, limit: limit, sort: sort })
    
  const total = await Sensor.countDocuments(filter);
  return {
    sensors,
    total
  };
}

// Mutations
Sensor.createSensor = async function ({ sensor }, { user }, pubsub) {
  try {
    const newSensor = await Sensor.create(sensor)
    const result = await Sensor.find({ _id: newSensor._id })
      
    pubsub.publish('sensorCreated', { sensorCreated: result[0] });
    return result[0];
  } catch (exception) {
    return exception;
  }
};

Sensor.updateSensor = async function ({ sensor }, { user }, pubsub) {
  try {
    if (sensor._id) {
      let sensorToUpdate = await Sensor.findById(sensor._id)
        
      if (sensorToUpdate) {
        for (let field in sensor) {
          if (sensorToUpdate[field] !== sensor[field] &&
            sensor[field] !== undefined) {
            sensorToUpdate[field] = sensor[field];
          }
        }
        await sensorToUpdate.save();
        pubsub.publish('sensorUpdated', { sensorUpdated: sensorToUpdate });
        return sensorToUpdate;
      } else {
        return new Error(`Sensor not found.`, { argumentName: '_id' });
      }
    } else {
      return new Error('No ID specified.', { argumentName: '_id' });
    }
  } catch (exception) {
    return exception;
  }
};

Sensor.deleteSensor = async function ({ id }, { user }, pubsub) {
  try {
    const sensor = await Sensor.findById(id)
      
    if (sensor) {
      sensor.deleted = true;
      const res = await sensor.save();
      pubsub.publish('sensorDeleted', { sensorDeleted: res });
      return 
    } else {
      return new Error(`Sensor not found.`, { argumentName: '_id' });
    }
  } catch (exception) {
    return exception;
  }
};

export default Sensor;