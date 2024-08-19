import { createModule, gql } from 'graphql-modules';
import Composer from '../../utils/Composer.js';
import Model from './models/pwmdevice.js';

const typeDefs = Composer.GQLFromModel(Model, {
  // exclude: ['user'],
  // queries: ['myPWMDevice: [PWMDevice]!'],
  // mutations: ['upsertFullPWMDevice(pwmdevice: [UpdatePWMDeviceInput]): [PWMDevice]!'],
  // subscriptions: ['pwmdeviceAdded: PWMDevice'],
  log: false
});

const resolvers = Composer.resolversFromModel(Model, {
  // queries: { myPWMDevice: 'getFullPWMDevice' },
  // mutations: { upsertFullPWMDevice: 'upsertFullPWMDevice' },
  //subscriptions: { 
    //public: {pwmdeviceAdded: 'pwmdeviceAdded'},
    //private: {pwmdeviceAdded: 'pwmdeviceAdded'} // not implemented yet
  // },
  log: false
});

export default createModule({
  id: 'pwmdevice',
  dirname: 'PWMDevice',
  typeDefs,
  resolvers
});
