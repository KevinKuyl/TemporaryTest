import { createModule, gql } from 'graphql-modules';
import {login} from './auth/auth.js';
import Composer from '../../utils/Composer.js';
import Model from './models/user.js';

const typeDefs = Composer.GQLFromModel(Model, {
    exclude: ['delete', 'active', 'role'],
    queries: ['viewer: User!'],
    types: [
        `type AuthResult {
            accessToken: String, 
        }`
    ],
    mutations: [
        'login(email: String, password: String): AuthResult!', 
        'refresh(refreshToken: String, accessToken: String): AuthResult!'
    ],
    root: true,
    log: false
});

const resolvers = Composer.resolversFromModel(Model, {
    queries: {viewer: 'viewer'},
    mutations: {login: login, refresh: 'refresh'},
    log: false
});

export default createModule({
    id: 'user',
    dirname: 'User',
    typeDefs,
    resolvers
});
