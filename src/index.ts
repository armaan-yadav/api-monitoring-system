import cors from 'cors';
import express from 'express';
import figlet from 'figlet';
import helmet from 'helmet';
import authRouter from './services/auth/routes/authRouter';
import logger from './shared/config/logger';
import mongoConnection from './shared/config/mongodb';
import postgresConnection from './shared/config/postgres';
import rabbitMQConnection from './shared/config/rabbitmq';
import errorHandler from './shared/middlewares/errorHandler';
import ResponseFormatter from './shared/utils/responseFormatter';
import cookieParser from 'cookie-parser';

const app = express();
const port = process.env.PORT || 3000;

// middlewares
app.use(express.json());
app.use(helmet());
app.use(cors({
    origin : true,
    credentials : true,
}));
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }));

// logging
app.use((req, _, next) => {
    logger.info(`${req.method} ${req.url}`, {
        ip: req.ip,
        userAgent: req.headers['user-agent'] || 'unknown',
    });
    next();
});

// health check
app.get('/health', (req, res) => {
    res.status(200).json(
        ResponseFormatter.success(200, 'Service is healthy  ', {
            uptime: process.uptime(),
            timeStamp: new Date().toISOString(),
        })
    );
});

app.get('/', (req, res) => {
    res.send('Hello!');
});

app.use('/api/v1/auth', authRouter);

// 404 handler
app.use((req, res) => {
    res.status(404).json(ResponseFormatter.error(404, 'Route not found'));
});

// error handler middleware
app.use(errorHandler);

async function initializeConnection() {
    try {
        logger.info('Initializing connectins...');

        //connect to mongodb
        logger.info('Connecting to MongoDB...');
        await mongoConnection.connect();
        logger.info('MongoDB connection established successfully!');
        // connect  to postgres db
        logger.info('Connecting to PostgreSQL...');
        await postgresConnection.testConnection();
        logger.info('PostgreSQL connection established successfully!');
        // connect to rabbbitmq
        logger.info('Connecting to RabbitMQ...');
        await rabbitMQConnection.connect();
        logger.info('RabbitMQ connection established successfully!');
        logger.info('All connections initialized successfully!');
    } catch (error) {
        logger.error('Error while initializing connection: ', error);
        throw error;
    }
}

(async () => {
    try {
        await initializeConnection();
        const server = app.listen(port, async () => {
            const text = await figlet.text('Namaste Duniya!');
            console.log(text);
            console.log(`Listening on port ${port}...`);
        });

        const gracefulShutdown = async (signal: string) => {
            logger.info(`Received signal ${signal}. Shutting down gracefully...`);
            server.close(async () => {
                logger.info('HTTP server closed.');

                try {
                    await mongoConnection.disconnect();
                    await postgresConnection.disconnect();
                    await rabbitMQConnection.disconnect();
                    logger.info('All connections closed, exiting process');
                    process.exit(0);
                } catch (error) {
                    logger.error('Error during shutdown: ', error);
                    process.exit(1);
                }
            });
            setTimeout(() => {
                logger.warn('Forcing shutdown after 10 seconds');
                process.exit(1);
            }, 10000);
        };

        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    } catch (error) {
        logger.error('Error starting server: ', error);
        process.exit(1);
    }
})();
