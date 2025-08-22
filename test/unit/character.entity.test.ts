import { Character } from '../../src/character/character.entity';

describe('Character entity', () => {
  it('should create a Character with correct properties', () => {
    const character = new Character('Test', 'Mage', 1, 10, 10, 5, ['sword']);
    expect(character.name).toBe('Test');
    expect(character.characterClass).toBe('Mage');
    expect(character.level).toBe(1);
    expect(character.hp).toBe(10);
    expect(character.mana).toBe(10);
    expect(character.attack).toBe(5);
    expect(character.items).toEqual(['sword']);
  });
});
