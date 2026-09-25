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

  // Ejercicio para los minutos 31–38: quitar .skip y observar el test rojo.
  it.skip('rechaza maná negativo al actualizar sin persistir', async () => {
    repository.updateCharacter.mockResolvedValue(null);

    await expect(service.updateCharacter('42', { mana_points: -1 })).rejects.toThrow(
      'Mana points cannot be negative',
    );
    expect(repository.updateCharacter).not.toHaveBeenCalled();
  });
});
