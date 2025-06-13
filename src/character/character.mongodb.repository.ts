import { CharacterRepository } from "./character.repository.interface.js";
import { Character } from "./character.entity.js";
import { MongoClient, Db, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI || 'mongodb://root:example@localhost:27017/';
const mongoClient = new MongoClient(uri);
await mongoClient.connect();
const db = mongoClient.db(process.env.MONGODB_DB || 'characters');
const characters = db.collection<Character>('characters');

export class CharacterMongoRepository implements CharacterRepository {
    async findAll(): Promise<Character[] | undefined> {
        return await characters.find().toArray();
    }

    async findOne(id: string): Promise<Character | undefined> {
        const objectId = new ObjectId(id);
        return (await characters.findOne({ _id: objectId })) || undefined;
    }

    async add(character: Character): Promise<Character | undefined> {
        const id = (await characters.insertOne(character)).insertedId
        let resultCharacter = await characters.findOne({ _id: id })
        return resultCharacter || undefined
    }

    async update(id: string, character: Character): Promise<Character | undefined> {
        const objectId = new ObjectId(id)
        return (await characters.findOneAndUpdate({ _id: objectId }, { $set: character }, { returnDocument: 'after' })) || undefined
    }

    async partialUpdate(id: string, updates: Partial<Character>): Promise<Character | undefined> {
        const objectId = new ObjectId(id)
        return (await characters.findOneAndUpdate(
            { _id: objectId },
            { $set: updates },
            { returnDocument: 'after' }
        )) || undefined
    }

    async delete(id: string): Promise<Character | undefined> {
        const objectId = new ObjectId(id)
        return (await characters.findOneAndDelete({ _id: objectId })) || undefined
    }
}