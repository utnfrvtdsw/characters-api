import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { 
    DynamoDBDocumentClient, 
    PutCommand, 
    GetCommand, 
    UpdateCommand, 
    DeleteCommand, 
    ScanCommand 
} from "@aws-sdk/lib-dynamodb";
import crypto from 'node:crypto';
import { Character } from "./character.entity.js";
import { CharacterRepository } from "./character.repository.interface.js";

export class CharacterDynamoDBRepository implements CharacterRepository {
    private docClient: DynamoDBDocumentClient;
    private tableName: string;

    constructor(tableName: string = 'Characters', region: string = 'us-east-1') {
        const client = new DynamoDBClient({ 
            region,
            // Para desarrollo local con DynamoDB Local
            ...(process.env.NODE_ENV === 'development' && {
                endpoint: 'http://localhost:8000'
            })
        });
        this.docClient = DynamoDBDocumentClient.from(client);
        this.tableName = tableName;
    }

    async findAll(): Promise<Character[] | undefined> {
        try {
            const command = new ScanCommand({
                TableName: this.tableName
            });

            const response = await this.docClient.send(command);
            
            if (!response.Items) {
                return [];
            }

            return response.Items.map(item => this.mapDynamoItemToCharacter(item));
        } catch (error) {
            console.error('Error finding all characters:', error);
            throw new Error('Failed to retrieve characters from DynamoDB');
        }
    }

    async findOne(id: string): Promise<Character | undefined> {
        try {
            const command = new GetCommand({
                TableName: this.tableName,
                Key: {
                    id: id
                }
            });

            const response = await this.docClient.send(command);
            
            if (!response.Item) {
                return undefined;
            }

            return this.mapDynamoItemToCharacter(response.Item);
        } catch (error) {
            console.error(`Error finding character with id ${id}:`, error);
            throw new Error(`Failed to retrieve character with id ${id} from DynamoDB`);
        }
    }

