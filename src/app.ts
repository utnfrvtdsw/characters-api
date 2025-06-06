import express from 'express';
import { Character } from './character/character.entity.js'

const app = express();

app.use(express.json())




app.get('/api/characters', (req, res) => {
  res.json(characters);
});

app.get('/api/character/:id', (req, res) => {
  
  const character = ;  
  
  if (!character) {
      res.status(404).json({ 
      errorMessage: 'Character not found',
      errorCode: 'CHARACTER_NOT_FOUND' });
      return;
  }

  res.json({ data: character });
});

// Middleware to sanitize character input
function sanitizeCharacterInput(req:any, res:any, next:any) {

  req.body.sanitizedInput = {
    name: req.body.name,
    characterClass: req.body.characterClass,
    level: req.body.level,
    hp: req.body.hp,
    mana: req.body.mana,
    attack: req.body.attack,
    items: req.body.items,
  }
  //more checks here

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key]
    }
  })

  next()
}

app.post('/api/characters', sanitizeCharacterInput , (req, res) => {

  const input = req.body;
  const newCharacter = new Character(
    input.name,
    input.characterClass,
    input.level,
    input.hp,
    input.mana,
    input.attack,
    input.items
  );
  
  res.status(201).json({ data: newCharacter });
}
);



app.listen(3000, () => {
  console.log('Server runnning on http://localhost:3000/')
})
