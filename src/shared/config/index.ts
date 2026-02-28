import dotenv from 'dotenv';

dotenv.config()

const config = {
    // Server config
    node_env : process.env.NODE_ENV || 'development',
    // by default, values imported from .env file are strings, so we need to parse it to number
    // in express, it automatically converts the port to number
    port : parseInt(process.env.PORT || '5000',10),

    // Mongodb config
    mongo :{
        uri : process.env.MONGO_URI || 'mongodb://localhost:27017/api_monitoring',
        dbName  : process.env.MONGO_DB_NAME || 'api_monitoring',
    },

    // PostgresSQL config
    postgres:{
        host : process.env.POSTGRES_HOST || 'localhost',
        port : parseInt(process.env.POSTGRES_PORT || '5432',10),
        database : process.env.POSTGRES_DB || 'api_monitoring', 
        user : process.env.POSTGRES_USER || 'postgres',
        password : process.env.POSTGRES_PASSWORD || 'password',
    },

    // rabbitmq config
    rabbitmq:{
        // amqp -> Advanced Message Queuing Protocol used in rabbitmq
        url : process.env.RABBITMQ_URL || 'amqp://localhost:5672',
        queue : process.env.RABBITMQ_QUEUE || 'api_monitoring_queue',
        publisherConfirms : process.env.RABBITMQ_PUBLISHER_CONFIRMS === 'true' || false, // acknowledgement from the server that the message has been received and processed
        retryAttempts : parseInt(process.env.RABBITMQ_RETRY_ATTEMPTS || '5',10),
        retryDelay : parseInt(process.env.RABBITMQ_RETRY_DELAY || '1000',10),  // in milliseconds
    },

    jwt : {
        secret : process.env.JWT_SECRET || 'secret_hai_kyun_batau',
        expiresIn : process.env.JWT_EXPIRES_IN || '24h', 
    },

    rateLimit:{
        windowMs : parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000',10), // 15 minute
        maxRequests : parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000',10), // limit each IP to 1000 requests per windowMs
    }

}

export default config;