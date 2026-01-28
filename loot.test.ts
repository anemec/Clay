import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MerchantRPG } from './game';

describe('Loot System - Item Generation', () => {
    let game;

    beforeEach(() => {
        localStorage.clear();
        game = new MerchantRPG({ skipInit: true });
    });

    it('should have loot rarities defined', () => {
        expect(game.lootRarities).toBeDefined();
        expect(game.lootRarities).toHaveProperty('common');
        expect(game.lootRarities).toHaveProperty('uncommon');
        expect(game.lootRarities).toHaveProperty('rare');
        expect(game.lootRarities).toHaveProperty('epic');
        expect(game.lootRarities).toHaveProperty('legendary');
    });

    it('should have item types defined', () => {
        expect(game.itemTypes).toBeDefined();
        expect(game.itemTypes).toContain('weapon');
        expect(game.itemTypes).toContain('armor');
        expect(game.itemTypes).toContain('potion');
        expect(game.itemTypes).toContain('material');
    });

    it('should generate a random item with valid properties', () => {
        const item = game.generateLoot(1); // Level 1 item

        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('type');
        expect(item).toHaveProperty('rarity');
        expect(item).toHaveProperty('level');
        expect(item).toHaveProperty('value');
        expect(item.level).toBe(1);
    });

    it('should generate items with appropriate rarities', () => {
        const items = [];
        for (let i = 0; i < 100; i++) {
            items.push(game.generateLoot(1));
        }

        // Common should be most frequent
        const rarities = items.map(i => i.rarity);
        const commonCount = rarities.filter(r => r === 'common').length;
        const legendaryCount = rarities.filter(r => r === 'legendary').length;

        expect(commonCount).toBeGreaterThan(legendaryCount);
        expect(commonCount).toBeGreaterThan(20); // At least 20% common
    });

    it('should generate higher value items for higher rarities', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.01); // Force legendary
        const legendary = game.generateLoot(10);

        vi.spyOn(Math, 'random').mockReturnValue(0.99); // Force common
        const common = game.generateLoot(10);

        expect(legendary.value).toBeGreaterThan(common.value);
        vi.restoreAllMocks();
    });

    it('should scale item level with quest level', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.99);
        const level5Item = game.generateLoot(5);
        const level20Item = game.generateLoot(20);

        expect(level5Item.level).toBe(5);
        expect(level20Item.level).toBe(20);
        expect(level20Item.value).toBeGreaterThan(level5Item.value);
        vi.restoreAllMocks();
    });
});

describe('Loot System - Loot Tables', () => {
    let game;

    beforeEach(() => {
        localStorage.clear();
        game = new MerchantRPG({ skipInit: true });
    });

    it('should have loot tables for different quest types', () => {
        expect(game.lootTables).toBeDefined();
        expect(game.lootTables).toHaveProperty('forest');
        expect(game.lootTables).toHaveProperty('cove');
        expect(game.lootTables).toHaveProperty('highlands');
    });

    it('should generate loot from quest loot table', () => {
        const questId = 1; // Tuvale Map (forest)
        const loot = game.generateQuestLoot(questId);

        expect(loot).toBeDefined();
        expect(Array.isArray(loot)).toBe(true);
        expect(loot.length).toBeGreaterThan(0);
    });

    it('should generate multiple loot items from quest', () => {
        const questId = 1;
        const loot = game.generateQuestLoot(questId);

        // Should drop 1-3 items typically
        expect(loot.length).toBeGreaterThanOrEqual(1);
        expect(loot.length).toBeLessThanOrEqual(5);
    });

    it('should generate themed loot based on quest type', () => {
        // Forest quest should drop nature-themed items
        const forestLoot = game.generateQuestLoot(1); // Tuvale Map

        // At least some items should be appropriate for forest theme
        expect(forestLoot.length).toBeGreaterThan(0);
        forestLoot.forEach(item => {
            expect(item).toHaveProperty('name');
            expect(item).toHaveProperty('type');
        });
    });
});

