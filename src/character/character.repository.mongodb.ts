import { Character } from "./character.entity";
import { CharacterRepository } from "./character.repository.interface";
import { MongoClient } from 'mongodb';

export class CharacterRepositoryMongodb implements CharacterRepository {

    private readonly mongoClient: MongoClient;
    private db() {
        return this.mongoClient.db('characters');
    }

    constructor(mongoClient: MongoClient) {
        this.mongoClient = mongoClient;
    }

    async createCharacter(character: Omit<Character, "id" | "create_time">): Promise<Character> {
        const create_time = new Date();
        const characterToInsert = {
            ...character,
            create_time
        };

        const result = await this.db().collection('characters').insertOne(characterToInsert);
        const id = result.insertedId.toString();

        return {
            id,
            create_time,
            ...character
        };
    }
    getCharacterById(id: string): Promise<Character | null> {
        throw new Error("Method not implemented.");
    }
    async getCharacters(): Promise<Character[]> {
        const characters = await this.db().collection('characters').find().toArray();
        return characters.map(character => ({
            id: character._id.toString(),
            create_time: character.create_time,
            name: character.name,
            nickname: character.nickname,
            class_name: character.class_name,
            race: character.race,
            level: character.level,
            experience_points: character.experience_points,
            health_points: character.health_points,
            mana_points: character.mana_points,
            strength: character.strength,
            agility: character.agility,
            intelligence: character.intelligence,
            defense: character.defense,
            is_alive: character.is_alive,
            avatar_url: character.avatar_url,
            backstory: character.backstory,
        }));
    }
    updateCharacter(id: string, character: Partial<Omit<Character, "id" | "create_time">>): Promise<Character | null> {
        throw new Error("Method not implemented.");
    }
    deleteCharacter(id: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
  // Implement MongoDB specific methods for character repository here
}