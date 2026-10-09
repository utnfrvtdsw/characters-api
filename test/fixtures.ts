import type { Character } from '../src/character/character.entity';

export const validCharacter: Omit<Character, 'id' | 'create_time'> = {
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
