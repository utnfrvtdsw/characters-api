import express from 'express';
import { Pool } from 'pg';
import { CharacterRoutes } from './character/character.routes';
import { CharacterService } from './character/character.service';
import { CharacterController } from './character/character.controller';
import { CharacterRepositoryPostgres } from './character/character.repository.postgres';
import { MongoClient } from 'mongodb';
import { Character } from './character/character.entity';
import { CharacterRepositoryMongodb } from './character/character.repository.mongodb';

export class App {

    public readonly app;
    private readonly dbPool: Pool;

    constructor() {
        this.app = express();
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));

        this.dbPool = new Pool({
            user: 'postgres',
            host: 'localhost',
            database: 'characters_db',
            password: 'postgres',
            port: 5432,
        });

        const uri = 'mongodb://root:example@localhost:27017/';
        const mongoClient = new MongoClient(uri);

        //const characterRepository = new CharacterRepositoryPostgres(this.dbPool);
        const characterRepository = new CharacterRepositoryMongodb(mongoClient);
        const characterService = new CharacterService(characterRepository);
        const characterController = new CharacterController(characterService);
        const characterRoutes = new CharacterRoutes(characterController);

        this.app.use('/api', characterRoutes.router);
    }

    public start() {
        this.app.listen(3000, () => {
            console.log('Server is running on port 3000');
        });
        console.log('App started');
    }

    public async close() {
        await this.dbPool.end();
    }
}
