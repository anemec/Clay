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
    craftingRecipes,
    refiningRecipes,
    shopItems,
    adventureTemplates
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
import { inventoryMethods } from './methods/inventory';
import { adventureMethods } from './methods/adventure';

class MerchantRPG {
    skipInit: boolean;
    heroTemplates: unknown[];
    questTemplates: unknown[];
    tacticsLibrary: Record<string, unknown>;
    lootRarities: Record<string, unknown>;
    itemTypes: string[];
    lootTables: unknown;
    battlePartyGrid: unknown;
    craftingRecipes: Array<Record<string, unknown>>;
    shopItems: Array<Record<string, unknown>>;
    adventureTemplates: Array<Record<string, unknown>>;
    refiningRecipes: Array<Record<string, unknown>>;
    expPerLevelMultiplier: number;
    nextItemId: number;
    state: Record<string, unknown>;
    currentQuest: unknown;
    lastUnlockedClasses: number[];

    declare load: () => void;
    declare updateGameState: () => void;
    declare render: () => void;
    declare startGameLoop: () => void;
    declare switchTab: (tabName: string, target?: HTMLElement | null) => void;
    declare openQuestModal: (questId: number) => void;
    declare openPartyPositionModal: (position: number) => void;
    declare hireHero: () => void;
    declare save: () => void;
    declare reset: () => void;
    declare closeQuestModal: () => void;
    declare startQuest: () => void;
    declare closePartyModal: () => void;
    declare savePartyPosition: () => void;
    declare equipItem: (itemId: number, heroId: number) => void;
    declare unequipItem: (slot: string, heroId: number, options?: { silent?: boolean }) => void;
    declare craftItem: (recipeId: number) => void;
    declare selectEquipmentHero: (heroId: number) => void;
    declare sellItem: (itemId: number) => void;
    declare buyShopItem: (shopItemId: number) => void;
    declare startAdventure: (options: { adventureId: number; heroIds: number[]; resources: { potions?: number; food?: number; gold?: number }; riskTolerance?: number }) => void;
    declare tickAdventure: () => void;
    declare startAdventureFromForm: (adventureId: number) => void;
    declare setAdventureLogFilter: (filter: string, enabled: boolean) => void;
    declare refineMaterial: (recipeId: number) => void;
    declare updateAdventureDraftHero: (adventureId: number, heroId: number, checked: boolean) => void;
    declare updateAdventureDraftResource: (adventureId: number, resource: string, value: number) => void;

    constructor(options: { skipInit?: boolean } = {}) {
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
        this.refiningRecipes = refiningRecipes;
        this.shopItems = shopItems;
        this.adventureTemplates = adventureTemplates;

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
            adventure: {
                active: false,
                adventureId: null,
                partyHeroIds: [],
                resources: { potions: 0, food: 0, gold: 0 },
                riskTolerance: 0.4,
                tick: 0,
                ticksToGoal: 0,
                goalType: null,
                outcome: null,
                lastEvent: null,
                log: [],
                logFilters: {
                    battle: true,
                    encounter: true,
                    opportunity: true,
                    resource: true,
                    status: true
                },
                lastTickAt: null
            },
            adventureDrafts: {},
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
    equipmentMethods,
    inventoryMethods,
    adventureMethods
);

export { MerchantRPG };
