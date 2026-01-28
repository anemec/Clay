// Merchant RPG - MVP Version
// Using data from MerchantGameDB: https://github.com/Benzeliden/MerchantGameDB

// Import data and utilities
import {
    heroTemplates,
    questTemplates,
    tacticsLibrary,
    lootRarities,
    itemTypes,
    lootTables,
    battlePartyGrid,
    craftingRecipes
} from '../data/index';

import {
    STARTING_GOLD,
    UNLOCKED_CLASSES_DEFAULT,
    EXP_PER_LEVEL_MULTIPLIER
} from '../utils/index';

import { heroMethods } from './methods/hero';
import { questMethods } from './methods/quests';
import { lootMethods } from './methods/loot';
import { tacticsMethods } from './methods/tactics';
import { partyMethods } from './methods/party';
import { renderMethods } from './methods/render';
import { tabMethods } from './methods/tabs';
import { utilsMethods } from './methods/utils';
import { persistenceMethods } from './methods/persistence';
import { loopMethods } from './methods/loop';
import { equipmentMethods } from './methods/equipment';

class MerchantRPG {
    constructor(options = {}) {
        // Options for testing
        this.skipInit = options.skipInit || false;

        // Load game data from modules
        this.heroTemplates = heroTemplates;
        this.questTemplates = questTemplates;
        this.tacticsLibrary = tacticsLibrary;
        this.lootRarities = lootRarities;
        this.itemTypes = itemTypes;
        this.lootTables = lootTables;
        this.battlePartyGrid = battlePartyGrid;
        this.craftingRecipes = craftingRecipes;

        this.expPerLevelMultiplier = EXP_PER_LEVEL_MULTIPLIER;
        this.nextItemId = 1; // For unique item IDs

        this.state = {
            gold: STARTING_GOLD,
            heroes: [],
            materials: {},
            inventory: [], // Loot items
            nextHeroId: 1,
            activeTab: 'heroes',
            selectedEquipmentHeroId: null,
            unlockedClasses: [...UNLOCKED_CLASSES_DEFAULT], // Fighter, Wizard, Rogue start unlocked
            battleParty: {
                positions: [
                    // Front row (row 0)
                    { row: 0, col: 0, heroId: null, tacticId: null },
                    { row: 0, col: 1, heroId: null, tacticId: null },
                    { row: 0, col: 2, heroId: null, tacticId: null },
                    // Back row (row 1)
                    { row: 1, col: 0, heroId: null, tacticId: null },
                    { row: 1, col: 1, heroId: null, tacticId: null },
                    { row: 1, col: 2, heroId: null, tacticId: null }
                ]
            }
        };

        this.currentQuest = null; // For modal
        this.lastUnlockedClasses = []; // Track for dropdown updates (empty to force initial render)

        this.load();
        this.updateGameState(); // Process any completed quests from offline time

        // Skip rendering and game loop in test environment
        if (!this.skipInit) {
            this.render();
            this.startGameLoop();
        }
    }
}

Object.assign(
    MerchantRPG.prototype,
    heroMethods,
    questMethods,
    lootMethods,
    tacticsMethods,
    partyMethods,
    renderMethods,
    tabMethods,
    utilsMethods,
    persistenceMethods,
    loopMethods,
    equipmentMethods
);

export { MerchantRPG };
