import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MerchantRPG } from './game';

// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = value.toString(); },
        removeItem: (key) => { delete store[key]; },
        clear: () => { store = {}; }
    };
})();

Object.defineProperty(globalThis, 'localStorage', {
    value: localStorageMock,
    configurable: true
});

// Mock DOM elements
global.document = {
    getElementById: vi.fn(() => ({
        textContent: '',
        innerHTML: '',
        classList: {
            add: vi.fn(),
            remove: vi.fn()
        }
    })),
    querySelectorAll: vi.fn(() => [])
};

describe('MerchantRPG - Game Initialization', () => {
    let game;

    beforeEach(() => {
        localStorage.clear();
        game = new MerchantRPG({ skipInit: true });
    });

    it('should initialize with default state', () => {
        expect(game.state.gold).toBe(1000);
        expect(game.state.heroes).toEqual([]);
        expect(game.state.materials).toEqual({});
        expect(game.state.nextHeroId).toBe(1);
    });

    it('should have 10 D&D hero templates', () => {
        expect(game.heroTemplates).toHaveLength(10);
        expect(game.heroTemplates[0].name).toBe('Fighter');
        expect(game.heroTemplates[1].name).toBe('Wizard');
        expect(game.heroTemplates[2].name).toBe('Rogue');
        expect(game.heroTemplates[3].name).toBe('Cleric');
        expect(game.heroTemplates[4].name).toBe('Ranger');
        expect(game.heroTemplates[5].name).toBe('Barbarian');
        expect(game.heroTemplates[6].name).toBe('Paladin');
        expect(game.heroTemplates[7].name).toBe('Warlock');
        expect(game.heroTemplates[8].name).toBe('Monk');
        expect(game.heroTemplates[9].name).toBe('Bard');
    });

    it('should start with 3 unlocked classes (Fighter, Wizard, Rogue)', () => {
        expect(game.state.unlockedClasses).toEqual([0, 1, 2]);
    });

    it('should have 6 quest templates', () => {
        expect(game.questTemplates).toHaveLength(6);
        expect(game.questTemplates[0].name).toBe('Tuvale Map');
    });
});

describe('MerchantRPG - Hero Management', () => {
    let game;

    beforeEach(() => {
        localStorage.clear();
        game = new MerchantRPG({ skipInit: true });
    });

    it('should hire a fighter hero', () => {
        const initialGold = game.state.gold;

        // Mock the select element
        global.document.getElementById = vi.fn((id) => {
            if (id === 'hero-class-select') {
                return { value: '0' };
            }
            return { textContent: '', innerHTML: '' };
        });

        game.hireHero();

        expect(game.state.heroes).toHaveLength(1);
        expect(game.state.heroes[0].classIndex).toBe(0);
        expect(game.state.heroes[0].name).toBe('Fighter #1');
        expect(game.state.heroes[0].level).toBe(1);
        expect(game.state.heroes[0].hp).toBe(100);
        expect(game.state.heroes[0].atk).toBe(6);
        expect(game.state.heroes[0].def).toBe(12);
        expect(game.state.gold).toBe(initialGold - 100);
    });

    it('should hire a wizard hero', () => {
        global.document.getElementById = vi.fn((id) => {
            if (id === 'hero-class-select') {
                return { value: '1' };
            }
            return { textContent: '', innerHTML: '' };
        });

        game.hireHero();

        expect(game.state.heroes[0].classIndex).toBe(1);
        expect(game.state.heroes[0].name).toBe('Wizard #1');
        expect(game.state.heroes[0].hp).toBe(70);
        expect(game.state.heroes[0].atk).toBe(2);
        expect(game.state.heroes[0].def).toBe(6);
    });

    it('should hire a rogue hero', () => {
        global.document.getElementById = vi.fn((id) => {
            if (id === 'hero-class-select') {
                return { value: '2' };
            }
            return { textContent: '', innerHTML: '' };
        });

        game.hireHero();

        expect(game.state.heroes[0].classIndex).toBe(2);
        expect(game.state.heroes[0].name).toBe('Rogue #1');
        expect(game.state.heroes[0].hp).toBe(85);
        expect(game.state.heroes[0].atk).toBe(5);
        expect(game.state.heroes[0].def).toBe(8);
    });

    it('should increment hero ID for each hire', () => {
        global.document.getElementById = vi.fn((id) => {
            if (id === 'hero-class-select') {
                return { value: '0' };
            }
            return { textContent: '', innerHTML: '' };
        });

        game.hireHero();
        game.hireHero();
        game.hireHero();

        expect(game.state.heroes).toHaveLength(3);
        expect(game.state.heroes[0].id).toBe(1);
        expect(game.state.heroes[1].id).toBe(2);
        expect(game.state.heroes[2].id).toBe(3);
    });

    it('should not hire hero if not enough gold', () => {
        game.state.gold = 50;

        global.document.getElementById = vi.fn((id) => {
            if (id === 'hero-class-select') {
                return { value: '0' };
            }
            return { textContent: '', innerHTML: '' };
        });

        // Mock alert
        global.alert = vi.fn();

        game.hireHero();

        expect(game.state.heroes).toHaveLength(0);
        expect(game.state.gold).toBe(50);
        expect(global.alert).toHaveBeenCalledWith('Not enough gold! Need 100g');
    });
});

