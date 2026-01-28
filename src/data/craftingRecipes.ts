export const craftingRecipes = [
    {
        id: 1,
        name: 'Bronze Sword',
        type: 'weapon',
        rarity: 'common',
        tier: 1,
        level: 1,
        value: 60,
        stats: { attack: 3 },
        materials: { Wood: 2, 'Bronze Ingot': 2 },
        description: 'A simple blade forged from bronze.'
    },
    {
        id: 2,
        name: 'Leather Armor',
        type: 'armor',
        rarity: 'common',
        tier: 1,
        level: 1,
        value: 55,
        stats: { defense: 3 },
        materials: { 'Leather Strap': 2, Wood: 1 },
        description: 'Light armor reinforced with treated leather.'
    },
    {
        id: 3,
        name: 'Reinforced Shield',
        type: 'armor',
        rarity: 'uncommon',
        tier: 2,
        level: 5,
        value: 140,
        stats: { defense: 7 },
        materials: { Wood: 4, Stone: 2, 'Iron Ingot': 2 },
        description: 'A sturdy shield for the front line.'
    },
    {
        id: 4,
        name: 'Tidecaller Staff',
        type: 'weapon',
        rarity: 'uncommon',
        tier: 2,
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
        tier: 3,
        level: 12,
        value: 320,
        stats: { attack: 14 },
        materials: { Gems: 2, Crystals: 1, 'Crystal Weave': 1, Ore: 3 },
        description: 'A blade that glints with crystalline power.'
    }
];
