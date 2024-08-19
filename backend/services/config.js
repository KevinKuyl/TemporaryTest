import dotenv from 'dotenv';
if (!process.env.db_protocol) {
    dotenv.config();
}
const config = {
    dev: process.env.dev,
    import: process.env.import,
    database:{
        host: process.env.db_host,
        port: process.env.db_port,
        user: process.env.db_user,
        protocol: process.env.db_protocol,
        pass: process.env.db_pass,
        name: process.env.db_name
    },
    token: {
        private: process.env.private_key,
        public: "shhhhhhared-secret"
        //private: process.env.private_key,
        //public: process.env.public_key
    },
    ports: {
        com: process.env.com_port
    },
};

export { config };
