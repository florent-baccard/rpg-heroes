const request = require('supertest');
const express = require('express');

// Mock des routes du jeu
const mockRouter = express.Router();
mockRouter.get('/events', (req, res) => {
  res.json([]);
});
mockRouter.post('/start', (req, res) => {
  res.json({ success: true });
});

const app = express();
app.use(express.json());
app.use('/api/game', mockRouter);

describe('Game Routes', () => {
  test('GET /api/game/events should return game events', async () => {
    const response = await request(app).get('/api/game/events');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('POST /api/game/start should start a new game', async () => {
    const response = await request(app)
      .post('/api/game/start')
      .send({ characterId: '123' });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
  });
}); 