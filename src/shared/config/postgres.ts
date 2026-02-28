import pg from 'pg';
import config from './index';
import logger from './logger';

const { Pool } = pg

class PostgresConnection{
    pool : pg.Pool | null = null;
    constructor(){
        this.pool = null;
    }

    getPool(): pg.Pool | null{
        if(!this.pool){
            this.pool = new Pool({
                host: config.postgres.host,
                port: config.postgres.port,
                user: config.postgres.user,
                password: config.postgres.password,
                database: config.postgres.database,
                max: 20,
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 2000
            });

            this.pool.on('error', (err: Error) => {
                logger.error('Unexpected error on idle client', err);
                process.exit(-1);
            });
            logger.info(`PostgreSQL pool created for ${config.postgres.host}:${config.postgres.port}/${config.postgres.database}`);
        }
        return this.pool;
    }

    async testConnection(){
        try {
            const pool = this.getPool();
            if(!pool){
                throw new Error('PostgreSQL pool not initialized');
            }
            const client =  await pool.connect();
            const result  = await client.query('SELECT NOW()');
            logger.info('PostgreSQL connection test successful:', result.rows[0]);
            client.release();
        } catch (error) {
            logger.error('PostgreSQL connection test failed:', error);
        }
    }

    async query(text: string, params?: any[]){ 
        const  pool = this.getPool();
        const start = Date.now(); 
        try {
            const res = await pool?.query(text, params);
            const duration = Date.now() - start;
            logger.info('Executed query', { text, duration, rows: res?.rowCount });
            return res;
        } catch (error) {
            logger.error('Error executing query', { text, error });
            throw error;
        }
    }

    async disconnect(){
        if(this.pool){
            await this.pool.end();
            this.pool = null;
            logger.info('PostgreSQL pool has been closed');
        }
    }
}

const postgresConnection = new PostgresConnection();
export default postgresConnection;