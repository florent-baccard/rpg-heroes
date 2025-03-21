const http = require('http');
const { MongoClient } = require('mongodb');
const { handleCharacterRoutes } = require('./routes/characterRoutes');
const { handleGameRoutes } = require('./routes/gameRoutes');
const { initializeDatabase } = require('./config/initDb');

const url = process.env.MONGODB_URI || 'mongodb://mongodb:27017';
const dbName = 'gamerpg';
const port = process.env.PORT || 5000;

initializeDatabase().catch(console.error);

const server = http.createServer(async (req, res) => {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    try {
        const client = await MongoClient.connect(url);
        const db = client.db(dbName);

        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                req.body = body;
                console.log('Request URL:', req.url);
                console.log('Request Method:', req.method);
                console.log('Request Body:', body);

                if (req.url.startsWith('/api/characters')) {
                    await handleCharacterRoutes(req, res, db);
                } else if (req.url.startsWith('/api/game')) {
                    await handleGameRoutes(req, res, db);
                } else {
                    res.writeHead(404);
                    res.end(JSON.stringify({ error: 'Route non trouvée' }));
                }
            } catch (error) {
                console.error('Erreur:', error);
                res.writeHead(500);
                res.end(JSON.stringify({ error: error.message }));
            } finally {
                await client.close();
            }
        });
    } catch (error) {
        console.error('Erreur de connexion à MongoDB:', error);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Erreur de connexion à la base de données' }));
    }
});

server.listen(port, () => {
    console.log(`Serveur démarré sur le port ${port}`);
}); 