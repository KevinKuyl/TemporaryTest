import uniqueValidator from 'mongoose-unique-validator';
import timestamps from 'mongoose-timestamp';
import Mongoose from 'mongoose';

export const SonarSchema = new Mongoose.Schema(
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
  distance: {
    type: String,
    required: true,
    unique: false,
    default: "0"
  }
}, {
  collection: 'sonar',
  toObject: { getters: true },
  toJSON: { getters: true }
}
);

SonarSchema.plugin(uniqueValidator);
SonarSchema.plugin(timestamps);
SonarSchema.index({ createdAt: 1, updatedAt: 1 });

const Sonar = Mongoose.model('Sonar', SonarSchema);

//Queries
Sonar.getSonarById = async function (id) {
  try {
    const sonar = await Sonar.findById(id)
      
    if (sonar) {
      return sonar;
    } else {
      return new Error(`Sonar not found.`, { argumentName: '_id' });
    }
  } catch (exception) {
    return exception;
  }
}

Sonar.findSonars = async ({ filter, offset, limit, sort }) => {
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
  const sonars = await Sonar.find(filter, null, { skip: offset, limit: limit, sort: sort })
    
  const total = await Sonar.countDocuments(filter);
  return {
    sonars,
    total
  };
}

// Mutations
Sonar.createSonar = async function ({ sonar }, { user }, pubsub) {
  try {
    const newSonar = await Sonar.create(sonar)
    const result = await Sonar.find({ _id: newSonar._id })
      
    pubsub.publish('sonarCreated', { sonarCreated: result[0] });
    return result[0];
  } catch (exception) {
    return exception;
  }
};

Sonar.updateSonar = async function ({ sonar }, { user }, pubsub) {
  try {
    if (sonar._id) {
      let sonarToUpdate = await Sonar.findById(sonar._id)
        
      if (sonarToUpdate) {
        for (let field in sonar) {
          if (sonarToUpdate[field] !== sonar[field] &&
            sonar[field] !== undefined) {
            sonarToUpdate[field] = sonar[field];
          }
        }
        await sonarToUpdate.save();
        console.log('emitting sonarUpdated');
        await pubsub.publish('sonarUpdated', { sonarUpdated: sonarToUpdate });
        console.log('sonarUpdated emitted');
        return sonarToUpdate;
      } else {
        return new Error(`Sonar not found.`, { argumentName: '_id' });
      }
    } else {
      return new Error('No ID specified.', { argumentName: '_id' });
    }
  } catch (exception) {
    return exception;
  }
};

Sonar.deleteSonar = async function ({ id }, { user }, pubsub) {
  try {
    const sonar = await Sonar.findById(id)
      
    if (sonar) {
      sonar.deleted = true;
      const res = await sonar.save();
      pubsub.publish('sonarDeleted', { sonarDeleted: res });
      return 
    } else {
      return new Error(`Sonar not found.`, { argumentName: '_id' });
    }
  } catch (exception) {
    return exception;
  }
};

export default Sonar;