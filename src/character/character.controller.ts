import { Request, Response } from 'express';
import { Character } from './character.entity.js';
import type { CharacterRepository } from './character.repository.interface.js';

export class CharacterController {
  private characterRepository: CharacterRepository;

  constructor(characterRepository: CharacterRepository) {
    this.characterRepository = characterRepository;
    this.findAllCharacters = this.findAllCharacters.bind(this);
    this.findCharacterById = this.findCharacterById.bind(this);
    this.addCharacter = this.addCharacter.bind(this);
    this.updateCharacter = this.updateCharacter.bind(this);
    this.deleteCharacter = this.deleteCharacter.bind(this);
  }

  async findAllCharacters(req: Request, res: Response) {
    const characters = await this.characterRepository.findAll();
    res.json(characters);
  }

  async findCharacterById(req: Request, res: Response) {
    const characterId = req.params.id;
    const character = await this.characterRepository.findOne(characterId);
    if (!character) {
      res.status(404).json({
        errorMessage: 'Character not found',
        errorCode: 'CHARACTER_NOT_FOUND',
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
      input.items,
    );
    await this.characterRepository.add(newCharacter);
    res.status(201).json({ data: newCharacter });
  }

  updateCharacter(req: Request, res: Response) {}

  deleteCharacter(req: Request, res: Response) {}
}
