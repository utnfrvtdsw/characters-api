import { CharacterController } from '../../src/character/character.controller';
import { Character } from '../../src/character/character.entity';

describe('CharacterController', () => {
  let controller: CharacterController;
  let req: any;
  let res: any;
  let mockRepository: any;

  beforeEach(() => {
    mockRepository = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      add: jest.fn(),
    };
    controller = new CharacterController(mockRepository);
    req = { params: {}, body: {} };
    res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    jest.clearAllMocks();
  });

  it('findAllCharacters should return all characters', async () => {
    const characters = [new Character('Test', 'Mage', 1, 10, 10, 5, [])];
    mockRepository.findAll.mockResolvedValue(characters);
    await controller.findAllCharacters(req, res);
    expect(res.json).toHaveBeenCalledWith(characters);
  });

  it('findCharacterById should return a character if found', async () => {
    const character = new Character('Test', 'Mage', 1, 10, 10, 5, []);
    req.params.id = '1';
    mockRepository.findOne.mockResolvedValue(character);
    await controller.findCharacterById(req, res);
    expect(res.json).toHaveBeenCalledWith({ data: character });
  });

  it('findCharacterById should return 404 if not found', async () => {
    req.params.id = '1';
    mockRepository.findOne.mockResolvedValue(undefined);
    await controller.findCharacterById(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      errorMessage: 'Character not found',
      errorCode: 'CHARACTER_NOT_FOUND',
    });
  });

  it('addCharacter should add and return the new character', async () => {
    req.body = {
      name: 'Test',
      characterClass: 'Mage',
      level: 1,
      hp: 10,
      mana: 10,
      attack: 5,
      items: [],
    };
    mockRepository.add.mockResolvedValue(req.body);
    await controller.addCharacter(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ data: expect.objectContaining(req.body) });
  });
});
