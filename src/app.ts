import express from 'express';
import { CharacterRoutes } from './character/character.routes';

export class App {

    public readonly app;

    constructor() {
        this.app = express();
        const characterRoutes = new CharacterRoutes();
        this.app.use('/api', characterRoutes.router);
    }

    public start() {
        this.app.listen(3000, () => {
            console.log('Server is running on port 3000');
        });
        console.log('App started');
    }
}