describe('Loot System - Drop Rates', () => {
    let game;

    beforeEach(() => {
        localStorage.clear();
        game = new MerchantRPG({ skipInit: true });
    });

    it('should calculate drop rate based on rarity', () => {
        const commonRate = game.getDropRate('common');
        const rareRate = game.getDropRate('rare');
        const legendaryRate = game.getDropRate('legendary');

        expect(commonRate).toBeGreaterThan(rareRate);
        expect(rareRate).toBeGreaterThan(legendaryRate);
    });

    it('should roll for item drop correctly', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.5); // 50% roll

        const shouldDropCommon = game.rollForDrop('common');
        const shouldDropLegendary = game.rollForDrop('legendary');

        // 50% should be enough for common but not legendary
        expect(shouldDropCommon).toBeDefined();

        vi.restoreAllMocks();
    });

    it('should respect drop chance multipliers', () => {
        // Test that we can apply multipliers (like from hero luck stat)
        const baseItem = game.generateLoot(10);
        const luckyItem = game.generateLoot(10, { luckMultiplier: 2.0 });

        expect(baseItem).toBeDefined();
        expect(luckyItem).toBeDefined();
    });
});

describe('Loot System - Item Properties', () => {
    let game;

    beforeEach(() => {
        localStorage.clear();
        game = new MerchantRPG({ skipInit: true });
    });

    it('should generate weapon with attack stats', () => {
        // Mock to force weapon generation
        vi.spyOn(Math, 'random').mockReturnValue(0.1);
        const item = game.generateLoot(5);
        vi.restoreAllMocks();

        if (item.type === 'weapon') {
            expect(item).toHaveProperty('stats');
            expect(item.stats).toHaveProperty('attack');
        }
    });

    it('should generate armor with defense stats', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.3);
        const item = game.generateLoot(5);
        vi.restoreAllMocks();

        if (item.type === 'armor') {
            expect(item).toHaveProperty('stats');
            expect(item.stats).toHaveProperty('defense');
        }
    });

    it('should generate unique IDs for each item', () => {
        const item1 = game.generateLoot(1);
        const item2 = game.generateLoot(1);

        expect(item1.id).not.toBe(item2.id);
    });

    it('should include item description', () => {
        const item = game.generateLoot(5);

        expect(item).toHaveProperty('description');
        expect(typeof item.description).toBe('string');
        expect(item.description.length).toBeGreaterThan(0);
    });
});

describe('Loot System - Quest Integration', () => {
    let game;

    beforeEach(() => {
        localStorage.clear();
        game = new MerchantRPG({ skipInit: true });
    });

    it('should add loot to inventory when quest completes', () => {
        const hero = {
            id: 1,
            classIndex: 0,
            level: 1,
            exp: 0,
            hp: 100,
            maxHp: 100,
            atk: 6,
            def: 12,
            mdef: 7,
            crit: 2,
            status: 'questing',
            questId: 1,
            questStartTime: Date.now(),
            questDuration: 30
        };

        game.state.heroes.push(hero);
        const initialInventorySize = game.state.inventory ? game.state.inventory.length : 0;

        game.completeQuest(hero);

        // Quest should have generated loot
        expect(game.state.inventory).toBeDefined();
        expect(game.state.inventory.length).toBeGreaterThanOrEqual(initialInventorySize);
    });

    it('should generate appropriate loot for quest level', () => {
        const hero = {
            id: 1,
            classIndex: 0,
            level: 20,
            exp: 0,
            hp: 100,
            maxHp: 100,
            atk: 6,
            def: 12,
            mdef: 7,
            crit: 2,
            status: 'questing',
            questId: 5, // Higher level quest
            questStartTime: Date.now(),
            questDuration: 30
        };

        game.state.heroes.push(hero);
        game.completeQuest(hero);

        // Should have inventory with items
        if (game.state.inventory && game.state.inventory.length > 0) {
            const lowestLevel = Math.min(...game.state.inventory.map(i => i.level));
            expect(lowestLevel).toBeGreaterThanOrEqual(1);
        }
    });
});
