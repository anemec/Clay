export const adventureTemplates = [
    {
        id: 1,
        name: 'Old Road to Tuvale',
        goalType: 'town',
        ticksToGoal: 6,
        difficulty: 1,
        eventWeights: {
            battle: 0.5,
            encounter: 0.3,
            opportunity: 0.2
        }
    },
    {
        id: 2,
        name: 'Ruined Bastion',
        goalType: 'boss',
        ticksToGoal: 4,
        difficulty: 2,
        eventWeights: {
            battle: 0.6,
            encounter: 0.2,
            opportunity: 0.2
        }
    }
];
