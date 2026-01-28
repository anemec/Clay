export const craftingRecipes = [
    {
        id: 1,
        name: 'Bronze Sword',
        type: 'weapon',
        rarity: 'common',
        level: 1,
        value: 60,
        stats: { attack: 3 },
        materials: { Wood: 2, 'Iron Ore': 2 },
        description: 'A simple blade forged from bronze.'
    },
    {
        id: 2,
        name: 'Leather Armor',
        type: 'armor',
        rarity: 'common',
        level: 1,
        value: 55,
        stats: { defense: 3 },
        materials: { Wood: 1, Herbs: 3 },
        description: 'Light armor reinforced with treated leather.'
    },
    {
        id: 3,
        name: 'Reinforced Shield',
        type: 'armor',
        rarity: 'uncommon',
        level: 5,
        value: 140,
        stats: { defense: 7 },
        materials: { Wood: 4, Stone: 2, 'Iron Ore': 3 },
        description: 'A sturdy shield for the front line.'
    },
    {
        id: 4,
        name: 'Tidecaller Staff',
        type: 'weapon',
        rarity: 'uncommon',
        level: 5,
        value: 150,
        stats: { attack: 7 },
        materials: { Coral: 2, Shells: 3, Fish: 2 },
        description: 'A staff infused with ocean magic.'
    },
    {
        id: 5,
        name: 'Gemsteel Blade',
        type: 'weapon',
        rarity: 'rare',
        level: 12,
        value: 320,
        stats: { attack: 14 },
        materials: { Gems: 2, Crystals: 1, Ore: 3, Stone: 2 },
        description: 'A blade that glints with crystalline power.'
    }
];