describe('MerchantRPG - Leveling System', () => {
    let game;

    beforeEach(() => {
        localStorage.clear();
        game = new MerchantRPG({ skipInit: true });
    });

    it('should calculate correct EXP requirement for levels', () => {
        expect(game.getExpForLevel(1)).toBe(100);
        expect(game.getExpForLevel(2)).toBe(200);
        expect(game.getExpForLevel(10)).toBe(1000);
    });

    it('should level up hero when enough EXP gained', () => {
        const hero = {
            id: 1,
            classIndex: 0, // Fighter
            level: 1,
            exp: 0,
            hp: 100,
            maxHp: 100,
            atk: 6,
            def: 12
        };

        game.giveExp(hero, 100);

        expect(hero.level).toBe(2);
        expect(hero.exp).toBe(0);
        expect(hero.maxHp).toBe(112); // +12 from tier 0 (Fighter hpPlv)
        expect(hero.hp).toBe(112); // Fully healed
        expect(hero.atk).toBeCloseTo(6.5, 1); // +0.5 from tier 0 (Fighter atkPlv)
        expect(hero.def).toBeCloseTo(13.0, 1); // +1.0 from tier 0 (Fighter defPlv)
    });

    it('should level up multiple times with enough EXP', () => {
        const hero = {
            id: 1,
            classIndex: 0, // Fighter
            level: 1,
            exp: 0,
            hp: 100,
            maxHp: 100,
            atk: 6,
            def: 12
        };

        game.giveExp(hero, 350); // Enough for levels 2, 3

        expect(hero.level).toBe(3);
        expect(hero.exp).toBe(50); // 350 - 100 - 200 = 50 remaining
    });

    it('should apply correct stat gains per tier', () => {
        const hero = {
            id: 1,
            classIndex: 0, // Fighter
            level: 1,
            exp: 0,
            hp: 100,
            maxHp: 100,
            atk: 6,
            def: 12
        };

        // Level to 11 (tier 1)
        game.giveExp(hero, 5500);

        expect(hero.level).toBe(11);
        // Levels 2-9 use tier 0 (8x 12HP), level 10-11 use tier 1 (2x 16HP)
        expect(hero.maxHp).toBe(100 + 12 * 8 + 16 * 2); // = 228
    });
});

