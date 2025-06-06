import { Repository } from "../shared/repository.js";
import { Character } from "./character.entity.js";
import { db } from "../shared/db/mongodb-connection.js";
import { ObjectId } from "mongodb";

const characters = db.collection<Character>('characters')

export class CharacterRepository implements Repository<Character> {

    async findAll(): Promise<Character[] | undefined> {
        return await characters.find().toArray();
    }

    async findOne(item: { id: string; }) {
        const _id = new ObjectId(item.id)
        return (await characters.findOne({ _id: item.id })) || undefined
    }

    async add(item: Character): Promise<Character | undefined> {
        const id = (await characters.insertOne(item)).insertedId
        let character = await characters.findOne({ _id: id })
        return character || undefined
    }

    async update(id: string, item: Character): Promise<Character | undefined> {
        const _id = new ObjectId(id)
        return (await characters.findOneAndUpdate({ _id: id }, { $set: item }, { returnDocument: 'after' })) || undefined
    }

    async delete(item: { id: string }): Promise<Character | undefined> {
        const _id = new ObjectId(item.id)
        return (await characters.findOneAndDelete({ _id: item.id })) || undefined
    }

}