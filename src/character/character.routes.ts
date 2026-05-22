import { Router } from "express";
import { CharacterController } from "./character.controller";


export class CharacterRoutes {
    
    public readonly router = Router();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        const characterController = new CharacterController();
        this.router.get('/character', characterController.getCharacter.bind(characterController));
        this.router.get('/characters', characterController.getCharacters.bind(characterController));
        this.router.post('/character', characterController.createCharacter.bind(characterController));
    }
    
}