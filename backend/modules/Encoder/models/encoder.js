import uniqueValidator from 'mongoose-unique-validator';
import timestamps from 'mongoose-timestamp';
import Mongoose from 'mongoose';
import Automation from '../../Automation/models/automation.js';
import rotaryEncoder from '../../../utils/RotaryEncoder.js';
import PWMDevice from '../../PWMDevice/models/pwmDevice.js';

export const EncoderSchema = new Mongoose.Schema(
  {
  name: {
    type: String,
    required: true,
    unique: true
  },
  upPin: {
    type: String,
    required: true,
    unique: true
  },
  downPin: {
    type: String,
    required: true,
    unique: true
  },
  buttonPin: {
    type: String,
    required: true,
    unique: true
  },
  value: {
    type: Number,
    required: true,
    unique: false
  },
  range: {
    type: [Number],
    required: true,
    unique: false,
    default: [0, 100]
  },
  step: {
    type: Number,
    required: true,
    unique: false,
    default: 1
  }
}, {
  collection: 'encoder',
  toObject: { getters: true },
  toJSON: { getters: true }
}
);

EncoderSchema.plugin(uniqueValidator);
EncoderSchema.plugin(timestamps);
EncoderSchema.index({ createdAt: 1, updatedAt: 1 });

const Encoder = Mongoose.model('Encoder', EncoderSchema);

//Queries
Encoder.getEncoderById = async function (id) {
  try {
    const encoder = await Encoder.findById(id)
      
    if (encoder) {
      return encoder;
    } else {
      return new Error(`Encoder not found.`, { argumentName: '_id' });
    }
  } catch (exception) {
    return exception;
  }
}

Encoder.findEncoders = async ({ filter, offset, limit, sort }) => {
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
  const encoders = await Encoder.find(filter, null, { skip: offset, limit: limit, sort: sort })
    
  const total = await Encoder.countDocuments(filter);
  return {
    encoders,
    total
  };
}

// Mutations
Encoder.createEncoder = async function ({ encoder }, { user }, pubsub) {
  try {
    const newEncoder = await Encoder.create(encoder)
    const result = await Encoder.find({ _id: newEncoder._id })
      
    pubsub.publish('encoderCreated', { encoderCreated: result[0] });
    return result[0];
  } catch (exception) {
    return exception;
  }
};

Encoder.updateEncoder = async function ({ encoder }, { user }, pubsub) {
  try {
    if (encoder._id) {
      let encoderToUpdate = await Encoder.findById(encoder._id)
      
      let automations = await Automation.find({
        inModel: "Encoder",
        inId: encoder._id,
      }).exec();
        
      if (encoderToUpdate) {
        for (let field in encoder) {
          if (encoderToUpdate[field] !== encoder[field] &&
            encoder[field] !== undefined) {
            encoderToUpdate[field] = encoder[field];
          }
        }

        automations.forEach(async (automation) => {
          switch (automation.setModel) {
            case "PWMDevice":
              const device = await PWMDevice.findById(automation.setId).exec();
              if (device) {
                device.value = encoderToUpdate.value;
                // update the device
                // const pwm = new five.Led(device.pin);
                // pwm.brightness(device.value);
                automation.value = encoderToUpdate.value;
                await Automation.updateAutomation({ automation }, {}, pubsub);
                await PWMDevice.updatePWMDevice({ pwmdevice: device }, {}, pubsub);
              }
              break;
            default:
              break;
          }
        });   

        await encoderToUpdate.save();
        pubsub.publish('encoderUpdated', { encoderUpdated: encoderToUpdate });
        return encoderToUpdate;
      } else {
        return new Error(`Encoder not found.`, { argumentName: '_id' });
      }
    } else {
      return new Error('No ID specified.', { argumentName: '_id' });
    }
  } catch (exception) {
    return exception;
  }
};

Encoder.deleteEncoder = async function ({ id }, { user }, pubsub) {
  try {
    const encoder = await Encoder.findById(id)
      
    if (encoder) {
      encoder.deleted = true;
      const res = await encoder.save();
      pubsub.publish('encoderDeleted', { encoderDeleted: res });
      return 
    } else {
      return new Error(`Encoder not found.`, { argumentName: '_id' });
    }
  } catch (exception) {
    return exception;
  }
};

export default Encoder;