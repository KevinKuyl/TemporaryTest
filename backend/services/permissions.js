import {allow, or,and, rule, shield} from "graphql-shield";

const isAuthenticated = rule()((parent, args, {user}) => {
    return user !== null;
});

function getRoles(user) {
    if (user && user["http://localhost:4000/graphql"]) {
        return user["http://localhost:4000/graphql"].roles;
    }
    return '';
}

const isAdmin = rule()((parent, args, {user}) => {
    const userRole = getRoles(user);
    return userRole === "Admin"
});

const isReadingOwnAccount = rule()((parent, args, {user}) => {
    return user && user.sub === args._id;
});

const isUpdatingOwnAccount = rule()((parent, args, {user}) => {
    return user && user.sub === args.user._id;
});

const permissions = shield({
        Query: {
            '*': allow,
        },
        Mutation: {
            '*': allow,
        }
    },
    {allowExternalErrors: true}
);

export {permissions};
