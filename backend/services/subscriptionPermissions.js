import User from '../modules/User/models/user.js';

const allow = true
const deny = false;

const isAuthenticated = (payload, variables, context, info) => {
  return !!context.user;
}

const isAdmin = async (payload, variables, context, info) => {
  const user = await User.findOne({ _id: context.user.sub });
  return user.role === 'admin';
}



export const permissions = {
  async userCreated(payload, variables, context, info) {
    return await isAdmin(payload, variables, context, info);
  },
  async userUpdated(payload, variables, context, info) {
    return await isAdmin(payload, variables, context, info);
  },
  async userDeleted(payload, variables, context, info) {
    return await isAdmin(payload, variables, context, info);
  },

  messageCreated(payload, variables, context, info) {
    return isAuthenticated(payload, variables, context, info);
  },
  messageUpdated(payload, variables, context, info) {
    return isAuthenticated(payload, variables, context, info);
  },
  messageDeleted(payload, variables, context, info) {
    return isAuthenticated(payload, variables, context, info);
  }
}
