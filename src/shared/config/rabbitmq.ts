import amqp from 'amqplib'
import config from './index'
import logger from './logger'

class RabbitMQConnection {
    private connection: amqp.ChannelModel | null = null
    private channel: amqp.Channel | null = null
    private connectionPromise: Promise<amqp.Channel> | null = null

    async connect(): Promise<amqp.Channel> {
        if (this.channel) return this.channel
        if (this.connectionPromise) return this.connectionPromise

        this.connectionPromise = this._doConnect().finally(() => {
            this.connectionPromise = null
        })

        return this.connectionPromise
    }

    private async _doConnect(): Promise<amqp.Channel> {
        try {
            logger.info("Connecting to RabbitMQ,", config.rabbitmq.url)

            const connection = await amqp.connect(config.rabbitmq.url)
            const channel = await connection.createChannel()

            this.connection = connection
            this.channel = channel
            // Dead Letter queuee 
            const dlqName = `${config.rabbitmq.queue}.dlq`

            // durable : true => queue will persist even if  server resrarts
            await channel.assertQueue(dlqName, { durable: true })
            // normal queue with dead letter configured
            await channel.assertQueue(config.rabbitmq.queue, {
                durable: true,
                arguments: {
                    "x-dead-letter-exchange": "",
                    "x-dead-letter-routing-key": dlqName
                }
            })

            connection.on("close", () => {
                logger.warn("RabbitMQ connection closed, reconnecting...")
                this.connection = null
                this.channel = null
                setTimeout(() => this.connect(), 5000)
            })

            connection.on("error", (err) => {
                logger.warn("RabbitMQ connection error:", err)
                this.connection = null
                this.channel = null
                setTimeout(() => this.connect(), 5000)
            })

            logger.info("Connected to RabbitMQ, queue:", config.rabbitmq.queue)

            return channel

        } catch (error) {
            logger.error("Failed to connect to RabbitMQ:", error)
            throw error
        }
    }

    getChannel(): amqp.Channel | null {
        return this.channel
    }

    getStatus(): "connected" | "connecting" | "disconnected" {
        if (this.connectionPromise) return "connecting"
        if (this.connection && this.channel) return "connected"
        return "disconnected"
    }

    async close(): Promise<void> {
        this.connectionPromise = null

        try {
            if (this.channel) {
                await this.channel.close()
                this.channel = null
            }
            if (this.connection) {
                this.connection.removeAllListeners()
                await this.connection.close()
                this.connection = null
            }

            logger.info("RabbitMQ connection closed successfully")
        } catch (error) {
            logger.error("Error closing RabbitMQ connection:", error)
        }
    }
}

const rabbitMQConnection = new RabbitMQConnection()
export default rabbitMQConnection