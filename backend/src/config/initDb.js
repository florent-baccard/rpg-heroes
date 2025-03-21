const { MongoClient } = require('mongodb');
const { gameEvents } = require('./gameEvents');

const url = process.env.MONGODB_URI || 'mongodb://mongodb:27017';
const dbName = 'gamerpg';

async function initializeDatabase() {
    try {
        const client = await MongoClient.connect(url);
        const db = client.db(dbName);

        const events = db.collection('events');
        await events.deleteMany({}); 
        await events.insertMany(gameEvents);

        console.log('Base de données initialisée avec succès');
        await client.close();
    } catch (error) {
        console.error('Erreur lors de l\'initialisation de la base de données:', error);
        throw error;
    }
}

module.exports = { initializeDatabase }; 