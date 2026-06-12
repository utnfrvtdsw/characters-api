export type DbEngine = 'postgres' | 'mongodb';

export interface PostgresConfig {
    user: string;
    host: string;
    database: string;
    password: string;
    port: number;
}

export interface MongoConfig {
    uri: string;
    database: string;
}

export interface AppConfig {
    port: number;
    dbEngine: DbEngine;
    postgres: PostgresConfig;
    mongo: MongoConfig;
}

export const config: AppConfig = {
    port: Number(process.env.PORT ?? 3000),
    dbEngine: (process.env.DB_ENGINE as DbEngine) ?? 'postgres',
    postgres: {
        user: process.env.POSTGRES_USER ?? 'postgres',
        host: process.env.POSTGRES_HOST ?? 'localhost',
        database: process.env.POSTGRES_DB ?? 'characters_db',
        password: process.env.POSTGRES_PASSWORD ?? 'postgres',
        port: Number(process.env.POSTGRES_PORT ?? 5432),
    },
    mongo: {
        uri: process.env.MONGO_URI ?? 'mongodb://root:example@localhost:27017/',
        database: process.env.MONGO_DB ?? 'characters',
    },
};
