import { Router } from 'express';

import { CharacterController } from './character.controller.js';

export class CharacterRouter {
  public readonly router = Router();

  constructor(controller: CharacterController) {

    this.router.get('/', controller.findAllCharacters);
    this.router.get('/:id', controller.findCharacterById);
    this.router.post('/', sanitizeCharacterInput, controller.addCharacter);
    this.router.put('/:id', sanitizeCharacterInput, controller.updateCharacter);
    this.router.delete('/:id', controller.deleteCharacter);
    
  }
}

function sanitizeCharacterInput(req: any, res: any, next: any) {
  req.body.sanitizedInput = {
    name: req.body.name,
    characterClass: req.body.characterClass,
    level: req.body.level,
    hp: req.body.hp,
    mana: req.body.mana,
    attack: req.body.attack,
    items: req.body.items,
  };
  //more checks here

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });

  next();
}
