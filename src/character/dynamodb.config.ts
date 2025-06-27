import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { 
    CreateTableCommand, 
    DescribeTableCommand, 
    DeleteTableCommand,
    ListTablesCommand
} from "@aws-sdk/client-dynamodb";

export class DynamoDBConfig {
    private client: DynamoDBClient;
    private tableName: string;

    constructor(tableName: string = 'Characters', region: string = 'us-east-1') {
        this.client = new DynamoDBClient({ 
            region,
            // Para desarrollo local con DynamoDB Local
            ...(process.env.NODE_ENV === 'development' && {
                endpoint: 'http://localhost:8000'
            })
        });
        this.tableName = tableName;
    }

    async createTable(): Promise<void> {
        try {
            const command = new CreateTableCommand({
                TableName: this.tableName,
                KeySchema: [
                    {
                        AttributeName: 'id',
                        KeyType: 'HASH' // Partition key
                    }
                ],
                AttributeDefinitions: [
                    {
                        AttributeName: 'id',
                        AttributeType: 'S' // String
                    }
                ],
                BillingMode: 'PAY_PER_REQUEST' // Para desarrollo, usar bajo demanda
                // Para producción, puedes usar:
                // BillingMode: 'PROVISIONED',
                // ProvisionedThroughput: {
                //     ReadCapacityUnits: 5,
                //     WriteCapacityUnits: 5
                // }
            });

            const result = await this.client.send(command);
            console.log(`Table ${this.tableName} created successfully:`, result.TableDescription?.TableArn);
        } catch (error: any) {
            if (error.name === 'ResourceInUseException') {
                console.log(`Table ${this.tableName} already exists`);
            } else {
                console.error('Error creating table:', error);
                throw error;
            }
        }
    }

    async deleteTable(): Promise<void> {
        try {
            const command = new DeleteTableCommand({
                TableName: this.tableName
            });

            await this.client.send(command);
            console.log(`Table ${this.tableName} deleted successfully`);
        } catch (error: any) {
            if (error.name === 'ResourceNotFoundException') {
                console.log(`Table ${this.tableName} does not exist`);
            } else {
                console.error('Error deleting table:', error);
                throw error;
            }
        }
    }

    async describeTable(): Promise<void> {
        try {
            const command = new DescribeTableCommand({
                TableName: this.tableName
            });

            const result = await this.client.send(command);
            console.log('Table description:', JSON.stringify(result.Table, null, 2));
        } catch (error: any) {
            if (error.name === 'ResourceNotFoundException') {
                console.log(`Table ${this.tableName} does not exist`);
            } else {
                console.error('Error describing table:', error);
                throw error;
            }
        }
    }

    async listTables(): Promise<string[]> {
        try {
            const command = new ListTablesCommand({});
            const result = await this.client.send(command);
            
            const tables = result.TableNames || [];
            console.log('Available tables:', tables);
            return tables;
        } catch (error) {
            console.error('Error listing tables:', error);
            throw error;
        }
    }

    async waitForTableActive(): Promise<void> {
        const maxAttempts = 30;
        const delayMs = 2000;
        
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                const command = new DescribeTableCommand({
                    TableName: this.tableName
                });
                
                const result = await this.client.send(command);
                const status = result.Table?.TableStatus;
                
                if (status === 'ACTIVE') {
                    console.log(`Table ${this.tableName} is now active`);
                    return;
                }
                
                console.log(`Waiting for table ${this.tableName} to become active... (${status})`);
                await new Promise(resolve => setTimeout(resolve, delayMs));
            } catch (error: any) {
                if (error.name === 'ResourceNotFoundException') {
                    console.log(`Table ${this.tableName} does not exist`);
                    return;
                }
                throw error;
            }
        }
        
        throw new Error(`Table ${this.tableName} did not become active within expected time`);
    }
}

// Script para ejecutar desde línea de comandos
if (import.meta.url === `file://${process.argv[1]}`) {
    const config = new DynamoDBConfig();
    const action = process.argv[2];
    
    switch (action) {
        case 'create':
            await config.createTable();
            await config.waitForTableActive();
            break;
        case 'delete':
            await config.deleteTable();
            break;
        case 'describe':
            await config.describeTable();
            break;
        case 'list':
            await config.listTables();
            break;
        default:
            console.log('Usage: node dynamodb.config.js [create|delete|describe|list]');
    }
}
