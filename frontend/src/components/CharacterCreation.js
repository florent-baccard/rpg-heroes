import React, { useState } from 'react';
import { api } from '../services/api';
import './CharacterCreation.css';

const CharacterCreation = ({ onCharacterCreated, onClose }) => {
    const classDefinitions = {
        warrior: {
            name: 'Guerrier',
            description: 'Un combattant puissant spécialisé dans le combat rapproché',
            stats: {
                strength: 15,
                dexterity: 12,
                intelligence: 8,
                constitution: 15
            },
            icon: '⚔️'
        },
        mage: {
            name: 'Mage',
            description: 'Un utilisateur de magie maîtrisant les arcanes',
            stats: {
                strength: 6,
                dexterity: 8,
                intelligence: 18,
                constitution: 8
            },
            icon: '🔮'
        },
        rogue: {
            name: 'Voleur',
            description: 'Un expert en furtivité et en attaques précises',
            stats: {
                strength: 10,
                dexterity: 18,
                intelligence: 12,
                constitution: 10
            },
            icon: '🗡️'
        },
        priest: {
            name: 'Prêtre',
            description: 'Un guérisseur dévoué avec des pouvoirs divins',
            stats: {
                strength: 8,
                dexterity: 10,
                intelligence: 15,
                constitution: 12
            },
            icon: '✨'
        }
    };

    const [character, setCharacter] = useState({
        name: '',
        class: 'warrior',
        stats: classDefinitions.warrior.stats
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const createdCharacter = await api.createCharacter(character);
            onCharacterCreated(createdCharacter);
        } catch (error) {
            console.error('Erreur lors de la création du personnage:', error);
            alert('Erreur lors de la création du personnage: ' + error.message);
        }
    };

    const handleClassChange = (newClass) => {
        setCharacter(prev => ({
            ...prev,
            class: newClass,
            stats: classDefinitions[newClass].stats
        }));
    };

    const statTranslations = {
        strength: 'Force',
        dexterity: 'Dextérité',
        intelligence: 'Intelligence',
        constitution: 'Constitution'
    };

    return (
        <div className="character-creation">
            <button className="close-button" onClick={onClose}>×</button>
            <h2>Création de votre personnage</h2>
            <form onSubmit={handleSubmit}>
                <div className="name-section">
                    <label htmlFor="name">Nom du personnage</label>
                    <input
                        id="name"
                        type="text"
                        value={character.name}
                        onChange={(e) => setCharacter(prev => ({ ...prev, name: e.target.value }))}
                        required
                        placeholder="Entrez le nom de votre héros"
                    />
                </div>

                <div className="class-section">
                    <h3>Choisissez votre classe</h3>
                    <div className="class-grid">
                        {Object.entries(classDefinitions).map(([classKey, classInfo]) => (
                            <div
                                key={classKey}
                                className={`class-card ${character.class === classKey ? 'selected' : ''}`}
                                onClick={() => handleClassChange(classKey)}
                            >
                                <div className="class-icon">{classInfo.icon}</div>
                                <h4>{classInfo.name}</h4>
                                <p>{classInfo.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="stats-section">
                    <h3>Caractéristiques de classe</h3>
                    <div className="stats-grid">
                        {Object.entries(character.stats).map(([stat, value]) => (
                            <div key={stat} className="stat-display">
                                <span className="stat-label">{statTranslations[stat]}</span>
                                <div className="stat-bar-container">
                                    <div 
                                        className="stat-bar" 
                                        style={{width: `${(value / 20) * 100}%`}}
                                    ></div>
                                    <span className="stat-value">{value}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="buttons-container">
                    <button type="submit" className="create-button">
                        Créer le personnage
                    </button>
                    <button type="button" className="cancel-button" onClick={onClose}>
                        Annuler
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CharacterCreation; 