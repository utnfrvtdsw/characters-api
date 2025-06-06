import { Router } from "express";
import { CharacterController } from './character.controller.js';

export const characterRouter = Router();
const characterController = new CharacterController();

characterRouter.get('/', characterController.findAllCharacters);
characterRouter.get('/:id', characterController.findCharacterById);
characterRouter.post('/', sanitizeCharacterInput, characterController.addCharacter);
characterRouter.put('/:id', sanitizeCharacterInput, characterController.updateCharacter);
characterRouter.delete('/:id', characterController.deleteCharacter);  

function sanitizeCharacterInput(req:any, res:any, next:any) {

  req.body.sanitizedInput = {
    name: req.body.name,
    characterClass: req.body.characterClass,
    level: req.body.level,
    hp: req.body.hp,
    mana: req.body.mana,
    attack: req.body.attack,
    items: req.body.items,
  }
  //more checks here

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key]
    }
  })

  next()
}

