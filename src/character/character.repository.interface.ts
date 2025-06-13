import { Character } from "./character.entity.js";

export interface CharacterRepository {
    findAll(): Promise<Character[] | undefined>;
    findOne(id: string): Promise<Character | undefined>;
    add(character: Character): Promise<Character | undefined>;
    update(id: string, character: Character): Promise<Character | undefined>;
    partialUpdate(id: string, updates: Partial<Character>): Promise<Character | undefined>;
    delete(id: string): Promise<Character | undefined>;
}
