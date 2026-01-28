export const tacticsMethods = {
    // === Tactics System Functions ===

    // Check and unlock tactics for a hero based on level
    checkTacticUnlocks(hero) {
        if (!hero.unlockedTactics) {
            hero.unlockedTactics = [];
        }

        // Validate hero has valid classIndex
        if (hero.classIndex === undefined || !this.heroTemplates[hero.classIndex]) {
            return;
        }

        const className = this.heroTemplates[hero.classIndex].name.toLowerCase();
        const classTactics = this.tacticsLibrary[className];

        if (!classTactics) return;

        classTactics.forEach(tactic => {
            // Unlock if hero meets level requirement and doesn't have it yet
            if (tactic.unlockLevel <= hero.level && !hero.unlockedTactics.includes(tactic.id)) {
                hero.unlockedTactics.push(tactic.id);
            }
        });
    },

    // Get all available (unlocked) tactics for a hero
    getAvailableTactics(hero) {
        if (!hero.unlockedTactics) return [];

        const className = this.heroTemplates[hero.classIndex].name.toLowerCase();
        const classTactics = this.tacticsLibrary[className] || [];

        return classTactics.filter(tactic => hero.unlockedTactics.includes(tactic.id));
    },

    // Check if hero can use specific tactic
    canUseTactic(hero, tacticId) {
        return hero.unlockedTactics && hero.unlockedTactics.includes(tacticId);
    },

    // Assign tactic to hero in party position
    assignTacticToPartyHero(position, tacticId) {
        if (position < 0 || position >= 6) return false;

        const pos = this.state.battleParty.positions[position];
        if (pos.heroId === null) return false;

        const hero = this.state.heroes.find(h => h.id === pos.heroId);
        if (!hero) return false;

        // Verify hero has this tactic unlocked
        if (!this.canUseTactic(hero, tacticId)) return false;

        // Verify tactic belongs to hero's class
        const className = this.heroTemplates[hero.classIndex].name.toLowerCase();
        const classTactics = this.tacticsLibrary[className] || [];
        const tactic = classTactics.find(t => t.id === tacticId);

        if (!tactic) return false;

        // Assign tactic
        pos.tacticId = tacticId;
        this.save();
        return true;
    },

    // Get active tactic for a party position
    getActiveTactic(position) {
        if (position < 0 || position >= 6) return null;

        const pos = this.state.battleParty.positions[position];
        if (pos.tacticId === null) return null;

        // Find tactic in library
        for (const className in this.tacticsLibrary) {
            const tactic = this.tacticsLibrary[className].find(t => t.id === pos.tacticId);
            if (tactic) return tactic;
        }

        return null;
    }
};
