import express from 'express';
import { CharacterRoutes } from './character/character.routes';
import { CharacterService } from './character/character.service';
import { CharacterController } from './character/character.controller';
import { config } from './config';
import { createDatabaseProvider, DatabaseProvider } from './db/database.factory';

export class App {

    public readonly app;
    private readonly database: DatabaseProvider;

    constructor() {
        this.app = express();
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));

        this.database = createDatabaseProvider();
        console.log(`Database engine: ${config.dbEngine}`);

        const characterService = new CharacterService(this.database.characterRepository);
        const characterController = new CharacterController(characterService);
        const characterRoutes = new CharacterRoutes(characterController);

        this.app.use('/api', characterRoutes.router);
    }

    public start() {
        this.app.listen(config.port, () => {
            console.log(`Server is running on port ${config.port}`);
        });
        console.log('App started');
    }

    public async close() {
        await this.database.close();
    }
}
