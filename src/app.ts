import express from 'express';
import { logger } from './observability/logger.service';
import { metrics } from './observability/metrics.service';
import { metricsMiddleware } from './observability/metrics.middleware';
import { CharacterRoutes } from './character/character.routes';
import { CharacterService } from './character/character.service';
import { CharacterController } from './character/character.controller';
import { config } from './config';
import cors from 'cors';
import { createDatabaseProvider, DatabaseProvider } from './db/database-provider.factory';

export class App {

    public readonly app;
    private readonly database: DatabaseProvider;

    constructor() {
        this.app = express();
        this.app.use(metricsMiddleware);
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(cors());

        this.app.get('/metrics', async (_req, res) => {
            res.setHeader('Content-Type', metrics.contentType);
            res.send(await metrics.metrics());
        });

        this.database = createDatabaseProvider();
        logger.info({ dbEngine: config.dbEngine }, 'Database engine selected');

        const characterService = new CharacterService(this.database.characterRepository);
        const characterController = new CharacterController(characterService);
        const characterRoutes = new CharacterRoutes(characterController);

        this.app.use('/api', characterRoutes.router);
    }

    public start() {
        this.app.listen(config.port, () => {
            logger.info({ port: config.port }, 'Server is running');
        });
        logger.info('App started');
    }

    public shutdown() {
        logger.info('Shutting down app...');
        this.close().then(() => {
            process.exit(0);
        });
    }

    public async close() {
        await this.database.close();
    }
}
