import { CharacterDynamoDBRepository } from "./character.dynamodb.repository.js";
import { Character } from "./character.entity.js";
import { DynamoDBConfig } from "./dynamodb.config.js";

async function testDynamoDBRepository() {
    console.log('🚀 Testing DynamoDB Character Repository...\n');

    // Configurar la tabla
    const config = new DynamoDBConfig();
    
    try {
        // Crear tabla si no existe
        console.log('📋 Creating table...');
        await config.createTable();
        await config.waitForTableActive();
        
        // Inicializar repositorio
        const repository = new CharacterDynamoDBRepository();
        
        // Test 1: Agregar personajes
        console.log('➕ Adding characters...');
        const character1 = new Character(
            'Gandalf',
            'Wizard',
            50,
            100,
            200,
            75,
            ['Staff of Power', 'Robe of the Archmagi']
        );
        
        const character2 = new Character(
            'Aragorn',
            'Ranger',
            35,
            120,
            50,
            90,
            ['Andúril', 'Ranger Cloak']
        );
        
        const savedChar1 = await repository.add(character1);
        const savedChar2 = await repository.add(character2);
        
        console.log('✅ Characters added:', savedChar1?.name, savedChar2?.name);
        
        // Test 2: Obtener todos los personajes
        console.log('\n📜 Getting all characters...');
        const allCharacters = await repository.findAll();
        console.log('✅ Found characters:', allCharacters?.length);
        allCharacters?.forEach(char => {
            console.log(`  - ${char.name} (${char.characterClass}, Level ${char.level})`);
        });
        
        // Test 3: Buscar por ID
        if (savedChar1) {
            console.log('\n🔍 Finding character by ID...');
            // Necesitamos obtener el ID del item guardado
            const foundChar = await repository.findOne(savedChar1.name); // Usando name como ejemplo
            console.log('✅ Found character:', foundChar?.name);
        }
        
        // Test 4: Actualización parcial
        if (savedChar1) {
            console.log('\n✏️  Partial update...');
            const updated = await repository.partialUpdate(savedChar1.name, { level: 55 });
            console.log('✅ Updated character level:', updated?.level);
        }
        
        // Test 5: Buscar por clase
        console.log('\n🏹 Finding characters by class...');
        const wizards = await repository.findByClass('Wizard');
        console.log('✅ Found wizards:', wizards.length);
        
        // Test 6: Buscar por nivel
        console.log('\n🎚️  Finding characters by level...');
        const level35 = await repository.findByLevel(35);
        console.log('✅ Found level 35 characters:', level35.length);
        
        // Test 7: Información de la tabla
        console.log('\n📊 Table info...');
        const tableInfo = await repository.getTableInfo();
        console.log('✅ Table info:', tableInfo);
        
        console.log('\n🎉 All tests completed successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Función para limpiar los datos de prueba
async function cleanup() {
    console.log('🧹 Cleaning up test data...');
    const config = new DynamoDBConfig();
    
    try {
        await config.deleteTable();
        console.log('✅ Test table deleted');
    } catch (error) {
        console.error('❌ Cleanup failed:', error);
    }
}

// Ejecutar pruebas si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    const action = process.argv[2];
    
    switch (action) {
        case 'test':
            await testDynamoDBRepository();
            break;
        case 'cleanup':
            await cleanup();
            break;
        default:
            console.log('Usage: node character.dynamodb.test.js [test|cleanup]');
            break;
    }
}
