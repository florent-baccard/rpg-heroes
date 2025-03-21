import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import './GameEvent.css';

const GameEvent = ({ character, onChoiceMade }) => {
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadEvent = useCallback(async () => {
        if (!character?.currentEvent) {
            setEvent(null);
            setLoading(false);
            return;
        }
        try {
            const eventData = await api.getEvent(character.currentEvent);
            setEvent(eventData);
            setError(null);
        } catch (error) {
            console.error('Erreur lors du chargement de l\'événement:', error);
            setError('Erreur lors du chargement de l\'événement');
            setEvent(null);
        } finally {
            setLoading(false);
        }
    }, [character?.currentEvent]);

    useEffect(() => {
        loadEvent();
    }, [loadEvent]);

    const handleChoice = async (choiceId) => {
        try {
            setLoading(true);
            const result = await api.makeChoice(character._id, choiceId, event.id);
            
            if (result && result.updates) {
                onChoiceMade(result.updates);
                setError(null);
            } else {
                throw new Error('Réponse invalide du serveur');
            }
        } catch (error) {
            console.error('Erreur lors du choix:', error);
            setError('Erreur lors de l\'application du choix. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="game-event-loading">Chargement de l'événement...</div>;
    }

    if (error) {
        return <div className="game-event-error">{error}</div>;
    }

    if (!event) {
        return <div className="game-event-error">Événement non trouvé</div>;
    }

    if (!character?.stats) {
        return <div className="game-event-error">Erreur : statistiques du personnage non disponibles</div>;
    }

    return (
        <div className="game-event">
            <h2>{event.title}</h2>
            <p>{event.description}</p>

            <div className="character-status">
                <p>Niveau {character.level || 1}</p>
                <p>XP : {character.experience || 0}/{character.nextLevelXP || 100}</p>
                <p>Points de vie : {character.stats?.vie || 100}/{character.stats?.vieMax || 100}</p>
            </div>

            <div className="choices">
                {event.choices.map(choice => (
                    <div key={choice.id} className="choice">
                        <p>{choice.text}</p>
                        {choice.requirements && (
                            <div className="requirements">
                                <p>Prérequis:</p>
                                <ul>
                                    {Object.entries(choice.requirements).map(([stat, value]) => {
                                        const currentValue = character.stats[stat] || 0;
                                        return (
                                            <li key={stat} className={currentValue >= value ? 'met' : 'not-met'}>
                                                {stat}: {value} (Actuel: {currentValue})
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}
                        <button
                            onClick={() => handleChoice(choice.id)}
                            disabled={loading || (choice.requirements && !Object.entries(choice.requirements)
                                .every(([stat, value]) => (character.stats[stat] || 0) >= value))}
                        >
                            {loading ? 'Chargement...' : 'Choisir cette option'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GameEvent; 