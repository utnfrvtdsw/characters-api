import { Pool } from 'pg';
import type { PoolClient } from 'pg';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { CharacterRepositoryPostgres } from '../src/character/character.repository.postgres';
import { validCharacter } from './fixtures';

describe('CharacterRepositoryPostgres — integración con BD real', () => {
  let pool: Pool;
  let repository: CharacterRepositoryPostgres;
  let client: PoolClient | undefined;
  let container: StartedPostgreSqlContainer | undefined;

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:15-alpine')
      .withDatabase('characters_test')
      .withStartupTimeout(120_000)
      .start();
    pool = new Pool({
      connectionString: container.getConnectionUri(),
      connectionTimeoutMillis: 5000,
      query_timeout: 5000,
    });
    const schema = await readFile(resolve(__dirname, '../src/db/sql/init.sql'), 'utf8');
    await pool.query(schema);
  }, 180_000);

  beforeEach(async () => {
    client = await pool.connect();
    await client.query('BEGIN');
    repository = new CharacterRepositoryPostgres(client);
  });

  afterEach(async () => {
    if (client) {
      try {
        await client.query('ROLLBACK');
      } finally {
        client.release();
        client = undefined;
      }
    }
  });

  afterAll(async () => {
    try {
      if (pool) await pool.end();
    } finally {
      if (container) await container.stop();
    }
  }, 60_000);

  it('guarda y recupera todos los datos con un ID string', async () => {
    const saved = await repository.createCharacter(validCharacter);

    const found = await repository.getCharacterById(saved.id);

    expect(typeof saved.id).toBe('string');
    expect(saved.id.length).toBeGreaterThan(0);
    expect(found).toMatchObject({ ...validCharacter, id: saved.id });
    expect(found?.create_time).toBeInstanceOf(Date);
    expect(Number.isFinite(found?.create_time.getTime())).toBe(true);
  });

  it('actualiza el nivel y conserva los demás datos', async () => {
    const saved = await repository.createCharacter(validCharacter);

    await repository.updateCharacter(saved.id, { level: 2 });
    const found = await repository.getCharacterById(saved.id);

    expect(found).toMatchObject({ ...validCharacter, id: saved.id, level: 2 });
  });

  it('elimina el personaje y luego retorna null', async () => {
    const saved = await repository.createCharacter(validCharacter);

    await expect(repository.deleteCharacter(saved.id)).resolves.toBe(true);
    await expect(repository.getCharacterById(saved.id)).resolves.toBeNull();
    await expect(repository.deleteCharacter(saved.id)).resolves.toBe(false);
  });
});