    async add(character: Character): Promise<Character | undefined> {
        try {
            const id = crypto.randomUUID();
            const item = {
                id,
                ...this.mapCharacterToDynamoItem(character),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            const command = new PutCommand({
                TableName: this.tableName,
                Item: item,
                // Evita sobrescribir si ya existe un item con el mismo id
                ConditionExpression: 'attribute_not_exists(id)'
            });

            await this.docClient.send(command);
            
            return this.mapDynamoItemToCharacter(item);
        } catch (error) {
            console.error('Error adding character:', error);
            throw new Error('Failed to add character to DynamoDB');
        }
    }

    async update(id: string, character: Character): Promise<Character | undefined> {
        try {
            const item = this.mapCharacterToDynamoItem(character);
            
            const command = new PutCommand({
                TableName: this.tableName,
                Item: {
                    id,
                    ...item,
                    updatedAt: new Date().toISOString()
                },
                // Solo actualiza si el item existe
                ConditionExpression: 'attribute_exists(id)'
            });

            const response = await this.docClient.send(command);
            
            // Recuperamos el item actualizado
            return await this.findOne(id);
        } catch (error: any) {
            if (error.name === 'ConditionalCheckFailedException') {
                return undefined; // El character no existe
            }
            console.error(`Error updating character with id ${id}:`, error);
            throw new Error(`Failed to update character with id ${id} in DynamoDB`);
        }
    }

    async partialUpdate(id: string, updates: Partial<Character>): Promise<Character | undefined> {
        try {
            // Construir la expresión de actualización dinámicamente
            const updateExpressions: string[] = [];
            const expressionAttributeValues: Record<string, any> = {};
            const expressionAttributeNames: Record<string, string> = {};

            Object.entries(updates).forEach(([key, value], index) => {
                const attributeName = `#attr${index}`;
                const attributeValue = `:val${index}`;
                
                updateExpressions.push(`${attributeName} = ${attributeValue}`);
                expressionAttributeNames[attributeName] = key;
                expressionAttributeValues[attributeValue] = value;
            });

            // Agregar updatedAt
            const updatedAtKey = `#attr${Object.keys(updates).length}`;
            const updatedAtValue = `:val${Object.keys(updates).length}`;
            updateExpressions.push(`${updatedAtKey} = ${updatedAtValue}`);
            expressionAttributeNames[updatedAtKey] = 'updatedAt';
            expressionAttributeValues[updatedAtValue] = new Date().toISOString();

            const command = new UpdateCommand({
                TableName: this.tableName,
                Key: { id },
                UpdateExpression: `SET ${updateExpressions.join(', ')}`,
                ExpressionAttributeNames: expressionAttributeNames,
                ExpressionAttributeValues: expressionAttributeValues,
                ConditionExpression: 'attribute_exists(id)',
                ReturnValues: 'ALL_NEW'
            });

            const response = await this.docClient.send(command);
            
            if (!response.Attributes) {
                return undefined;
            }

            return this.mapDynamoItemToCharacter(response.Attributes);
        } catch (error: any) {
            if (error.name === 'ConditionalCheckFailedException') {
                return undefined; // El character no existe
            }
            console.error(`Error partially updating character with id ${id}:`, error);
            throw new Error(`Failed to partially update character with id ${id} in DynamoDB`);
        }
    }

    async delete(id: string): Promise<Character | undefined> {
        try {
            const command = new DeleteCommand({
                TableName: this.tableName,
                Key: { id },
                ConditionExpression: 'attribute_exists(id)',
                ReturnValues: 'ALL_OLD'
            });

            const response = await this.docClient.send(command);
            
            if (!response.Attributes) {
                return undefined;
            }

            return this.mapDynamoItemToCharacter(response.Attributes);
        } catch (error: any) {
            if (error.name === 'ConditionalCheckFailedException') {
                return undefined; // El character no existe
            }
            console.error(`Error deleting character with id ${id}:`, error);
            throw new Error(`Failed to delete character with id ${id} from DynamoDB`);
        }
    }

    // Métodos auxiliares para mapear entre Character y DynamoDB items
    private mapCharacterToDynamoItem(character: Character): Record<string, any> {
        return {
            name: character.name,
            characterClass: character.characterClass,
            level: character.level,
            hp: character.hp,
            mana: character.mana,
            attack: character.attack,
            items: character.items || []
        };
    }

    private mapDynamoItemToCharacter(item: Record<string, any>): Character {
        return new Character(
            item.name,
            item.characterClass,
            item.level,
            item.hp,
            item.mana,
            item.attack,
            item.items || []
        );
    }

    // Método adicional para obtener información de la tabla
    async getTableInfo(): Promise<{ tableName: string; itemCount?: number }> {
        try {
            const command = new ScanCommand({
                TableName: this.tableName,
                Select: 'COUNT'
            });

            const response = await this.docClient.send(command);
            
            return {
                tableName: this.tableName,
                itemCount: response.Count
            };
        } catch (error) {
            console.error('Error getting table info:', error);
            return {
                tableName: this.tableName
            };
        }
    }

    // Método para buscar por atributos específicos (ejemplo: buscar por level)
    async findByLevel(level: number): Promise<Character[]> {
        try {
            const command = new ScanCommand({
                TableName: this.tableName,
                FilterExpression: '#level = :level',
                ExpressionAttributeNames: {
                    '#level': 'level'
                },
                ExpressionAttributeValues: {
                    ':level': level
                }
            });

            const response = await this.docClient.send(command);
            
            if (!response.Items) {
                return [];
            }

            return response.Items.map(item => this.mapDynamoItemToCharacter(item));
        } catch (error) {
            console.error(`Error finding characters by level ${level}:`, error);
            throw new Error(`Failed to find characters by level ${level} in DynamoDB`);
        }
    }

    // Método para buscar por clase de personaje
    async findByClass(characterClass: string): Promise<Character[]> {
        try {
            const command = new ScanCommand({
                TableName: this.tableName,
                FilterExpression: '#characterClass = :characterClass',
                ExpressionAttributeNames: {
                    '#characterClass': 'characterClass'
                },
                ExpressionAttributeValues: {
                    ':characterClass': characterClass
                }
            });

            const response = await this.docClient.send(command);
            
            if (!response.Items) {
                return [];
            }

            return response.Items.map(item => this.mapDynamoItemToCharacter(item));
        } catch (error) {
            console.error(`Error finding characters by class ${characterClass}:`, error);
            throw new Error(`Failed to find characters by class ${characterClass} in DynamoDB`);
        }
    }
}
