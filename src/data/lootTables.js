/**
 * Loot System Configuration
 * Rarity definitions, item types, and loot tables for different quest types
 */

export const lootRarities = {
    common: { dropRate: 0.60, valueMultiplier: 1.0, color: '#888' },
    uncommon: { dropRate: 0.25, valueMultiplier: 2.0, color: '#4a9' },
    rare: { dropRate: 0.10, valueMultiplier: 4.0, color: '#49f' },
    epic: { dropRate: 0.04, valueMultiplier: 8.0, color: '#a4f' },
    legendary: { dropRate: 0.01, valueMultiplier: 15.0, color: '#fa0' }
};

export const itemTypes = ['weapon', 'armor', 'potion', 'material'];

export const lootTables = {
    forest: {
        materials: ['Wood', 'Herbs', 'Vines', 'Mushrooms'],
        weapons: ['Wooden Sword', 'Oak Staff', 'Hunter\'s Bow', 'Nature\'s Wrath'],
        armor: ['Leather Armor', 'Bark Shield', 'Forest Cloak', 'Vine Bracers']
    },
    cove: {
        materials: ['Fish', 'Shells', 'Coral', 'Pearls'],
        weapons: ['Coral Blade', 'Trident', 'Wave Striker', 'Pearl Dagger'],
        armor: ['Scale Mail', 'Shell Shield', 'Sea Cloak', 'Tidal Guard']
    },
    highlands: {
        materials: ['Stone', 'Gems', 'Ore', 'Crystals'],
        weapons: ['Iron Sword', 'Crystal Staff', 'Mountain Axe', 'Gem Blade'],
        armor: ['Plate Armor', 'Stone Shield', 'Mountain Helm', 'Crystal Guard']
    }
};

// Battle Party Grid Configuration
export const battlePartyGrid = {
    rows: 2,
    cols: 3
};

// Freeze to prevent mutations
Object.freeze(lootRarities);
Object.freeze(itemTypes);
Object.freeze(lootTables);
Object.freeze(battlePartyGrid);
