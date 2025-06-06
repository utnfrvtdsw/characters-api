import crypto from 'node:crypto';
export class Character {
    constructor(name, characterClass, level, hp, mana, attack, items, id = crypto.randomUUID()) {
        this.name = name;
        this.characterClass = characterClass;
        this.level = level;
        this.hp = hp;
        this.mana = mana;
        this.attack = attack;
        this.items = items;
        this.id = id;
    }
}
//# sourceMappingURL=character.js.map