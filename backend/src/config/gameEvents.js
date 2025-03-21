const gameEvents = [
    {
        id: 1,
        title: "L'entrée de la forêt",
        description: "Vous vous trouvez à l'orée d'une forêt sombre. Un sentier mène vers les profondeurs des bois, tandis qu'un grognement inquiétant résonne au loin.",
        choices: [
            {
                id: 1,
                text: "Suivre le sentier principal",
                consequences: {
                    nextEvent: 2
                }
            },
            {
                id: 2,
                text: "Explorer les buissons suspects",
                consequences: {
                    nextEvent: 3,
                    stats: {
                        intelligence: 1
                    }
                }
            }
        ]
    },
    {
        id: 2,
        title: "Combat : Le Gobelin",
        description: "Un gobelin surgit de derrière un arbre ! Il est petit mais semble féroce, brandissant une dague rouillée.",
        choices: [
            {
                id: 3,
                text: "Attaquer directement",
                requirements: {
                    force: 3
                },
                consequences: {
                    nextEvent: 4,
                    stats: {
                        force: 1,
                        vie: -2
                    },
                    inventory: {
                        add: [{ id: "dague_gobelin", name: "Dague rouillée", type: "arme" }]
                    }
                }
            },
            {
                id: 4,
                text: "Tenter de le contourner furtivement",
                requirements: {
                    agilite: 3
                },
                consequences: {
                    nextEvent: 5,
                    stats: {
                        agilite: 1
                    }
                }
            },
            {
                id: 5,
                text: "Tenter de négocier",
                consequences: {
                    nextEvent: 6,
                    stats: {
                        vie: -4
                    }
                }
            }
        ]
    },
    {
        id: 3,
        title: "La cachette",
        description: "Dans les buissons, vous découvrez une vieille sacoche contenant quelques potions.",
        choices: [
            {
                id: 6,
                text: "Prendre les potions et continuer",
                consequences: {
                    nextEvent: 2,
                    inventory: {
                        add: [
                            { id: "potion_vie", name: "Potion de vie", type: "consommable" },
                            { id: "potion_force", name: "Potion de force", type: "consommable" }
                        ]
                    }
                }
            }
        ]
    },
    {
        id: 4,
        title: "Victoire sur le Gobelin",
        description: "Vous avez vaincu le gobelin ! Son corps gît à vos pieds, et vous remarquez un passage plus profond dans la forêt.",
        choices: [
            {
                id: 7,
                text: "Continuer vers les profondeurs",
                consequences: {
                    nextEvent: 7
                }
            },
            {
                id: 8,
                text: "Fouiller davantage les environs",
                consequences: {
                    nextEvent: 5,
                    stats: {
                        intelligence: 1
                    }
                }
            }
        ]
    },
    {
        id: 5,
        title: "Le campement abandonné",
        description: "Vous découvrez un petit campement abandonné. Des traces de lutte sont visibles.",
        choices: [
            {
                id: 9,
                text: "Fouiller le campement",
                consequences: {
                    nextEvent: 7,
                    inventory: {
                        add: [
                            { id: "epee_acier", name: "Épée en acier", type: "arme" },
                            { id: "potion_vie", name: "Potion de vie", type: "consommable" }
                        ]
                    }
                }
            }
        ]
    },
    {
        id: 6,
        title: "Négociation échouée",
        description: "Le gobelin ne semble pas intéressé par la discussion et vous attaque par surprise !",
        choices: [
            {
                id: 10,
                text: "Fuir vers la forêt",
                consequences: {
                    nextEvent: 7,
                    stats: {
                        vie: -1
                    }
                }
            }
        ]
    },
    {
        id: 7,
        title: "Combat : Le Troll",
        description: "Un énorme troll bloque le passage ! Il tient une massue aussi grande que vous.",
        choices: [
            {
                id: 11,
                text: "Attaquer avec tout ce que vous avez",
                requirements: {
                    force: 5
                },
                consequences: {
                    nextEvent: 8,
                    stats: {
                        force: 2,
                        vie: -5
                    },
                    inventory: {
                        add: [{ id: "massue_troll", name: "Massue du Troll", type: "arme" }]
                    }
                }
            },
            {
                id: 12,
                text: "Utiliser l'environnement à votre avantage",
                requirements: {
                    intelligence: 4,
                    agilite: 4
                },
                consequences: {
                    nextEvent: 8,
                    stats: {
                        intelligence: 2,
                        agilite: 1
                    }
                }
            }
        ]
    },
    {
        id: 8,
        title: "Victoire !",
        description: "Vous avez vaincu le troll ! La forêt semble s'éclaircir devant vous, révélant un ancien temple...",
        choices: [
            {
                id: 13,
                text: "Explorer le temple (À suivre...)",
                consequences: {
                    nextEvent: 1, // Retour au début pour l'instant
                    stats: {
                        intelligence: 1,
                        force: 1,
                        agilite: 1
                    }
                }
            }
        ]
    }
];

module.exports = { gameEvents }; 