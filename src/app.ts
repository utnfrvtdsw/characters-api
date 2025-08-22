import express from 'express';
import { CharacterRouter } from './character/character.routes.js';
import { CharacterController } from './character/character.controller.js';
import type { CharacterRepository } from './character/character.repository.interface.js';
import { CharacterPostgresRepository } from './character/character.postgres.repository.js';

export class App {
  public readonly app;

  constructor({
    repository,
    controller,
  }: { repository?: CharacterRepository; controller?: CharacterController } = {}) {
    this.app = express();
    this.app.use(express.json());
    
    const repo = repository || new CharacterPostgresRepository();
    const ctrl = controller || new CharacterController(repo);
    const characterRouter = new CharacterRouter(ctrl);
    this.app.use('/api/characters', characterRouter.router);
  }

  static getDefaults() {
    const repository = new CharacterPostgresRepository();
    const controller = new CharacterController(repository);
    return { repository, controller };
  }

  start(port = 3000) {
    this.app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}/`);
    });
  }
}

export default App;
