import { Request, Response } from 'express';
import { Character } from './character.entity.js';
import { CharacterMongoRepository } from './character.mongodb.repository.js';
import { CharacterPostgresRepository } from './character.postgres.repository.js';


const characterRepository = new CharacterMongoRepository();
//const characterRepository = new CharacterPostgresRepository();

export class CharacterController {

    async findAllCharacters(req: Request, res: Response) {
        const characters = await characterRepository.findAll();
        res.json(characters);
    }

    async findCharacterById(req: Request, res: Response) {
        const characterId = req.params.id;
        const character = await characterRepository.findOne(characterId);
        if (!character) {
            res.status(404).json({
                errorMessage: 'Character not found',
                errorCode: 'CHARACTER_NOT_FOUND'
            });
            return;
        }
        res.json({ data: character });
    }

    async addCharacter(req: Request, res: Response) {

        const input = req.body;
        const newCharacter = new Character(
            input.name,
            input.characterClass,
            input.level,
            input.hp,
            input.mana,
            input.attack,
            input.items
        );

        await characterRepository.add(newCharacter);

        res.status(201).json({ data: newCharacter });

    }

    updateCharacter(req: Request, res: Response) {
        // Logic to update an existing character
    }

    deleteCharacter(req: Request, res: Response) {
        // Logic to delete a character
    }




}