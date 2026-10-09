import { CharacterService } from '../src/character/character.service';
import type { CharacterRepository } from '../src/character/character.repository.interface';
import { Character } from '../src/character/character.entity';


const validCharacter: Omit<Character, 'id' | 'create_time'> = {
  name: 'Luna',
  nickname: null,
  class_name: 'Mage',
  race: 'Human',
  level: 1,
  experience_points: 0,
  health_points: 100,
  mana_points: 50,
  strength: 10,
  agility: 10,
  intelligence: 10,
  defense: 10,
  is_alive: true,
  avatar_url: null,
  backstory: null,
};

describe('CharacterService — pruebas unitarias', () => {
  let repository: jest.Mocked<CharacterRepository>;
  let service: CharacterService;

  beforeEach(() => {
    // Un doble nuevo en cada test: no hay conexión con PostgreSQL.
    repository = {
      createCharacter: jest.fn(),
      getCharacterById: jest.fn(),
      getCharacters: jest.fn(),
      updateCharacter: jest.fn(),
      deleteCharacter: jest.fn(),
    };
    service = new CharacterService(repository);
  });

  it.each([0, 101])('rechaza nivel %i sin persistir', async (level) => {
    // Arrange: todos los datos válidos excepto el nivel.
    const input = { ...validCharacter, level };

    // Act + Assert: esperar y comprobar la promesa rechazada.
    await expect(service.createCharacter(input)).rejects.toThrow(
      'Character level must be between 1 and 100',
    );
    expect(repository.createCharacter).not.toHaveBeenCalled();
  });

  it.each([1, 100])('acepta el límite válido %i', async (level) => {
    const input = { ...validCharacter, level };
    const saved = { ...input, id: '42', create_time: new Date('2026-01-01') };
    repository.createCharacter.mockResolvedValue(saved);

    const result = await service.createCharacter(input);

    expect(result).toEqual(saved);
    expect(repository.createCharacter).toHaveBeenCalledTimes(1);
    expect(repository.createCharacter).toHaveBeenCalledWith(input);
  });

  it.each(['', '   ', 'a'.repeat(101)])('rechaza un nombre inválido: %j', async (name) => {
    await expect(service.createCharacter({ ...validCharacter, name })).rejects.toThrow();
    expect(repository.createCharacter).not.toHaveBeenCalled();
  });

  it('retorna null cuando el personaje no existe', async () => {
    repository.getCharacterById.mockResolvedValue(null);

    await expect(service.getCharacterById('42')).resolves.toBeNull();
    expect(repository.getCharacterById).toHaveBeenCalledWith('42');
  });

  it('rechaza un ID vacío sin consultar el repositorio', async () => {
    await expect(service.getCharacterById('   ')).rejects.toThrow('Character ID is required');
    expect(repository.getCharacterById).not.toHaveBeenCalled();
  });

  it('propaga el error inesperado del repositorio', async () => {
    repository.createCharacter.mockRejectedValue(new Error('DB unavailable'));

    await expect(service.createCharacter(validCharacter)).rejects.toThrow('DB unavailable');
  });

  describe('consultas', () => {
    it.each([
      { characters: [] },
      { characters: [{ ...validCharacter, id: '42', create_time: new Date('2026-01-01') }] },
    ])(
      'retorna la lista del repositorio: $characters', async ({ characters }) => {
        repository.getCharacters.mockResolvedValue(characters);

        await expect(service.getAllCharacters()).resolves.toBe(characters);
        expect(repository.getCharacters).toHaveBeenCalledTimes(1);
        expect(repository.getCharacters).toHaveBeenCalledWith();
      },
    );

    it('retorna el personaje encontrado', async () => {
      const character = { ...validCharacter, id: '42', create_time: new Date('2026-01-01') };
      repository.getCharacterById.mockResolvedValue(character);

      await expect(service.getCharacterById('42')).resolves.toBe(character);
      expect(repository.getCharacterById).toHaveBeenCalledTimes(1);
      expect(repository.getCharacterById).toHaveBeenCalledWith('42');
    });
  });

  describe('validaciones al crear', () => {
    it.each([
      ['experience_points', -1, 'Experience points cannot be negative'],
      ['health_points', 0, 'Health points must be at least 1'],
      ['mana_points', -1, 'Mana points cannot be negative'],
      ...(['strength', 'agility', 'intelligence', 'defense'] as const).flatMap((stat) =>
        [0, 101].map((value) => [stat, value, `${stat} must be between 1 and 100`]),
      ),
    ])('rechaza %s = %s sin persistir', async (field, value, message) => {
      await expect(service.createCharacter({ ...validCharacter, [field]: value }))
        .rejects.toThrow(String(message));
      expect(repository.createCharacter).not.toHaveBeenCalled();
    });

    it.each([1, 100])('acepta los límites válidos de atributos: %i', async (stat) => {
      const input = {
        ...validCharacter, name: 'a'.repeat(100), experience_points: 0,
        health_points: 1, mana_points: 0,
        strength: stat, agility: stat, intelligence: stat, defense: stat,
      };
      const saved = { ...input, id: '42', create_time: new Date('2026-01-01') };
      repository.createCharacter.mockResolvedValue(saved);

      await expect(service.createCharacter(input)).resolves.toBe(saved);
      expect(repository.createCharacter).toHaveBeenCalledWith(input);
    });
  });

  describe('IDs requeridos', () => {
    it.each(['', '   '])('rechaza el ID %j en todas las operaciones por ID', async (id) => {
      await expect(service.getCharacterById(id)).rejects.toThrow('Character ID is required');
      await expect(service.updateCharacter(id, { level: 1 })).rejects.toThrow('Character ID is required');
      await expect(service.deleteCharacter(id)).rejects.toThrow('Character ID is required');

      expect(repository.getCharacterById).not.toHaveBeenCalled();
      expect(repository.updateCharacter).not.toHaveBeenCalled();
      expect(repository.deleteCharacter).not.toHaveBeenCalled();
    });
  });

  describe('actualización', () => {
    it('rechaza una actualización vacía', async () => {
      await expect(service.updateCharacter('42', {})).rejects.toThrow('No data provided for update');
      expect(repository.updateCharacter).not.toHaveBeenCalled();
    });

    it.each([
      [{ level: 0 }, 'Character level must be between 1 and 100'],
      [{ level: 101 }, 'Character level must be between 1 and 100'],
      [{ experience_points: -1 }, 'Experience points cannot be negative'],
      [{ health_points: 0 }, 'Health points must be at least 1'],
    ])('rechaza datos inválidos: %j', async (input, message) => {
      await expect(service.updateCharacter('42', input)).rejects.toThrow(message);
      expect(repository.updateCharacter).not.toHaveBeenCalled();
    });

    it.each([{ name: 'Sol' }, { level: 1 }, { level: 100 }, { experience_points: 0 }, { health_points: 1 }])(
      'persiste una actualización parcial válida: %j', async (input) => {
        const saved = { ...validCharacter, ...input, id: '42', create_time: new Date('2026-01-01') };
        repository.updateCharacter.mockResolvedValue(saved);

        await expect(service.updateCharacter('42', input)).resolves.toBe(saved);
        expect(repository.updateCharacter).toHaveBeenCalledTimes(1);
        expect(repository.updateCharacter).toHaveBeenCalledWith('42', input);
      },
    );

    it('retorna null si el personaje a actualizar no existe', async () => {
      repository.updateCharacter.mockResolvedValue(null);

      await expect(service.updateCharacter('42', { level: 2 })).resolves.toBeNull();
      expect(repository.updateCharacter).toHaveBeenCalledWith('42', { level: 2 });
    });
  });

  describe('eliminación', () => {
    it.each([true, false])('retorna el resultado del repositorio: %s', async (deleted) => {
      repository.deleteCharacter.mockResolvedValue(deleted);

      await expect(service.deleteCharacter('42')).resolves.toBe(deleted);
      expect(repository.deleteCharacter).toHaveBeenCalledTimes(1);
      expect(repository.deleteCharacter).toHaveBeenCalledWith('42');
    });
  });

  describe('errores del repositorio', () => {
    it('propaga los errores de consulta, actualización y eliminación', async () => {
      const error = new Error('DB unavailable');
      repository.getCharacters.mockRejectedValue(error);
      repository.getCharacterById.mockRejectedValue(error);
      repository.updateCharacter.mockRejectedValue(error);
      repository.deleteCharacter.mockRejectedValue(error);

      await expect(service.getAllCharacters()).rejects.toBe(error);
      await expect(service.getCharacterById('42')).rejects.toBe(error);
      await expect(service.updateCharacter('42', { level: 2 })).rejects.toBe(error);
      await expect(service.deleteCharacter('42')).rejects.toBe(error);
    });
  });

  it.skip('rechaza maná negativo al actualizar sin persistir', async () => {
    repository.updateCharacter.mockResolvedValue(null);

    await expect(service.updateCharacter('42', { mana_points: -1 })).rejects.toThrow(
      'Mana points cannot be negative',
    );
    expect(repository.updateCharacter).not.toHaveBeenCalled();
  });
});
