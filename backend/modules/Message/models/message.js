import uniqueValidator from 'mongoose-unique-validator';
import timestamps from 'mongoose-timestamp';
import Mongoose from 'mongoose';

export const MessageSchema = new Mongoose.Schema({
  user: {
    type: Mongoose.Schema.Types.ObjectId,
    required: true,
    unique: false,
    ref: "User"
  },
  messageContent: {
    type: String,
    required: true,
    unique: false
  },
  deleted: {
    type: Boolean,
    default: false
  },
  // replies: {
  //   type: [Mongoose.Schema.Types.ObjectId],
  //   required: false,
  //   unique: false,
  //   ref: "Message"
  // }
}, {
  collection: 'message',
  toObject: { getters: true },
  toJSON: { getters: true }
}
);

MessageSchema.plugin(uniqueValidator);
MessageSchema.plugin(timestamps);
//soft deletes

MessageSchema.index({ createdAt: 1, updatedAt: 1 });

const Message = Mongoose.model('Message', MessageSchema);

//Queries
Message.getMessageById = async function ({ _id }) {
  try {
    const message = await Message.findById(_id)
      .populate('user')
    // .populate('replies')
    // .populate('replies.user')
    if (message) {
      return message;
    } else {
      return new Error(`Message not found.`, { argumentName: '_id' });
    }
  } catch (exception) {
    return exception;
  }
}

Message.findMessages = async ({ filter, offset, limit, sort }) => {
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
  const messages = await Message.find(filter, null, { skip: offset, limit: limit, sort: sort })
    .populate('user')
  // .populate('replies')
  // .populate('replies.user')
  const total = await Message.countDocuments(filter);
  return {
    messages,
    total
  };
}

// Mutations
Message.createMessage = async function ({ message }, { user }, pubsub) {
  message.user = user.sub;
  try {
    const newMessage = await Message.create(message)
    const result = await Message.find({ _id: newMessage._id })
      .populate('user')
    // .populate('replies') 
    // .populate('replies.user')
    pubsub.publish('messageCreated', { messageCreated: result[0] });
    return result[0];
  } catch (exception) {
    return exception;
  }
};

Message.updateMessage = async function ({ message }, { user }, pubsub) {
  message.user = user.sub;
  try {
    if (message._id) {
      //findandupdate
      const res = await Message.findOneAndUpdate({ _id: message._id }, message, { new: true })
        .populate('user')
      pubsub.publish('messageUpdated', { messageUpdated: res });
      return res;
    } else {
      return new Error('No ID specified.', { argumentName: '_id' });
    }
  } catch (exception) {
    return exception;
  }
};

Message.deleteMessage = async function ({ _id }, { user }, pubsub) {
  try {
    const message = await Message.findById(_id)
      .populate('user');
    if (message) {
      message.deleted = true;
      const res = await message.save();
      pubsub.publish('messageDeleted', { messageDeleted: res });
      return res;
    } else {
      return new Error(`Message not found.`, { argumentName: '_id' });
    }
  } catch (exception) {
    return exception;
  }
};

export default Message;