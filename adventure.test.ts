import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MerchantRPG } from './game';

describe('Adventure System - Party Adventures', () => {
    let game;

    beforeEach(() => {
        localStorage.clear();
        global.document = {
            getElementById: vi.fn(() => ({
                textContent: '',
                innerHTML: '',
                classList: {
                    add: vi.fn(),
                    remove: vi.fn()
                }
            })),
            querySelectorAll: vi.fn(() => []),
            querySelector: vi.fn(() => null)
        };
        game = new MerchantRPG({ skipInit: true });
    });

    it('should start an adventure with party and resources from inventory', () => {
        const heroA = game.createHero(0);
        const heroB = game.createHero(1);

        game.state.inventory.push(
            { id: 1, name: 'Health Potion', type: 'potion', rarity: 'common', level: 1, value: 25 },
            { id: 2, name: 'Trail Ration', type: 'food', rarity: 'common', level: 1, value: 10 },
            { id: 3, name: 'Trail Ration', type: 'food', rarity: 'common', level: 1, value: 10 }
        );

        const startingGold = game.state.gold;

        game.startAdventure({
            adventureId: 1,
            heroIds: [heroA.id, heroB.id],
            resources: { potions: 1, food: 2, gold: 100 },
            riskTolerance: 0.4
        });

        expect(game.state.adventure.active).toBe(true);
        expect(game.state.adventure.partyHeroIds).toEqual([heroA.id, heroB.id]);
        expect(game.state.adventure.resources.potions).toBe(1);
        expect(game.state.adventure.resources.food).toBe(2);
        expect(game.state.adventure.resources.gold).toBe(100);
        expect(game.state.adventure.log.length).toBeGreaterThan(0);
        expect(game.state.gold).toBe(startingGold - 100);
        expect(game.state.inventory.filter(i => i.type === 'potion')).toHaveLength(0);
        expect(game.state.inventory.filter(i => i.type === 'food')).toHaveLength(0);
    });

    it('should progress adventure ticks and resolve an event', () => {
        const hero = game.createHero(0);
        game.state.inventory.push({ id: 1, name: 'Health Potion', type: 'potion', rarity: 'common', level: 1, value: 25 });

        game.startAdventure({
            adventureId: 1,
            heroIds: [hero.id],
            resources: { potions: 1, food: 0, gold: 0 },
            riskTolerance: 0.2
        });

        vi.spyOn(Math, 'random').mockReturnValue(0.1);
        const initialTick = game.state.adventure.tick;
        game.tickAdventure();

        expect(game.state.adventure.tick).toBe(initialTick + 1);
        expect(game.state.adventure.lastEvent).toBeDefined();
        vi.restoreAllMocks();
    });

    it('should retreat when confidence drops below risk tolerance', () => {
        const hero = game.createHero(0);
        hero.hp = 1;

        game.startAdventure({
            adventureId: 1,
            heroIds: [hero.id],
            resources: { potions: 0, food: 0, gold: 0 },
            riskTolerance: 0.8
        });

        vi.spyOn(Math, 'random').mockReturnValue(0.9);
        game.tickAdventure();

        expect(game.state.adventure.active).toBe(false);
        expect(game.state.adventure.outcome).toBe('retreat');
        vi.restoreAllMocks();
    });

    it('should award equipment on success and not add materials', () => {
        const hero = game.createHero(0);

        game.startAdventure({
            adventureId: 2,
            heroIds: [hero.id],
            resources: { potions: 0, food: 0, gold: 0 },
            riskTolerance: 0.1
        });

        vi.spyOn(Math, 'random').mockReturnValue(0.2);
        game.state.adventure.tick = game.state.adventure.ticksToGoal - 1;
        game.tickAdventure();

        const equipmentItems = game.state.inventory.filter(i => i.type === 'weapon' || i.type === 'armor');
        expect(equipmentItems.length).toBeGreaterThan(0);
        expect(Object.keys(game.state.materials).length).toBe(0);
        vi.restoreAllMocks();
    });
});
