import { Request, Response } from "express";
import { CharacterService } from "./character.service";
import { logger } from "../observability/logger.service";

export class CharacterController {

    private readonly characterService: CharacterService;

    constructor(characterService: CharacterService) {
        this.characterService = characterService;
    }

    public async getCharacters(_req: Request, res: Response): Promise<void> {
        try {
            const characters = await this.characterService.getAllCharacters();
            res.json(characters);
        } catch (error) {
            logger.error({ err: error }, 'Error fetching characters');
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    public async getCharacter(req: Request<{ id: string }>, res: Response): Promise<void> {
        const id = req.params.id;

        logger.info({"id": id})

        if (!id || id.trim().length === 0) {
            res.status(400).json({ error: 'Invalid character ID' });
            logger.error({ error: 'Invalid character ID' });
            return;
        }

        try {
            const character = await this.characterService.getCharacterById(id);

            if (character) {
                res.json(character);
            } else {
                res.status(404).json({ error: 'Character not found' });
                logger.debug({ error: 'Character not found' });
            }
        } catch (error: any) {
            logger.error({ err: error }, 'Error fetching character');
            res.status(400).json({ error: error.message });
        }
    }

    public async createCharacter(req: Request, res: Response): Promise<void> {
        try {
            const character = await this.characterService.createCharacter(req.body);
            res.status(201).json(character);
        } catch (error: any) {
            logger.error({ err: error }, 'Error creating character');
            res.status(400).json({ error: error.message });
        }
    }

    public async updateCharacter(req: Request<{ id: string }>, res: Response): Promise<void> {
        const id = req.params.id;

        if (!id || id.trim().length === 0) {
            res.status(400).json({ error: 'Invalid character ID' });
            return;
        }

        try {
            const character = await this.characterService.updateCharacter(id, req.body);

            if (character) {
                res.json(character);
            } else {
                res.status(404).json({ error: 'Character not found' });
            }
        } catch (error: any) {
            logger.error({ err: error }, 'Error updating character');
            res.status(400).json({ error: error.message });
        }
    }

    public async deleteCharacter(req: Request<{ id: string }>, res: Response): Promise<void> {
        const id = req.params.id;

        if (!id || id.trim().length === 0) {
            res.status(400).json({ error: 'Invalid character ID' });
            return;
        }

        try {
            const deleted = await this.characterService.deleteCharacter(id);

            if (deleted) {
                res.status(204).send();
            } else {
                res.status(404).json({ error: 'Character not found' });
            }
        } catch (error: any) {
            logger.error({ err: error }, 'Error deleting character');
            res.status(400).json({ error: error.message });
        }
    }
}