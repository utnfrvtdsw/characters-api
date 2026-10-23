import { Pool } from 'pg';
import { MongoClient } from 'mongodb';
import { config } from '../config';
import { CharacterRepository } from '../character/character.repository.interface';
import { CharacterRepositoryPostgres } from '../character/character.repository.postgres';
import { CharacterRepositoryMongodb } from '../character/character.repository.mongodb';
import { logger } from '../observability/logger.service';

export interface DatabaseProvider {
    characterRepository: CharacterRepository;
    close: () => Promise<void>;
}

export function createDatabaseProvider(): DatabaseProvider {
    if (config.dbEngine === 'mongodb') {
        const dbLogger = logger.child({ dbEngine: 'mongodb', database: config.mongo.database });
        const mongoClient = new MongoClient(config.mongo.uri);
        dbLogger.info('Database client initialized; connection opens on first query');
        mongoClient.on('connectionCreated', ({ connectionId }) => {
            dbLogger.debug({ connectionId }, 'Opening database connection');
        });
        mongoClient.on('connectionReady', ({ connectionId }) => {
            dbLogger.info({ connectionId }, 'Database connection ready');
        });
        mongoClient.on('connectionClosed', ({ connectionId, reason }) => {
            if (reason === 'error') {
                dbLogger.error({ connectionId, reason }, 'Database connection closed with error');
            } else {
                dbLogger.debug({ connectionId, reason }, 'Database connection closed');
            }
        });
        mongoClient.on('serverHeartbeatFailed', ({ failure }) => {
            dbLogger.error({ err: failure }, 'Database heartbeat failed');
        });
        const characterRepository = new CharacterRepositoryMongodb(mongoClient, config.mongo.database);
        return {
            characterRepository,
            close: async () => {
                dbLogger.info('Closing database client');
                try {
                    await mongoClient.close();
                    dbLogger.info('Database client closed');
                } catch (error) {
                    dbLogger.error({ err: error }, 'Failed to close database client');
                    throw error;
                }
            },
        };
    }

    const pool = new Pool(config.postgres);
    const dbLogger = logger.child({
        dbEngine: 'postgres',
        database: config.postgres.database,
        host: config.postgres.host,
        port: config.postgres.port,
    });
    dbLogger.info('Database pool initialized; connection opens on first query');
    pool.on('connect', () => {
        dbLogger.info('Database connection ready');
    });
    pool.on('remove', () => {
        dbLogger.debug('Database connection removed from pool');
    });
    pool.on('error', (error) => {
        dbLogger.error({ err: error }, 'Idle database connection error');
    });
    const characterRepository = new CharacterRepositoryPostgres(pool);
    return {
        characterRepository,
        close: async () => {
            dbLogger.info('Closing database pool');
            try {
                await pool.end();
                dbLogger.info('Database pool closed');
            } catch (error) {
                dbLogger.error({ err: error }, 'Failed to close database pool');
                throw error;
            }
        },
    };
}
