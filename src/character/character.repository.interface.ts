import { Character } from "./character.entity";

export interface CharacterRepository {
    createCharacter(character: Omit<Character, 'id' | 'create_time'>): Promise<Character>;
    getCharacterById(id: string): Promise<Character | null>;
    getCharacters(): Promise<Character[]>;
    updateCharacter(id: string, character: Partial<Omit<Character, 'id' | 'create_time'>>): Promise<Character | null>;
    deleteCharacter(id: string): Promise<boolean>;
}