import pg from 'pg';
import { Character } from './character.entity';

export class CharacterModel {

    private db: pg.Pool;

    constructor(db: pg.Pool) {
        this.db = db;
    }

    async createCharacter(character: Character): Promise<void> {
        // Implementation to insert character into the database
    }

    async getCharacterById(id: number): Promise<Character | null> {
        // Implementation to retrieve a character by ID from the database
        return null; // Placeholder return
    }

    async getCharacters(): Promise<Character[]> {
        const result = await this.db.query('SELECT * FROM "character"');
        return result.rows as Character[];
    }

    async updateCharacter(character: Character): Promise<void> {
        // Implementation to update character details in the database
    }

    async deleteCharacter(id: number): Promise<void> {
        // Implementation to delete a character from the database
    }
}
