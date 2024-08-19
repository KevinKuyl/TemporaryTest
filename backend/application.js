import {createApplication} from 'graphql-modules';
import PWMDevice from './modules/PWMDevice/PWMDevice.js';
import Encoder from './modules/Encoder/Encoder.js';
import Sonar from './modules/Sonar/Sonar.js';
import Device from './modules/Device/Device.js';
import Input from './modules/Input/Input.js';
import Sensor from './modules/Sensor/Sensor.js';
import Message from './modules/Message/Message.js';
import User from './modules/User/User.js';
import Utilities from './modules/Utilities/Utilities.js';
import Automation from './modules/Automation/Automation.js';

export const application = createApplication({
    modules: [Utilities, User, Message, Sensor, Input, Device, Sonar, Encoder, PWMDevice, Automation]
});