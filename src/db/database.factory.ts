import { Pool } from 'pg';
import { MongoClient } from 'mongodb';
import { config } from '../config';
import { CharacterRepository } from '../character/character.repository.interface';
import { CharacterRepositoryPostgres } from '../character/character.repository.postgres';
import { CharacterRepositoryMongodb } from '../character/character.repository.mongodb';

export interface DatabaseProvider {
    characterRepository: CharacterRepository;
    close: () => Promise<void>;
}

export function createDatabaseProvider(): DatabaseProvider {
    if (config.dbEngine === 'mongodb') {
        const mongoClient = new MongoClient(config.mongo.uri);
        const characterRepository = new CharacterRepositoryMongodb(mongoClient, config.mongo.database);
        return {
            characterRepository,
            close: async () => {
                await mongoClient.close();
            },
        };
    }

    const pool = new Pool(config.postgres);
    const characterRepository = new CharacterRepositoryPostgres(pool);
    return {
        characterRepository,
        close: async () => {
            await pool.end();
        },
    };
}
