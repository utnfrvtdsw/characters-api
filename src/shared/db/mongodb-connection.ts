import { MongoClient, Db } from 'mongodb'

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017'

const mongoClient = new MongoClient(uri);

await mongoClient.connect()

export let db = mongoClient.db(process.env.MONGODB_DB || 'mydatabase')


