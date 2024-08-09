import uniqueValidator from 'mongoose-unique-validator';
import timestamps from 'mongoose-timestamp';
import Mongoose from 'mongoose';
import { hashPassword } from '../auth/auth.js';

export const UserSchema = new Mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  delete: {
    type: Boolean,
    required: true
  },
  active: {
    type: Boolean,
    required: true
  },
  jti: {
    type: String,
    required: false,
    unique: false
  },
  avatar: {
    type: String,
    required: false,
    unique: false
  }
},{
        collection: 'users',
        toObject: { getters: true },
        toJSON: { getters: true }
    }
);

UserSchema.plugin(uniqueValidator);
UserSchema.plugin(timestamps);
UserSchema.index({ createdAt: 1, updatedAt: 1 });

UserSchema.pre('save', async function (next) {
    const user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    try {
        user.password = await hashPassword(user.password);
        return next();
    } catch (error) {
        return next(error);
    }
});

const User = Mongoose.model('User', UserSchema);

User.getUserById = async function (_id) {
    const res = await User.findById(_id);
    res.password = '';
    console.log(res);
    return res;
};

User.findUsers = async function ({filter}) {
    const result = await User.find(filter);
    for (let i = 0; i < result.length; i++) {
        result[i].password = '';
    }
    console.log(result.length);
    return {
        users: result || [],
        total: result.length
    };
};

User.createUser = async function ({user}) {
    try {
        user.permissions = 'read:own_account update:own_account';
        user.delete = false;
        user.active = true;
        user.role = 'user';
        const newUser = await User.create(user);
        User.hideData(newUser);
        return newUser;
    } catch (exception) {
        return exception;
    }
};

User.updateUser = async function ({user}) {
    try {
        if (user._id) {
            let userToUpdate = await User.findById(user._id);
            if (userToUpdate) {
                // Only username and password can be changed
                if (user.name) {
                    userToUpdate.name = user.name;
                }
                // This assumes that the password is already validated with password rules
                if (user.password) {
                    userToUpdate.password = user.password;
                }

                if (user.avatar) {
                    userToUpdate.avatar = user.avatar;
                }
                await userToUpdate.save();
                userToUpdate.password = '';
                return userToUpdate;
            } else {
                return new Error(`User not found.`, { argumentName: '_id' });
            }
        } else {
            return new Error('No ID specified.', { argumentName: '_id' });
        }
    } catch (exception) {
        return exception;
    }
};

User.deleteUser = async function ({user}) {
    try {
        if (user._id) {
            let userToDelete = await User.findById(user._id);
            if (userToDelete) {
                userToDelete.delete = true;
                await userToDelete.save();
                userToDelete.hideData(userToDelete);
                return userToDelete;
            } else {
                return new Error(`User not found.`, { argumentName: '_id' });
            }
        } else {
            return new Error('No ID specified.', { argumentName: '_id' });
        }
    } catch (exception) {
        return exception;
    }
};

User.viewer = async function (_, {user}) {
    if (user) {
        const res = await User.getUserById(user.sub);
        res.password = '';
        return res;
    } else {
        return new Error('Not Logged in.');
    }
}

export default User;
