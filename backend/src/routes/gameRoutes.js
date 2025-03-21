const { ObjectId } = require('mongodb');

const defaultStats = {
    vie: 100,
    vieMax: 100,
    force: 10,
    agilite: 10,
    intelligence: 10,
    constitution: 10
};

const EXPERIENCE_BASE = 100;

function calculateRequiredXP(level) {
    return EXPERIENCE_BASE * Math.pow(2, level - 1);
}

function calculateLevelAndXP(totalExperience) {
    let level = 1;
    let xp = totalExperience;

    while (xp >= calculateRequiredXP(level)) {
        xp -= calculateRequiredXP(level);
        level++;
    }

    return {
        level,
        currentXP: xp,
        requiredXP: calculateRequiredXP(level)
    };
}

function calculateMaxHP(level) {
    return defaultStats.vieMax + (level - 1) * 10;
}

function getExperienceReward(choice) {
    if (!choice.type) return 0;

    const rewards = {
        'combat': 50,
        'boss': 150,
        'quest': 75,
        'explore': 25,
        'dialogue': 10
    };

    return rewards[choice.type] || 0;
}

async function handleGameRoutes(req, res, db) {
    const events = db.collection('events');
    const characters = db.collection('characters');
    const gameSaves = db.collection('gameSaves');

    switch (req.method) {
        case 'GET':
            if (req.url === '/api/game/events') {
                const allEvents = await events.find({}).toArray();
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(allEvents));
            } else if (req.url.startsWith('/api/game/events/')) {
                const eventId = parseInt(req.url.split('/')[4]);
                const event = await events.findOne({ id: eventId });
                if (event) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(event));
                } else {
                    res.writeHead(404);
                    res.end(JSON.stringify({ error: 'Événement non trouvé' }));
                }
            } else if (req.url.startsWith('/api/game/save/')) {
                try {
                    const characterId = req.url.split('/')[4];
                    const gameSave = await gameSaves.findOne({ 
                        characterId: characterId.toString() 
                    });
                    
                    if (gameSave) {
                        const completeGameSave = {
                            ...gameSave,
                            stats: {
                                ...defaultStats,
                                ...gameSave.stats
                            }
                        };
                        
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(completeGameSave));
                    } else {
                        res.writeHead(404);
                        res.end(JSON.stringify({ error: 'Aucune sauvegarde trouvée' }));
                    }
                } catch (error) {
                    console.error('Erreur lors de la récupération de la sauvegarde:', error);
                    res.writeHead(500);
                    res.end(JSON.stringify({ error: 'Erreur lors de la récupération de la sauvegarde' }));
                }
            }
            break;

        case 'POST':
            if (req.url === '/api/game/choice') {
                const { characterId, choiceId, eventId } = JSON.parse(req.body);
                
                try {
                    const event = await events.findOne({ id: eventId });
                    const character = await characters.findOne({ _id: new ObjectId(characterId) });
                    
                    if (!event || !character) {
                        res.writeHead(404);
                        res.end(JSON.stringify({ error: 'Événement ou personnage non trouvé' }));
                        return;
                    }

                    character.stats = {
                        ...defaultStats,
                        ...character.stats
                    };

                    character.totalExperience = character.totalExperience || 0;
                    character.level = character.level || 1;

                    // Trouver le choix sélectionné
                    const choice = event.choices.find(c => c.id === choiceId);
                    if (!choice) {
                        res.writeHead(400);
                        res.end(JSON.stringify({ error: 'Choix invalide' }));
                        return;
                    }

                    if (choice.requirements) {
                        const meetsRequirements = Object.entries(choice.requirements)
                            .every(([stat, value]) => character.stats[stat] >= value);
                        
                        if (!meetsRequirements) {
                            res.writeHead(400);
                            res.end(JSON.stringify({ error: 'Prérequis non satisfaits' }));
                            return;
                        }
                    }

                    const experienceGained = getExperienceReward(choice) || 25;
                    const oldLevel = character.level || 1;
                    const newTotalExperience = (character.totalExperience || 0) + experienceGained;
                    const levelInfo = calculateLevelAndXP(newTotalExperience);
                    const levelUp = levelInfo.level > oldLevel;

                    const updates = {
                        currentEvent: choice.consequences.nextEvent,
                        choices: [...(character.choices || []), choiceId],
                        totalExperience: newTotalExperience,
                        experience: levelInfo.currentXP,
                        nextLevelXP: levelInfo.requiredXP,
                        level: levelInfo.level,
                        stats: { ...character.stats }
                    };

                    if (levelUp) {
                        console.log(`Niveau supérieur ! ${oldLevel} -> ${levelInfo.level}`);
                        console.log(`XP actuelle: ${levelInfo.currentXP}/${levelInfo.requiredXP}`);
                        
                        const newVieMax = calculateMaxHP(levelInfo.level);
                        
                        updates.stats = {
                            ...character.stats,
                            vie: Math.min(character.stats?.vie || newVieMax, newVieMax),
                            vieMax: newVieMax,
                            force: character.stats.force + 2,
                            agilite: character.stats.agilite + 2,
                            intelligence: character.stats.intelligence + 2,
                            constitution: character.stats.constitution + 2
                        };
                    }

                    if (choice.consequences.stats) {
                        Object.entries(choice.consequences.stats).forEach(([stat, value]) => {
                            updates.stats[stat] = (updates.stats[stat] || 0) + value;
                        });
                    }

                    updates.inventory = [...(character.inventory || [])];
                    if (choice.consequences.inventory) {
                        if (choice.consequences.inventory.add) {
                            choice.consequences.inventory.add.forEach(item => {
                                const existingItem = updates.inventory.find(i => i.id === item.id);
                                if (existingItem) {
                                    existingItem.quantity += 1;
                                } else {
                                    updates.inventory.push({ ...item, quantity: 1 });
                                }
                            });
                        }
                        if (choice.consequences.inventory.remove) {
                            choice.consequences.inventory.remove.forEach(itemId => {
                                updates.inventory = updates.inventory.filter(i => i.id !== itemId);
                            });
                        }
                    }

                    await characters.updateOne(
                        { _id: new ObjectId(characterId) },
                        { $set: updates }
                    );

                    const saveData = {
                        characterId: characterId.toString(),
                        currentEvent: updates.currentEvent,
                        stats: updates.stats,
                        inventory: updates.inventory,
                        choices: updates.choices,
                        totalExperience: updates.totalExperience,
                        experience: updates.experience,
                        nextLevelXP: updates.nextLevelXP,
                        level: updates.level,
                        lastUpdated: new Date()
                    };

                    await gameSaves.updateOne(
                        { characterId: characterId.toString() },
                        { $set: saveData },
                        { upsert: true }
                    );

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 
                        message: 'Choix appliqué et partie sauvegardée',
                        updates
                    }));
                } catch (error) {
                    console.error('Erreur lors de l\'application du choix:', error);
                    res.writeHead(500);
                    res.end(JSON.stringify({ error: 'Erreur lors de l\'application du choix' }));
                }
            } else if (req.url === '/api/game/start') {
                try {
                    const { characterId } = JSON.parse(req.body);

                    const existingSave = await gameSaves.findOne({ 
                        characterId: characterId.toString() 
                    });
                    
                    if (existingSave) {

                        const levelInfo = calculateLevelAndXP(existingSave.totalExperience || 0);
                        const newVieMax = calculateMaxHP(levelInfo.level);
                        const completeStats = {
                            ...defaultStats,
                            ...existingSave.stats,
                            vieMax: newVieMax,
                            vie: Math.min(existingSave.stats?.vie || newVieMax, newVieMax)
                        };

                        const updatedSave = {
                            ...existingSave,
                            stats: completeStats,
                            totalExperience: existingSave.totalExperience || 0,
                            experience: levelInfo.currentXP,
                            nextLevelXP: levelInfo.requiredXP,
                            level: levelInfo.level
                        };

                        await characters.updateOne(
                            { _id: new ObjectId(characterId) },
                            { $set: {
                                currentEvent: updatedSave.currentEvent,
                                stats: updatedSave.stats,
                                inventory: updatedSave.inventory || [],
                                choices: updatedSave.choices || [],
                                totalExperience: updatedSave.totalExperience,
                                experience: updatedSave.experience,
                                nextLevelXP: updatedSave.nextLevelXP,
                                level: updatedSave.level
                            }}
                        );
                        
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ 
                            message: 'Partie chargée avec succès',
                            saveData: updatedSave
                        }));
                    } else {

                        const initialGameState = {
                            currentEvent: 1,
                            stats: { 
                                ...defaultStats,
                                vie: defaultStats.vieMax,
                                vieMax: defaultStats.vieMax
                            },
                            inventory: [],
                            choices: [],
                            totalExperience: 0,
                            experience: 0,
                            nextLevelXP: EXPERIENCE_BASE,
                            level: 1
                        };

                        await characters.updateOne(
                            { _id: new ObjectId(characterId) },
                            { $set: initialGameState }
                        );

                        const saveData = {
                            characterId: characterId.toString(),
                            ...initialGameState,
                            lastUpdated: new Date()
                        };

                        await gameSaves.insertOne(saveData);

                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ 
                            message: 'Nouvelle partie créée',
                            gameState: initialGameState
                        }));
                    }
                } catch (error) {
                    console.error('Erreur lors du démarrage de la partie:', error);
                    res.writeHead(500);
                    res.end(JSON.stringify({ error: 'Erreur lors du démarrage de la partie' }));
                }
            }
            break;

        case 'DELETE':
            if (req.url.startsWith('/api/game/save/')) {
                try {
                    const characterId = req.url.split('/')[4];
                    await gameSaves.deleteOne({ characterId: characterId.toString() });
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Sauvegarde supprimée avec succès' }));
                } catch (error) {
                    console.error('Erreur lors de la suppression de la sauvegarde:', error);
                    res.writeHead(500);
                    res.end(JSON.stringify({ error: 'Erreur lors de la suppression de la sauvegarde' }));
                }
            }
            break;
    }
}

module.exports = { handleGameRoutes }; 