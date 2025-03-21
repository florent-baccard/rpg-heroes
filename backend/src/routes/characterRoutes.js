const { ObjectId } = require('mongodb');

async function handleCharacterRoutes(req, res, db) {
    const characters = db.collection('characters');

    switch (req.method) {
        case 'GET':
            if (req.url === '/api/characters') {
                const allCharacters = await characters.find({}).toArray();
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(allCharacters));
            } else {
                const id = req.url.split('/')[3];
                const character = await characters.findOne({ _id: new ObjectId(id) });
                if (character) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(character));
                } else {
                    res.writeHead(404);
                    res.end(JSON.stringify({ error: 'Personnage non trouvé' }));
                }
            }
            break;

        case 'POST':
            if (req.url === '/api/characters') {
                let character = JSON.parse(req.body);

                character.stats = {
                    hp: 100,
                    maxHp: 100,
                    strength: parseInt(character.stats.strength) || 10,
                    dexterity: parseInt(character.stats.dexterity) || 10,
                    intelligence: parseInt(character.stats.intelligence) || 10,
                    constitution: parseInt(character.stats.constitution) || 10
                };
                character.inventory = [];
                character.equipment = {
                    weapon: null,
                    armor: null,
                    accessories: []
                };
                character.level = 1;
                character.experience = 0;
                character.currentEvent = null;
                character.gameState = 'active';
                character.choices = [];

                const result = await characters.insertOne(character);
                character._id = result.insertedId;
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(character));
            }
            break;

        case 'PUT':
            if (req.url.startsWith('/api/characters/')) {
                const id = req.url.split('/')[3];
                const updates = JSON.parse(req.body);
                const result = await characters.updateOne(
                    { _id: new ObjectId(id) },
                    { $set: updates }
                );
                if (result.modifiedCount > 0) {
                    const updatedCharacter = await characters.findOne({ _id: new ObjectId(id) });
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(updatedCharacter));
                } else {
                    res.writeHead(404);
                    res.end(JSON.stringify({ error: 'Personnage non trouvé' }));
                }
            }
            break;

        case 'DELETE':
            if (req.url.startsWith('/api/characters/')) {
                const id = req.url.split('/')[3];
                const result = await characters.deleteOne({ _id: new ObjectId(id) });
                if (result.deletedCount > 0) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Personnage supprimé avec succès' }));
                } else {
                    res.writeHead(404);
                    res.end(JSON.stringify({ error: 'Personnage non trouvé' }));
                }
            }
            break;
    }
}

module.exports = { handleCharacterRoutes }; 