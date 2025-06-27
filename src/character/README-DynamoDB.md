# DynamoDB Character Repository

Este proyecto implementa un patrón repositorio para DynamoDB que permite gestionar personajes de forma persistente en Amazon DynamoDB.

## 📋 Características

- ✅ Implementa la interfaz `CharacterRepository`
- ✅ Operaciones CRUD completas
- ✅ Manejo de errores robusto
- ✅ Soporte para desarrollo local y producción
- ✅ Métodos adicionales de búsqueda (por clase, nivel)
- ✅ Configuración flexible
- ✅ Scripts de gestión de tabla

## 🚀 Configuración

### 1. Instalación de dependencias

```bash
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
```

### 2. Variables de entorno

Copia el archivo `.env.example` a `.env` y configura las variables:

```bash
cp .env.example .env
```

```env
AWS_REGION=us-east-1
DYNAMODB_TABLE_NAME=Characters
NODE_ENV=development
```

### 3. Para desarrollo local (opcional)

Si quieres usar DynamoDB Local:

```bash
# Instalar DynamoDB Local
docker run -p 8000:8000 amazon/dynamodb-local

# O usando Java
java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb
```

## 🛠️ Uso

### Crear la tabla

```bash
npm run dynamodb:create
```

### Usar el repositorio

```typescript
import { CharacterDynamoDBRepository } from './character.dynamodb.repository.js';
import { Character } from './character.entity.js';

// Inicializar el repositorio
const repository = new CharacterDynamoDBRepository();

// Crear un personaje
const character = new Character(
    'Gandalf',
    'Wizard',
    50,
    100,
    200,
    75,
    ['Staff of Power', 'Robe of the Archmagi']
);

// Operaciones CRUD
const saved = await repository.add(character);
const found = await repository.findOne(id);
const all = await repository.findAll();
const updated = await repository.update(id, character);
const partialUpdated = await repository.partialUpdate(id, { level: 55 });
const deleted = await repository.delete(id);

// Búsquedas específicas
const wizards = await repository.findByClass('Wizard');
const level50 = await repository.findByLevel(50);
```

## 📊 Scripts disponibles

```bash
# Gestión de tabla
npm run dynamodb:create     # Crear tabla
npm run dynamodb:delete     # Eliminar tabla
npm run dynamodb:describe   # Describir tabla
npm run dynamodb:list       # Listar todas las tablas

# Pruebas
npm run dynamodb:test       # Ejecutar pruebas del repositorio
npm run dynamodb:cleanup    # Limpiar datos de prueba
```

## 🏗️ Estructura de la tabla

La tabla DynamoDB se crea con la siguiente estructura:

- **Partition Key**: `id` (String) - UUID único para cada personaje
- **Billing Mode**: PAY_PER_REQUEST (para desarrollo)
- **Atributos**:
  - `id`: Identificador único
  - `name`: Nombre del personaje
  - `characterClass`: Clase del personaje
  - `level`: Nivel del personaje
  - `hp`: Puntos de vida
  - `mana`: Puntos de maná
  - `attack`: Puntos de ataque
  - `items`: Array de objetos/items
  - `createdAt`: Timestamp de creación
  - `updatedAt`: Timestamp de última actualización

## 🔍 Métodos disponibles

### Métodos de la interfaz CharacterRepository

- `findAll()`: Obtiene todos los personajes
- `findOne(id)`: Busca un personaje por ID
- `add(character)`: Agrega un nuevo personaje
- `update(id, character)`: Actualiza completamente un personaje
- `partialUpdate(id, updates)`: Actualiza campos específicos
- `delete(id)`: Elimina un personaje

### Métodos adicionales específicos de DynamoDB

- `findByLevel(level)`: Busca personajes por nivel
- `findByClass(characterClass)`: Busca personajes por clase
- `getTableInfo()`: Obtiene información de la tabla

## 🔧 Configuración avanzada

### Para producción

```typescript
const repository = new CharacterDynamoDBRepository(
    'production-characters-table',
    'us-west-2'
);
```

### Con credenciales específicas

```bash
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_REGION=us-east-1
```

## 🧪 Ejecutar pruebas

```bash
# Compilar y ejecutar pruebas
npm run dynamodb:test

# Limpiar después de las pruebas
npm run dynamodb:cleanup
```

## ⚠️ Consideraciones importantes

1. **Costos**: DynamoDB es un servicio de pago. Para desarrollo, usa DynamoDB Local.
2. **Permisos**: Asegúrate de tener los permisos IAM correctos para DynamoDB.
3. **Límites**: DynamoDB tiene límites de tamaño de item (400KB) y otros límites.
4. **Escalabilidad**: Para aplicaciones de alta escala, considera usar índices secundarios.

## 🚨 Troubleshooting

### Error: "Table does not exist"
```bash
npm run dynamodb:create
```

### Error: "AccessDenied"
Verifica tus credenciales AWS y permisos IAM.

### Error: "ResourceInUseException"
La tabla ya existe. Puedes describirla con:
```bash
npm run dynamodb:describe
```

## 📚 Recursos útiles

- [AWS DynamoDB Documentation](https://docs.aws.amazon.com/dynamodb/)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-dynamodb/)
- [DynamoDB Local](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html)
