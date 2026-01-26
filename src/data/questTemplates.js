/**
 * Quest Templates
 * From MapList.json - first 6 maps, simplified for MVP
 * Quests provide gold, exp, and materials upon completion
 */

export const questTemplates = [
    {
        id: 1,
        name: "Tuvale Map",
        desc: "Basic Forest Dungeon",
        duration: 30,
        level: 1,
        gold: 50,
        exp: 25,
        materials: ["Wood", "Herbs"],
        materialCount: [2, 3]
    },
    {
        id: 2,
        name: "Hard Tuvale Map",
        desc: "Hard Forest Dungeon",
        duration: 60,
        level: 3,
        gold: 100,
        exp: 50,
        materials: ["Wood", "Iron Ore", "Herbs"],
        materialCount: [3, 2, 4]
    },
    {
        id: 3,
        name: "Yarsol Map",
        desc: "Basic Cove Dungeon",
        duration: 90,
        level: 10,
        gold: 200,
        exp: 100,
        materials: ["Fish", "Shells", "Coral"],
        materialCount: [4, 2, 1]
    },
    {
        id: 4,
        name: "Hard Yarsol Map",
        desc: "Hard Cove Dungeon",
        duration: 120,
        level: 16,
        gold: 400,
        exp: 200,
        materials: ["Fish", "Pearls", "Shells"],
        materialCount: [5, 1, 3]
    },
    {
        id: 5,
        name: "Aldur Map",
        desc: "Basic Highlands Dungeon",
        duration: 150,
        level: 20,
        gold: 600,
        exp: 300,
        materials: ["Stone", "Gems", "Ore"],
        materialCount: [6, 2, 3]
    },
    {
        id: 6,
        name: "Hard Aldur Map",
        desc: "Hard Highlands Dungeon",
        duration: 180,
        level: 26,
        gold: 1000,
        exp: 500,
        materials: ["Gems", "Crystals", "Stone"],
        materialCount: [4, 2, 5]
    }
];

// Freeze to prevent mutations
Object.freeze(questTemplates);
