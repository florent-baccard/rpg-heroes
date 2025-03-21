import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import './GameStart.css';

const GameStart = ({ character, onGameStart }) => {
    const [loading, setLoading] = useState(true);
    const [hasSave, setHasSave] = useState(false);
    const [error, setError] = useState(null);

    const defaultStats = {
        vie: 100,
        force: 10,
        agilite: 10,
        intelligence: 10,
        constitution: 10
    };

    useEffect(() => {
        const checkSave = async () => {
            if (!character?._id) {
                setLoading(false);
                return;
            }

            try {
                await api.getGameSave(character._id);
                setHasSave(true);
                setError(null);
            } catch (error) {
                if (error.message === 'Aucune sauvegarde trouvée') {
                    setHasSave(false);
                    setError(null);
                } else {
                    console.error('Erreur lors de la vérification de la sauvegarde:', error);
                    setError('Erreur lors de la vérification de la sauvegarde');
                }
            } finally {
                setLoading(false);
            }
        };

        checkSave();
    }, [character?._id]);

    const handleStartGame = async () => {
        setError(null);
        setLoading(true);
        
        try {
            const response = await api.startGame(character._id);
            
            if (!response) {
                throw new Error('Réponse invalide du serveur');
            }

            const gameData = response.gameState || response.saveData;
            
            if (!gameData) {
                throw new Error('Données de jeu invalides');
            }

            const completeGameData = {
                ...gameData,
                stats: {
                    ...defaultStats,
                    ...(gameData.stats || {})  
                },
                inventory: gameData.inventory || [],
                choices: gameData.choices || [],
                currentEvent: gameData.currentEvent || 1
            };

            onGameStart(completeGameData);
        } catch (error) {
            console.error('Erreur lors du démarrage de la partie:', error);
            setError('Erreur lors du démarrage de la partie. Veuillez réessayer.');
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="game-start-loading">Chargement...</div>;
    }

    if (error) {
        return <div className="game-start-error">{error}</div>;
    }

    return (
        <div className="game-start-container">
            <h2>Bienvenue, {character?.name || 'Aventurier'} !</h2>
            {hasSave ? (
                <div className="game-start-options">
                    <p>Une partie sauvegardée a été trouvée.</p>
                    <button 
                        onClick={handleStartGame} 
                        className="btn-resume"
                        disabled={loading}
                    >
                        {loading ? 'Chargement...' : 'Reprendre la partie'}
                    </button>
                </div>
            ) : (
                <div className="game-start-options">
                    <p>Aucune partie en cours.</p>
                    <button 
                        onClick={handleStartGame} 
                        className="btn-new-game"
                        disabled={loading}
                    >
                        {loading ? 'Chargement...' : 'Nouvelle partie'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default GameStart; 