describe('MerchantRPG - D&D Hero Unlock System', () => {
    let game;

    beforeEach(() => {
        localStorage.clear();
        game = new MerchantRPG({ skipInit: true });
    });

    it('should unlock Cleric when Wizard reaches level 15', () => {
        const wizard = {
            id: 1,
            classIndex: 1,
            level: 1,
            exp: 0,
            hp: 70,
            maxHp: 70,
            atk: 2,
            def: 6
        };

        game.state.heroes.push(wizard);
        game.giveExp(wizard, 10500);

        expect(wizard.level).toBeGreaterThanOrEqual(15);
        expect(game.state.unlockedClasses).toContain(3); // Cleric index
    });

    it('should unlock Ranger when Rogue reaches level 15', () => {
        const rogue = {
            id: 1,
            classIndex: 2,
            level: 1,
            exp: 0,
            hp: 85,
            maxHp: 85,
            atk: 5,
            def: 8
        };

        game.state.heroes.push(rogue);
        game.giveExp(rogue, 10500);

        expect(rogue.level).toBeGreaterThanOrEqual(15);
        expect(game.state.unlockedClasses).toContain(4); // Ranger index
    });

    it('should unlock Barbarian when Fighter reaches level 15', () => {
        const fighter = {
            id: 1,
            classIndex: 0,
            level: 1,
            exp: 0,
            hp: 100,
            maxHp: 100,
            atk: 6,
            def: 12
        };

        game.state.heroes.push(fighter);
        game.giveExp(fighter, 10500);

        expect(fighter.level).toBeGreaterThanOrEqual(15);
        expect(game.state.unlockedClasses).toContain(5); // Barbarian index
    });

    it('should unlock Paladin with Fighter level 30 and Cleric level 15', () => {
        const fighter = {
            id: 1,
            classIndex: 0,
            level: 1,
            exp: 0,
            hp: 100,
            maxHp: 100,
            atk: 6,
            def: 12
        };

        const cleric = {
            id: 2,
            classIndex: 3,
            level: 1,
            exp: 0,
            hp: 90,
            maxHp: 90,
            atk: 4,
            def: 10
        };

        game.state.heroes.push(fighter, cleric);

        // Level fighter to 30
        game.giveExp(fighter, 45000);
        // Level cleric to 15
        game.giveExp(cleric, 10500);

        expect(fighter.level).toBeGreaterThanOrEqual(30);
        expect(cleric.level).toBeGreaterThanOrEqual(15);
        expect(game.state.unlockedClasses).toContain(6); // Paladin index
    });

    it('should unlock Warlock when Wizard reaches level 30', () => {
        const wizard = {
            id: 1,
            classIndex: 1,
            level: 1,
            exp: 0,
            hp: 70,
            maxHp: 70,
            atk: 2,
            def: 6
        };

        game.state.heroes.push(wizard);
        game.giveExp(wizard, 45000);

        expect(wizard.level).toBeGreaterThanOrEqual(30);
        expect(game.state.unlockedClasses).toContain(7); // Warlock index
    });

    it('should unlock Monk with Fighter level 20 and Rogue level 15', () => {
        const fighter = {
            id: 1,
            classIndex: 0,
            level: 1,
            exp: 0,
            hp: 100,
            maxHp: 100,
            atk: 6,
            def: 12
        };

        const rogue = {
            id: 2,
            classIndex: 2,
            level: 1,
            exp: 0,
            hp: 85,
            maxHp: 85,
            atk: 5,
            def: 8
        };

        game.state.heroes.push(fighter, rogue);

        // Level fighter to 20
        game.giveExp(fighter, 19000);
        // Level rogue to 15
        game.giveExp(rogue, 10500);

        expect(fighter.level).toBeGreaterThanOrEqual(20);
        expect(rogue.level).toBeGreaterThanOrEqual(15);
        expect(game.state.unlockedClasses).toContain(8); // Monk index
    });

    it('should unlock Bard when 3 heroes reach level 20+', () => {
        const heroes = [
            { id: 1, classIndex: 0, level: 1, exp: 0, hp: 100, maxHp: 100, atk: 6, def: 12 },
            { id: 2, classIndex: 1, level: 1, exp: 0, hp: 70, maxHp: 70, atk: 2, def: 6 },
            { id: 3, classIndex: 2, level: 1, exp: 0, hp: 85, maxHp: 85, atk: 5, def: 8 }
        ];

        game.state.heroes.push(...heroes);

        // Level all three to 20
        heroes.forEach(hero => {
            game.giveExp(hero, 19000);
        });

        heroes.forEach(hero => {
            expect(hero.level).toBeGreaterThanOrEqual(20);
        });
        expect(game.state.unlockedClasses).toContain(9); // Bard index
    });
});

describe('MerchantRPG - Quest System', () => {
    let game;

    beforeEach(() => {
        localStorage.clear();
        game = new MerchantRPG({ skipInit: true });
    });

    it('should complete quest and reward gold, materials, and EXP', () => {
        const hero = {
            id: 1,
            classIndex: 0,
            level: 1,
            exp: 0,
            hp: 100,
            maxHp: 100,
            atk: 5,
            def: 14,
            status: 'questing',
            questId: 1,
            questStartTime: Date.now(),
            questDuration: 30
        };

        game.state.heroes.push(hero);
        const initialGold = game.state.gold;

        game.completeQuest(hero);

        // Check rewards from quest 1 (Tuvale Map)
        expect(game.state.gold).toBe(initialGold + 50);
        expect(game.state.materials['Wood']).toBe(2);
        expect(game.state.materials['Herbs']).toBe(3);
        expect(hero.exp).toBe(25);
        expect(hero.status).toBe('idle');
        expect(hero.questId).toBeNull();
    });

    it('should auto-complete quest when time elapsed', () => {
        const hero = {
            id: 1,
            classIndex: 0,
            level: 1,
            exp: 0,
            hp: 100,
            maxHp: 100,
            atk: 5,
            def: 14,
            status: 'questing',
            questId: 1,
            questStartTime: Date.now() - 31000, // Started 31 seconds ago
            questDuration: 30
        };

        game.state.heroes.push(hero);

        game.updateGameState();

        expect(hero.status).toBe('idle');
        expect(game.state.materials['Wood']).toBe(2);
    });

    it('should not complete quest if time not elapsed', () => {
        const hero = {
            id: 1,
            classIndex: 0,
            level: 1,
            exp: 0,
            hp: 100,
            maxHp: 100,
            atk: 5,
            def: 14,
            status: 'questing',
            questId: 1,
            questStartTime: Date.now() - 10000, // Started 10 seconds ago
            questDuration: 30
        };

        game.state.heroes.push(hero);

        game.updateGameState();

        expect(hero.status).toBe('questing');
        expect(game.state.materials).toEqual({});
    });
});

