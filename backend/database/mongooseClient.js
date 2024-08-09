import mongoose from 'mongoose';
import {config} from '../services/config.js';

mongoose.Promise = global.Promise;
mongoose.set('strictQuery', false);

const mongoClient = {
    async connect(test = false) {
        useTrimOnAllStrings();
        let uri = `${config.database.protocol}://${config.database.user}:${config.database.pass}@${config.database.host}`;
        let options = {useUnifiedTopology: true, useNewUrlParser: true, dbName: config.database.name, sslValidate: false};
        if (config.dev === 'true' && config.database.name === undefined) {
            uri = 'mongodb://127.0.0.1:27017';
            options.dbName = `${config.database.name}_dev`;
        }
        if (test) {
            uri = 'mongodb://127.0.0.1:27017';
            options.dbName = `${config.database.name}_test`;
        }
        return mongoose.connect(uri, options);
    },
    async disconnect() {
        await mongoose.disconnect ()
    }
}

function useTrimOnAllStrings() {
    mongoose.Schema.Types.String.set('trim', true);
}

export default mongoClient;
