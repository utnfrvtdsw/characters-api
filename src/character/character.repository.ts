import { Repository } from "../shared/repository";
import { Character } from "./character.entity";

const characters: Character[] = [new Character(
    'John Doe',
    'Warrior',
    1,
    100,
    50,
    10,
    ['Sword', 'Shield']), new Character(
        'Jane Doe',
        'Wizard',
        1,
        100,
        50,
        10,
        ['Sword', 'Shield'])];

export class CharacterRepository implements Repository<Character> {
    findAll(): Character[] | undefined {
        return characters;
    }
    findOne(item: { id: string; }) {
        return characters.find((character) => character.id === item.id)
    }
    add(item: Character) {
        characters.push(item);
        return item;
    }
    update(item: Character) {
        const index = characters.findIndex((character) => character.id === item.id);
        if (index !== -1) {
            characters[index] = item;
            return item;
        }
        throw new Error("Character not found");
    }
    delete(item: { id: string; }) {
        const index = characters.findIndex((character) => character.id === item.id);
        if (index !== -1) {
            return characters.splice(index, 1)[0];
        }
        throw new Error("Character not found");
    }

}