describe('MerchantRPG - Material System', () => {
    let game;

    beforeEach(() => {
        localStorage.clear();
        game = new MerchantRPG({ skipInit: true });
    });

    it('should accumulate materials from multiple quests', () => {
        const hero = {
            id: 1,
            classIndex: 0,
            level: 1,
            exp: 0,
            hp: 100,
            maxHp: 100,
            atk: 5,
            def: 14,
            status: 'questing',
            questId: 1,
            questStartTime: Date.now(),
            questDuration: 30
        };

        game.completeQuest(hero);
        expect(game.state.materials['Wood']).toBe(2);
        expect(game.state.materials['Herbs']).toBe(3);

        hero.status = 'questing';
        hero.questId = 1;
        game.completeQuest(hero);

        expect(game.state.materials['Wood']).toBe(4);
        expect(game.state.materials['Herbs']).toBe(6);
    });

    it('should handle different material types from different quests', () => {
        const hero = {
            id: 1,
            classIndex: 0,
            level: 10,
            exp: 0,
            hp: 100,
            maxHp: 100,
            atk: 5,
            def: 14,
            status: 'questing',
            questId: 3, // Yarsol Map
            questStartTime: Date.now(),
            questDuration: 90
        };

        game.completeQuest(hero);

        expect(game.state.materials['Fish']).toBe(4);
        expect(game.state.materials['Shells']).toBe(2);
        expect(game.state.materials['Coral']).toBe(1);
    });
});

describe('MerchantRPG - Save/Load System', () => {
    let game;

    beforeEach(() => {
        localStorage.clear();
        game = new MerchantRPG({ skipInit: true });
    });

    it('should save game state to localStorage', () => {
        game.state.gold = 500;
        game.state.heroes.push({
            id: 1,
            name: 'Test Hero',
            level: 5
        });
        game.state.materials = { Wood: 10 };

        game.save();

        const saved = JSON.parse(localStorage.getItem('merchantRPG_v2'));
        expect(saved.gold).toBe(500);
        expect(saved.heroes).toHaveLength(1);
        expect(saved.materials.Wood).toBe(10);
    });

    it('should load game state from localStorage', () => {
        const savedState = {
            gold: 750,
            heroes: [{ id: 1, name: 'Loaded Hero' }],
            materials: { Iron: 5 },
            nextHeroId: 2
        };

        localStorage.setItem('merchantRPG_v2', JSON.stringify(savedState));

        const newGame = new MerchantRPG({ skipInit: true });

        expect(newGame.state.gold).toBe(750);
        expect(newGame.state.heroes).toHaveLength(1);
        expect(newGame.state.materials.Iron).toBe(5);
        expect(newGame.state.nextHeroId).toBe(2);
    });
});

describe('MerchantRPG - Utility Functions', () => {
    let game;

    beforeEach(() => {
        localStorage.clear();
        game = new MerchantRPG({ skipInit: true });
    });

    it('should format time in seconds', () => {
        expect(game.formatTime(30)).toBe('30s');
        expect(game.formatTime(45)).toBe('45s');
    });

    it('should format time in minutes and seconds', () => {
        expect(game.formatTime(60)).toBe('1m 0s');
        expect(game.formatTime(90)).toBe('1m 30s');
        expect(game.formatTime(125)).toBe('2m 5s');
    });

    it('should format time in hours and minutes', () => {
        expect(game.formatTime(3600)).toBe('1h 0m');
        expect(game.formatTime(3900)).toBe('1h 5m');
        expect(game.formatTime(7325)).toBe('2h 2m');
    });
});
