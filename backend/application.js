import {createApplication} from 'graphql-modules';
import Sensor from './modules/Sensor/Sensor.js';
import Message from './modules/Message/Message.js';
import User from './modules/User/User.js';
import Utilities from './modules/Utilities/Utilities.js';

export const application = createApplication({
    modules: [Utilities, User, Message, Sensor]
});