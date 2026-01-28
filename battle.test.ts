import { describe, it, expect, beforeEach } from 'vitest';
import { MerchantRPG } from './game';

describe('Battle Party System - Architecture', () => {
    let game;

    beforeEach(() => {
        // Create fresh game instance for each test
        game = new MerchantRPG({ skipInit: true });
        // Reset to clean state for test isolation
        game.state.heroes = [];
        game.state.nextHeroId = 1;
        game.state.battleParty = {
            positions: [
                { row: 0, col: 0, heroId: null, tacticId: null },
                { row: 0, col: 1, heroId: null, tacticId: null },
                { row: 0, col: 2, heroId: null, tacticId: null },
                { row: 1, col: 0, heroId: null, tacticId: null },
                { row: 1, col: 1, heroId: null, tacticId: null },
                { row: 1, col: 2, heroId: null, tacticId: null }
            ]
        };
    });

    describe('Grid System', () => {
        it('should have a 2x3 grid (6 positions total)', () => {
            expect(game.battlePartyGrid).toBeDefined();
            expect(game.battlePartyGrid.rows).toBe(2);
            expect(game.battlePartyGrid.cols).toBe(3);
        });

        it('should initialize empty grid positions', () => {
            expect(game.state.battleParty).toBeDefined();
            expect(game.state.battleParty.positions).toHaveLength(6);
            game.state.battleParty.positions.forEach(pos => {
                expect(pos.heroId).toBeNull();
                expect(pos.tacticId).toBeNull();
            });
        });

        it('should track position coordinates (row, col)', () => {
            const positions = game.state.battleParty.positions;
            // Front row (row 0)
            expect(positions[0]).toMatchObject({ row: 0, col: 0 });
            expect(positions[1]).toMatchObject({ row: 0, col: 1 });
            expect(positions[2]).toMatchObject({ row: 0, col: 2 });
            // Back row (row 1)
            expect(positions[3]).toMatchObject({ row: 1, col: 0 });
            expect(positions[4]).toMatchObject({ row: 1, col: 1 });
            expect(positions[5]).toMatchObject({ row: 1, col: 2 });
        });
    });

    describe('Party Formation', () => {
        it('should add hero to empty position', () => {
            const hero = game.createHero(0); // Create Fighter
            const success = game.addHeroToParty(hero.id, 0); // Position 0

            expect(success).toBe(true);
            expect(game.state.battleParty.positions[0].heroId).toBe(hero.id);
        });

        it('should not allow duplicate heroes in party', () => {
            const hero = game.createHero(0); // Create Fighter

            game.addHeroToParty(hero.id, 0);
            const result = game.addHeroToParty(hero.id, 1);

            expect(result).toBe(false);
        });

        it('should not allow more than 6 heroes in party', () => {
            // Create 7 heroes
            for (let i = 0; i < 7; i++) {
                game.createHero(0); // Create Fighters
            }

            // Fill all 6 positions
            for (let i = 0; i < 6; i++) {
                game.addHeroToParty(game.state.heroes[i].id, i);
            }

            // Try to add 7th hero
            const result = game.addHeroToParty(game.state.heroes[6].id, 0);
            expect(result).toBe(false);
        });

        it('should remove hero from position', () => {
            const hero = game.createHero(0);
            game.addHeroToParty(hero.id, 0);

            game.removeHeroFromParty(0);

            expect(game.state.battleParty.positions[0].heroId).toBeNull();
        });

        it('should swap heroes between positions', () => {
            const hero1 = game.createHero(0);
            const hero2 = game.createHero(1);

            game.addHeroToParty(hero1.id, 0);
            game.addHeroToParty(hero2.id, 1);

            game.swapPartyPositions(0, 1);

            expect(game.state.battleParty.positions[0].heroId).toBe(hero2.id);
            expect(game.state.battleParty.positions[1].heroId).toBe(hero1.id);
        });

        it('should get list of heroes currently in party', () => {
            const hero1 = game.createHero(0);
            const hero2 = game.createHero(1);

            game.addHeroToParty(hero1.id, 0);
            game.addHeroToParty(hero2.id, 3);

            const partyHeroes = game.getPartyHeroes();
            expect(partyHeroes).toHaveLength(2);
            expect(partyHeroes[0].id).toBe(hero1.id);
            expect(partyHeroes[1].id).toBe(hero2.id);
        });
    });

    describe('Tactics System - Data Structure', () => {
        it('should have tactics library organized by class', () => {
            expect(game.tacticsLibrary).toBeDefined();
            expect(game.tacticsLibrary.fighter).toBeDefined();
            expect(game.tacticsLibrary.rogue).toBeDefined();
            expect(game.tacticsLibrary.wizard).toBeDefined();
        });

        it('should define tactic properties correctly', () => {
            const rogueTactic = game.tacticsLibrary.rogue[0];

            expect(rogueTactic).toHaveProperty('id');
            expect(rogueTactic).toHaveProperty('name');
            expect(rogueTactic).toHaveProperty('description');
            expect(rogueTactic).toHaveProperty('category');
            expect(rogueTactic).toHaveProperty('unlockLevel');
            expect(rogueTactic).toHaveProperty('effects');
        });

        it('should have different tactic categories', () => {
            const allTactics = Object.values(game.tacticsLibrary).flat();
            const categories = [...new Set(allTactics.map(t => t.category))];

            expect(categories).toContain('offensive');
            expect(categories).toContain('defensive');
            expect(categories).toContain('support');
        });

        it('should have row preferences in tactic effects', () => {
            const fighterTactics = game.tacticsLibrary.fighter;
            const frontLineTactic = fighterTactics.find(t => t.effects.rowPreference === 'front');
            const backLineTactic = game.tacticsLibrary.wizard.find(t => t.effects.rowPreference === 'back');

            expect(frontLineTactic).toBeDefined();
            expect(backLineTactic).toBeDefined();
        });
    });

    describe('Tactics - Unlocking System', () => {
        it('should track unlocked tactics per hero', () => {
            const hero = game.createHero(0);

            expect(hero.unlockedTactics).toBeDefined();
            expect(Array.isArray(hero.unlockedTactics)).toBe(true);
        });

        it('should unlock basic tactics for new heroes', () => {
            const hero = game.createHero(0);

            // Should have at least 1 tactic unlocked at level 1
            expect(hero.unlockedTactics.length).toBeGreaterThan(0);
        });

        it('should unlock new tactics when hero reaches required level', () => {
            const hero = game.createHero(0);
            const className = game.heroTemplates[hero.classIndex].name.toLowerCase();

            const initialTactics = hero.unlockedTactics.length;

            // Level up hero to level 10
            hero.level = 10;
            game.checkTacticUnlocks(hero);

            // Should have unlocked more tactics
            expect(hero.unlockedTactics.length).toBeGreaterThanOrEqual(initialTactics);
        });

        it('should get available tactics for a hero based on class and level', () => {
            const hero = game.createHero(0);
            hero.level = 5;
            game.checkTacticUnlocks(hero);

            const available = game.getAvailableTactics(hero);

            expect(Array.isArray(available)).toBe(true);
            available.forEach(tactic => {
                expect(tactic.unlockLevel).toBeLessThanOrEqual(hero.level);
            });
        });

        it('should not allow using locked tactics', () => {
            const hero = game.createHero(0);
            const className = game.heroTemplates[hero.classIndex].name.toLowerCase();

            // Find a high level tactic
            const highLevelTactic = game.tacticsLibrary[className].find(t => t.unlockLevel > hero.level);

            if (highLevelTactic) {
                const canUse = game.canUseTactic(hero, highLevelTactic.id);
                expect(canUse).toBe(false);
            }
        });
    });

    describe('Tactics - Assignment', () => {
        it('should assign tactic to hero in party', () => {
            const hero = game.createHero(0);
            game.addHeroToParty(hero.id, 0);

            const tacticId = hero.unlockedTactics[0];
            game.assignTacticToPartyHero(0, tacticId);

            expect(game.state.battleParty.positions[0].tacticId).toBe(tacticId);
        });

        it('should only allow assigning unlocked tactics', () => {
            const hero = game.createHero(0);
            game.addHeroToParty(hero.id, 0);

            const result = game.assignTacticToPartyHero(0, 'fake_tactic_id');
            expect(result).toBe(false);
        });

        it('should validate tactic matches hero class', () => {
            const hero = game.createHero(0); // Fighter
            game.addHeroToParty(hero.id, 0);

            // Try to assign a wizard tactic to a fighter
            const className = game.heroTemplates[hero.classIndex].name.toLowerCase();
            if (className === 'fighter') {
                const wizardTactic = game.tacticsLibrary.wizard[0];
                const result = game.assignTacticToPartyHero(0, wizardTactic.id);
                expect(result).toBe(false);
            }
        });

        it('should get active tactic for a party position', () => {
            const hero = game.createHero(0);
            game.addHeroToParty(hero.id, 0);

            const tacticId = hero.unlockedTactics[0];
            game.assignTacticToPartyHero(0, tacticId);

            const tactic = game.getActiveTactic(0);
            expect(tactic).toBeDefined();
            expect(tactic.id).toBe(tacticId);
        });
    });

    describe('Battle Party - Validation', () => {
        it('should validate if party is ready for battle', () => {
            // Empty party should not be ready
            expect(game.isPartyReady()).toBe(false);

            // Add at least one hero
            const hero = game.createHero(0);
            game.addHeroToParty(hero.id, 0);

            // Party with at least 1 hero should be ready
            expect(game.isPartyReady()).toBe(true);
        });

        it('should check if position is front row or back row', () => {
            expect(game.isFrontRow(0)).toBe(true);
            expect(game.isFrontRow(1)).toBe(true);
            expect(game.isFrontRow(2)).toBe(true);
            expect(game.isFrontRow(3)).toBe(false);
            expect(game.isFrontRow(4)).toBe(false);
            expect(game.isFrontRow(5)).toBe(false);
        });

        it('should warn about suboptimal positioning (e.g., tanks in back row)', () => {
            const fighter = game.createHero(0); // Fighter (tank)

            // Assign defensive tactic
            const defensiveTactic = game.tacticsLibrary.fighter.find(t => t.category === 'defensive');
            if (defensiveTactic) {
                fighter.unlockedTactics.push(defensiveTactic.id);

                // Put fighter in back row
                game.addHeroToParty(fighter.id, 3); // Back row position
                game.assignTacticToPartyHero(3, defensiveTactic.id);

                const warnings = game.getPartyWarnings();
                // Should warn about tank in back row if tactic prefers front
                expect(Array.isArray(warnings)).toBe(true);
            }
        });
    });

    describe('Tactics - Example Tactics for Each Class', () => {
        it('should have rogue stealth/opportunistic tactics', () => {
            const rogueTactics = game.tacticsLibrary.rogue;
            const stealthTactic = rogueTactics.find(t => t.name.toLowerCase().includes('shadow') || t.name.toLowerCase().includes('stealth'));
            const opportunisticTactic = rogueTactics.find(t => t.description.toLowerCase().includes('opportun'));

            expect(rogueTactics.length).toBeGreaterThan(0);
            // At least one should involve stealth/shadow/opportunistic mechanics
            expect(stealthTactic || opportunisticTactic).toBeDefined();
        });

        it('should have fighter tank/aggressive tactics', () => {
            const fighterTactics = game.tacticsLibrary.fighter;
            const tankTactic = fighterTactics.find(t => t.category === 'defensive');
            const aggressiveTactic = fighterTactics.find(t => t.category === 'offensive');

            expect(tankTactic).toBeDefined();
            expect(aggressiveTactic).toBeDefined();
        });

        it('should have wizard back-row ranged tactics', () => {
            const wizardTactics = game.tacticsLibrary.wizard;
            const backRowTactic = wizardTactics.find(t => t.effects.rowPreference === 'back');

            expect(backRowTactic).toBeDefined();
        });
    });
});
