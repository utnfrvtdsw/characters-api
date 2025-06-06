import { Request, Response } from 'express';
import { CharacterRepository } from './character.repository.js';
import { Character } from './character.entity.js';


const characterRepository = new CharacterRepository();

export class CharacterController {

    findAllCharacters(req: Request, res: Response) {
        const characters = characterRepository.findAll();
        res.json(characters);
    }

    findCharacterById(req: Request, res: Response) {
        const characterId = req.params.id;
        const character = characterRepository.findOne({ id: characterId });
        if (!character) {
            res.status(404).json({
                errorMessage: 'Character not found',
                errorCode: 'CHARACTER_NOT_FOUND'
            });
            return;
        }
        res.json({ data: character });
    }

    addCharacter(req: Request, res: Response) {

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

        characterRepository.add(newCharacter);

        res.status(201).json({ data: newCharacter });

    }

    updateCharacter(req: Request, res: Response) {
        // Logic to update an existing character
    }

    deleteCharacter(req: Request, res: Response) {
        // Logic to delete a character
    }




}