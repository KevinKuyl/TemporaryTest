import uniqueValidator from 'mongoose-unique-validator';
import timestamps from 'mongoose-timestamp';
import Mongoose from 'mongoose';

export const AutomationSchema = new Mongoose.Schema(
  {
  name: {
    type: String,
    required: true,
    unique: true
  },
  inModel: {
    type: String,
    required: true,
    unique: false
  },
  inId: {
    type: String,
    required: true,
    unique: false
  },

  setModel: {
    type: String,
    required: true,
    unique: false
  },
  setId: {
    type: String,
    required: true,
    unique: false
  },
}, {
  collection: 'automation',
  toObject: { getters: true },
  toJSON: { getters: true }
}
);

AutomationSchema.plugin(uniqueValidator);
AutomationSchema.plugin(timestamps);
AutomationSchema.index({ createdAt: 1, updatedAt: 1 });

const Automation = Mongoose.model('Automation', AutomationSchema);

//Queries
Automation.getAutomationById = async function (id) {
  try {
    const automation = await Automation.findById(id)
      
    if (automation) {
      return automation;
    } else {
      return new Error(`Automation not found.`, { argumentName: '_id' });
    }
  } catch (exception) {
    return exception;
  }
}

Automation.findAutomations = async ({ filter, offset, limit, sort }) => {
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
  const automations = await Automation.find(filter, null, { skip: offset, limit: limit, sort: sort })
    
  const total = await Automation.countDocuments(filter);
  return {
    automations,
    total
  };
}

// Mutations
Automation.createAutomation = async function ({ automation }, { user }, pubsub) {
  try {
    const newAutomation = await Automation.create(automation)
    const result = await Automation.find({ _id: newAutomation._id })
      
    pubsub.publish('automationCreated', { automationCreated: result[0] });
    return result[0];
  } catch (exception) {
    return exception;
  }
};

Automation.updateAutomation = async function ({ automation }, { user }, pubsub) {
  try {
    if (automation._id) {
      let automationToUpdate = await Automation.findById(automation._id)
        
      if (automationToUpdate) {
        for (let field in automation) {
          if (automationToUpdate[field] !== automation[field] &&
            automation[field] !== undefined) {
            automationToUpdate[field] = automation[field];
          }
        }
        await automationToUpdate.save();
        pubsub.publish('automationUpdated', { automationUpdated: automationToUpdate });
        return automationToUpdate;
      } else {
        return new Error(`Automation not found.`, { argumentName: '_id' });
      }
    } else {
      return new Error('No ID specified.', { argumentName: '_id' });
    }
  } catch (exception) {
    return exception;
  }
};

Automation.deleteAutomation = async function ({ id }, { user }, pubsub) {
  try {
    const automation = await Automation.findById(id)
      
    if (automation) {
      automation.deleted = true;
      const res = await automation.save();
      pubsub.publish('automationDeleted', { automationDeleted: res });
      return 
    } else {
      return new Error(`Automation not found.`, { argumentName: '_id' });
    }
  } catch (exception) {
    return exception;
  }
};

export default Automation;