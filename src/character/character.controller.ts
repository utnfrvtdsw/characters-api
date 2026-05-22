import { Request, Response } from "express";
import { CharacterModel } from "./character.model";
import { Pool } from 'pg';

export class CharacterController {

    private client: Pool;

    constructor(client?: Pool) {
        this.client =
        client ||
        new Pool({
            user: 'postgres',
            host: 'localhost',
            database: 'characters_db',
            password: 'postgres',
            port: 5433,
        });
        this.client.connect();
    }

    public getCharacter(req: Request, res: Response) {
        console.log(req.method, req.url);
        res.json({ message: 'List of characters' });
    }

    public getCharacters(req: Request, res: Response) {
        const characterModel = new CharacterModel(this.client);
        characterModel.getCharacters().then(characters => {
            res.json(characters);
        }).catch(error => {
            console.error('Error fetching characters:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        });
    }

    public createCharacter(req: Request, res: Response) {
        console.log(req.method, req.url);
        res.json({ message: 'Character created' });
    }
}