import { Character } from "./character.entity";
export class CharacterRepository {
    constructor() {
        this.characters = [new Character('John Doe', 'Warrior', 1, 100, 50, 10, ['Sword', 'Shield']), new Character('Jane Doe', 'Wizard', 1, 100, 50, 10, ['Sword', 'Shield'])];
    }
    findAll() {
        return this.characters;
    }
    findOne(id) {
        return this.characters.find(character => character.id === id);
    }
    save(character) {
        this.characters.push(character);
        return character;
    }
    delete(id) {
        this.characters = this.characters.filter(character => character.id !== id);
    }
}
//# sourceMappingURL=character.repository.js.map