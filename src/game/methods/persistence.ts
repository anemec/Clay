import { SAVE_KEY } from '../../utils/index';

export const persistenceMethods = {
    // === Save/Load ===
    save() {
        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify(this.state));
        } catch (e) {
            console.error('Failed to save game:', e);
        }
    },

    load() {
        try {
            const saved = localStorage.getItem(SAVE_KEY);
            if (saved) {
                const loadedState = JSON.parse(saved);
                // Merge with defaults to handle new properties
                this.state = { ...this.state, ...loadedState };

                // Backwards compatibility: Initialize unlockedTactics for existing heroes
                if (this.state.heroes) {
                    this.state.heroes.forEach(hero => {
                        if (!hero.unlockedTactics) {
                            hero.unlockedTactics = [];
                            this.checkTacticUnlocks(hero);
                        }
                        if (!hero.equipment) {
                            hero.equipment = { weapon: null, armor: null };
                        }
                    });
                }

                if (!this.state.adventure) {
                    this.state.adventure = {
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
                        log: []
                    };
                } else if (!this.state.adventure.log) {
                    this.state.adventure.log = [];
                }
            }
        } catch (e) {
            console.error('Failed to load game:', e);
        }
    },

    reset() {
        if (confirm('Are you sure you want to reset all progress? This cannot be undone!')) {
            localStorage.removeItem(SAVE_KEY);
            location.reload();
        }
    }
};
