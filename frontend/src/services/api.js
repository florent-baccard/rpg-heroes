import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

export const api = {
    // Gestion des personnages
    async getCharacters() {
        const response = await fetch(`${API_URL}/characters`);
        if (!response.ok) throw new Error('Erreur lors de la récupération des personnages');
        return response.json();
    },

    async getCharacter(id) {
        const response = await axios.get(`${API_URL}/characters/${id}`);
        return response.data;
    },

    async createCharacter(characterData) {
        const response = await fetch(`${API_URL}/characters`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(characterData),
        });
        if (!response.ok) throw new Error('Erreur lors de la création du personnage');
        return response.json();
    },

    async updateCharacter(id, updates) {
        const response = await axios.put(`${API_URL}/characters/${id}`, updates);
        return response.data;
    },

    async deleteCharacter(characterId) {
        const response = await fetch(`${API_URL}/characters/${characterId}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Erreur lors de la suppression du personnage');
        return response.json();
    },

    // Gestion du jeu
    async getEvents() {
        const response = await axios.get(`${API_URL}/game/events`);
        return response.data;
    },

    async getEvent(eventId) {
        const response = await fetch(`${API_URL}/game/events/${eventId}`);
        if (!response.ok) throw new Error('Erreur lors de la récupération de l\'événement');
        return response.json();
    },

    async makeChoice(characterId, choiceId, eventId) {
        const response = await fetch(`${API_URL}/game/choice`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ characterId, choiceId, eventId }),
        });
        if (!response.ok) throw new Error('Erreur lors de l\'application du choix');
        return response.json();
    },

    // Nouvelles fonctions pour la gestion des sauvegardes
    async getGameSave(characterId) {
        const response = await fetch(`${API_URL}/game/save/${characterId}`);
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Aucune sauvegarde trouvée');
            }
            throw new Error('Erreur lors de la récupération de la sauvegarde');
        }
        return response.json();
    },

    async startGame(characterId) {
        const response = await fetch(`${API_URL}/game/start`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ characterId }),
        });
        if (!response.ok) throw new Error('Erreur lors du démarrage de la partie');
        return response.json();
    },

    async deleteGameSave(characterId) {
        const response = await fetch(`${API_URL}/game/save/${characterId}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Erreur lors de la suppression de la sauvegarde');
        return response.json();
    }
}; 