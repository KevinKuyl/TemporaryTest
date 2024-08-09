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
    DOSpaces: {
        accessKeyId: process.env.do_spaces_access_key_id,
        secretAccessKey: process.env.do_spaces_secret_access_key
    },
    mail: {
        host: process.env.mail_host,
        password: process.env.mail_password,
        user: process.env.mail_user,
        from: process.env.mail_from,
        port: process.env.mail_port
    }
};

export { config };
