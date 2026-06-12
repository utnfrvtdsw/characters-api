import { Character } from "./character.entity";
import { CharacterRepository } from "./character.repository.interface";
import { MongoClient, ObjectId, WithId, Document } from 'mongodb';

export class CharacterRepositoryMongodb implements CharacterRepository {

    private readonly mongoClient: MongoClient;
    private readonly dbName: string;

    constructor(mongoClient: MongoClient, dbName: string = 'characters') {
        this.mongoClient = mongoClient;
        this.dbName = dbName;
    }

    private collection() {
        return this.mongoClient.db(this.dbName).collection('characters');
    }

    private toCharacter(doc: WithId<Document>): Character {
        return {
            id: doc._id.toString(),
            create_time: doc.create_time,
            name: doc.name,
            nickname: doc.nickname ?? null,
            class_name: doc.class_name ?? null,
            race: doc.race ?? null,
            level: doc.level,
            experience_points: doc.experience_points,
            health_points: doc.health_points,
            mana_points: doc.mana_points,
            strength: doc.strength,
            agility: doc.agility,
            intelligence: doc.intelligence,
            defense: doc.defense,
            is_alive: doc.is_alive,
            avatar_url: doc.avatar_url ?? null,
            backstory: doc.backstory ?? null,
        };
    }

    private toObjectId(id: string): ObjectId | null {
        return ObjectId.isValid(id) ? new ObjectId(id) : null;
    }

    async createCharacter(character: Omit<Character, "id" | "create_time">): Promise<Character> {
        const create_time = new Date();
        const characterToInsert = {
            ...character,
            create_time
        };

        const result = await this.collection().insertOne(characterToInsert);
        const id = result.insertedId.toString();

        return {
            id,
            create_time,
            ...character
        };
    }

    async getCharacterById(id: string): Promise<Character | null> {
        const _id = this.toObjectId(id);
        if (!_id) return null;

        const doc = await this.collection().findOne({ _id });
        return doc ? this.toCharacter(doc) : null;
    }

    async getCharacters(): Promise<Character[]> {
        const docs = await this.collection().find().toArray();
        return docs.map(doc => this.toCharacter(doc));
    }

    async updateCharacter(id: string, character: Partial<Omit<Character, "id" | "create_time">>): Promise<Character | null> {
        const _id = this.toObjectId(id);
        if (!_id) return null;

        const updateFields = Object.fromEntries(
            Object.entries(character).filter(([, value]) => value !== undefined)
        );

        if (Object.keys(updateFields).length === 0) {
            return this.getCharacterById(id);
        }

        const doc = await this.collection().findOneAndUpdate(
            { _id },
            { $set: updateFields },
            { returnDocument: 'after' }
        );

        return doc ? this.toCharacter(doc) : null;
    }

    async deleteCharacter(id: string): Promise<boolean> {
        const _id = this.toObjectId(id);
        if (!_id) return false;

        const result = await this.collection().deleteOne({ _id });
        return result.deletedCount > 0;
    }
}
