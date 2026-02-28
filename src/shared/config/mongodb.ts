import mongoose from 'mongoose';
import config from './index';
import logger from './logger';


// singleton design(creational) pattern for  mongodb connection
// only one single instanct of the  class for the whole application
class MongoConnection{
    connection: mongoose.Connection | null;
    constructor(){
        this.connection = null;
    }

    /**
     * Connect to MongoDB
     * @returns Promise<mongoose.Connection>
     */
    async connect(){
        try {
            if (this.connection) {
                logger.info('MongoDB connection already exists');
                return this.connection;
            }

            await mongoose.connect(config.mongo.uri, { dbName: config.mongo.dbName });
            logger.info(`Connected to MongoDB at ${config.mongo.uri}`);
            this.connection = mongoose.connection;
            this.connection.on("error", (err: Error) => {
                logger.error('MongoDB connection error:', err);
            });
            this.connection.on("disconnected", () => {
                logger.error('MongoDB disconnected');
            });

            return this.connection;
        } catch (error) {
            logger.error('Failed to connect to MongoDB:', error);
            throw error;
        }
    }
    /**
     * Disconnect from MongoDB
     */
    async disconnect(){
        try {
            if (this.connection) {
                await mongoose.disconnect();
                this.connection = null;
                logger.info('Disconnected from MongoDB');
            }
        } catch (error) {
            logger.error('Failed to disconnect from MongoDB:', error);
            throw error  ;
        }
    }

    /**
     * Get the current MongoDB connection
     * @returns {mongoose.Connection | null}
     */
    getConnection(){
        return this.connection;
    }
}


const  mongoConnection = new MongoConnection();
export default mongoConnection;