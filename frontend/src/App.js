import React, { useState, useEffect, useCallback } from 'react';
import { api } from './services/api';
import CharacterCreation from './components/CharacterCreation';
import GameEvent from './components/GameEvent';
import GameStart from './components/GameStart';
import './App.css';

function App() {
    const [characters, setCharacters] = useState([]);
    const [selectedCharacter, setSelectedCharacter] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCreation, setShowCreation] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);

    const loadCharacters = useCallback(async () => {
        try {
            const loadedCharacters = await api.getCharacters();
            setCharacters(loadedCharacters);
            if (loadedCharacters.length > 0 && !selectedCharacter) {
                setSelectedCharacter(loadedCharacters[0]);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des personnages:', error);
        } finally {
            setLoading(false);
        }
    }, [selectedCharacter]);

    useEffect(() => {
        loadCharacters();
    }, [loadCharacters]);

    const handleCharacterCreated = (newCharacter) => {
        setCharacters(prev => [...prev, newCharacter]);
        setSelectedCharacter(newCharacter);
        setShowCreation(false);
    };

    const handleCharacterSelect = (character) => {
        setSelectedCharacter(character);
        setGameStarted(false);
    };

    const handleDeleteCharacter = async () => {
        if (!selectedCharacter) return;
        
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${selectedCharacter.name} ?`)) {
            try {
                await api.deleteCharacter(selectedCharacter._id);
                try {
                    await api.deleteGameSave(selectedCharacter._id);
                } catch (error) {
                    console.log('Pas de sauvegarde à supprimer');
                }
                setCharacters(prev => prev.filter(char => char._id !== selectedCharacter._id));
                setSelectedCharacter(characters.length > 1 ? characters[0] : null);
                setGameStarted(false);
            } catch (error) {
                console.error('Erreur lors de la suppression du personnage:', error);
                alert('Erreur lors de la suppression du personnage');
            }
        }
    };

    const handleChoiceMade = async (updates) => {
        try {
            setSelectedCharacter(prev => ({
                ...prev,
                currentEvent: updates.currentEvent,
                stats: updates.stats,
                inventory: updates.inventory,
                choices: updates.choices,
                experience: updates.experience,
                nextLevelXP: updates.nextLevelXP,
                level: updates.level,
                totalExperience: updates.totalExperience
            }));
        } catch (error) {
            console.error('Erreur lors de la mise à jour du personnage:', error);
        }
    };

    const handleGameStart = (gameState) => {
        if (!gameState || !gameState.stats) {
            console.error('État de jeu invalide:', gameState);
            return;
        }

        const defaultStats = {
            vie: 100,
            force: 10,
            agilite: 10,
            intelligence: 10,
            constitution: 10
        };

        setSelectedCharacter(prev => ({
            ...prev,
            currentEvent: gameState.currentEvent || 1,
            stats: {
                ...defaultStats,
                ...gameState.stats
            },
            inventory: gameState.inventory || [],
            choices: gameState.choices || []
        }));
        setGameStarted(true);
    };

    if (loading) {
        return <div>Chargement...</div>;
    }

    return (
        <div className="App">
            <header className="App-header">
                <h1>Game RPG</h1>
                <p>Bienvenue dans votre aventure !</p>
            </header>
            
            <div className="game-container">
                <div className="characters-list">
                    {characters.length > 0 && (
                        <div className="character-select">
                            <h3>Sélectionnez un personnage</h3>
                            <div className="character-buttons">
                                {characters.map(char => (
                                    <button
                                        key={char._id}
                                        onClick={() => handleCharacterSelect(char)}
                                        className={`character-button ${selectedCharacter && selectedCharacter._id === char._id ? 'selected' : ''}`}
                                    >
                                        {char.name} - {char.class} (Niveau {char.level || 1})
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    <div className="character-actions">
                        <button 
                            onClick={() => setShowCreation(true)} 
                            className="new-character-button"
                        >
                            Créer un nouveau personnage
                        </button>
                        
                        {selectedCharacter && (
                            <button 
                                onClick={handleDeleteCharacter}
                                className="delete-character-button"
                            >
                                Supprimer {selectedCharacter.name}
                            </button>
                        )}
                    </div>
                </div>

                {selectedCharacter && (
                    <div className="game-content">
                        <div className="character-info">
                            <h2>{selectedCharacter.name}</h2>
                            <div className="stats">
                                <h3>Caractéristiques</h3>
                                <div className="stats-grid">
                                    <div className="stat-item">
                                        <span>Niveau:</span> {selectedCharacter.level || 1}
                                    </div>
                                    <div className="stat-item">
                                        <span>Expérience:</span> {selectedCharacter.experience || 0}/{selectedCharacter.nextLevelXP || 100}
                                    </div>
                                    <div className="stat-item">
                                        <span>Points de vie:</span> {selectedCharacter.stats?.vie || 100}/{selectedCharacter.stats?.vieMax || 100}
                                    </div>
                                    <div className="stat-item">
                                        <span>Force:</span> {selectedCharacter.stats?.force || 10}
                                    </div>
                                    <div className="stat-item">
                                        <span>Dextérité:</span> {selectedCharacter.stats?.agilite || 10}
                                    </div>
                                    <div className="stat-item">
                                        <span>Intelligence:</span> {selectedCharacter.stats?.intelligence || 10}
                                    </div>
                                    <div className="stat-item">
                                        <span>Constitution:</span> {selectedCharacter.stats?.constitution || 10}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {!gameStarted ? (
                            <GameStart 
                                character={selectedCharacter}
                                onGameStart={handleGameStart}
                            />
                        ) : (
                            <GameEvent 
                                character={selectedCharacter} 
                                onChoiceMade={handleChoiceMade} 
                            />
                        )}
                    </div>
                )}

                {showCreation && (
                    <div className="creation-overlay">
                        <div className="creation-content">
                            <CharacterCreation 
                                onCharacterCreated={handleCharacterCreated}
                                onClose={() => setShowCreation(false)}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App; 