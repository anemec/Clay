export const heroMethods = {
    // === Hero Unlock System ===
    checkHeroUnlocks() {
        // Check each locked hero class to see if it should be unlocked
        this.heroTemplates.forEach((template, index) => {
            if (!this.state.unlockedClasses.includes(index)) {
                const shouldUnlock = this.checkUnlockRequirement(index);
                if (shouldUnlock) {
                    this.state.unlockedClasses.push(index);
                    this.save();
                }
            }
        });
    },

    checkUnlockRequirement(classIndex) {
        const template = this.heroTemplates[classIndex];

        switch (template.name) {
            case "Cleric":
                // Requires Wizard Lv.15
                return this.state.heroes.some(h => h.classIndex === 1 && h.level >= 15);

            case "Ranger":
                // Requires Rogue Lv.15
                return this.state.heroes.some(h => h.classIndex === 2 && h.level >= 15);

            case "Barbarian":
                // Requires Fighter Lv.15
                return this.state.heroes.some(h => h.classIndex === 0 && h.level >= 15);

            case "Paladin": {
                // Requires Fighter Lv.30 + Cleric Lv.15
                const hasFighter30 = this.state.heroes.some(h => h.classIndex === 0 && h.level >= 30);
                const hasCleric15 = this.state.heroes.some(h => h.classIndex === 3 && h.level >= 15);
                return hasFighter30 && hasCleric15;
            }

            case "Warlock":
                // Requires Wizard Lv.30
                return this.state.heroes.some(h => h.classIndex === 1 && h.level >= 30);

            case "Monk": {
                // Requires Fighter Lv.20 + Rogue Lv.15
                const hasFighter20 = this.state.heroes.some(h => h.classIndex === 0 && h.level >= 20);
                const hasRogue15 = this.state.heroes.some(h => h.classIndex === 2 && h.level >= 15);
                return hasFighter20 && hasRogue15;
            }

            case "Bard": {
                // Requires 3 heroes at Lv.20+
                const level20Heroes = this.state.heroes.filter(h => h.level >= 20);
                return level20Heroes.length >= 3;
            }

            default:
                return false;
        }
    },

    // === Hero Management ===
    // Internal method to create a hero (can be used by tests)
    createHero(classIndex) {
        const template = this.heroTemplates[classIndex];
        if (!template) return null;

        const hero = {
            id: this.state.nextHeroId++,
            classIndex: classIndex,
            name: `${template.name} #${this.state.nextHeroId - 1}`,
            level: 1,
            exp: 0,
            hp: template.hp,
            maxHp: template.hp,
            atk: template.atk,
            def: template.def,
            mdef: template.mdef,
            crit: template.crit,
            status: 'idle', // 'idle' or 'questing'
            questId: null,
            questStartTime: null,
            questDuration: null,
            equipment: { weapon: null, armor: null },
            unlockedTactics: [] // Initialize empty tactics array
        };

        this.state.heroes.push(hero);

        // Unlock tactics for new hero
        this.checkTacticUnlocks(hero);

        return hero;
    },

    hireHero() {
        const selectElement = document.getElementById('hero-class-select');
        const classIndex = parseInt(selectElement.value);
        const template = this.heroTemplates[classIndex];

        if (!this.state.unlockedClasses.includes(classIndex)) {
            alert(`${template.name} is locked! ${template.unlockReq}`);
            return;
        }

        const cost = template.cost;

        if (this.state.gold < cost) {
            alert(`Not enough gold! Need ${cost}g`);
            return;
        }

        this.state.gold -= cost;
        this.createHero(classIndex);

        this.save();
        this.render();
    },

    giveExp(hero, exp) {
        hero.exp += exp;
        let leveledUp = false;

        // Level up check - recalculate expNeeded each iteration
        while (hero.exp >= this.getExpForLevel(hero.level)) {
            const expNeeded = this.getExpForLevel(hero.level);
            hero.exp -= expNeeded;
            hero.level++;
            leveledUp = true;

            // Apply stat gains
            const template = this.heroTemplates[hero.classIndex];
            const tier = Math.min(Math.floor(hero.level / 10), 2); // 0, 1, or 2

            hero.maxHp += template.hpPlv[tier];
            hero.hp = hero.maxHp;
            hero.atk += template.atkPlv[tier];
            hero.def += template.defPlv[tier];
        }

        // Check for hero and tactic unlocks after leveling
        if (leveledUp) {
            this.checkHeroUnlocks();
            this.checkTacticUnlocks(hero);
        }
    },

    getExpForLevel(level) {
        return level * this.expPerLevelMultiplier;
    }
};
