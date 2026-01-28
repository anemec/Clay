export const equipmentMethods = {
    // === Equipment & Crafting ===
    selectEquipmentHero(heroId) {
        if (!heroId) return;
        this.state.selectedEquipmentHeroId = heroId;
        this.renderEquipment();
    },

    equipItem(itemId, heroId) {
        const hero = this.state.heroes.find(h => h.id === heroId);
        if (!hero) return;

        const itemIndex = this.state.inventory.findIndex(i => i.id === itemId);
        if (itemIndex === -1) return;

        const item = this.state.inventory[itemIndex];
        if (!item || (item.type !== 'weapon' && item.type !== 'armor')) {
            alert('This item cannot be equipped.');
            return;
        }

        if (!hero.equipment) {
            hero.equipment = { weapon: null, armor: null };
        }

        const slot = item.type;
        if (hero.equipment[slot]) {
            this.unequipItem(slot, heroId, { silent: true });
        }

        this.applyItemStats(hero, item, 1);
        hero.equipment[slot] = item;
        this.state.inventory.splice(itemIndex, 1);

        this.save();
        this.render();
    },

    unequipItem(slot, heroId, options: { silent?: boolean } = {}) {
        const hero = this.state.heroes.find(h => h.id === heroId);
        if (!hero || !hero.equipment) return;

        const item = hero.equipment[slot];
        if (!item) return;

        this.applyItemStats(hero, item, -1);
        hero.equipment[slot] = null;
        this.state.inventory.push(item);

        if (!options.silent) {
            this.save();
            this.render();
        }
    },

    craftItem(recipeId) {
        const recipe = this.craftingRecipes.find(r => r.id === recipeId);
        if (!recipe) return;

        const materials = recipe.materials || {};
        const materialEntries = Object.entries(materials) as [string, number][];

        const canCraft = materialEntries.every(([material, amount]) => {
            return (this.state.materials[material] || 0) >= amount;
        });

        if (!canCraft) {
            alert('Not enough materials.');
            return;
        }

        materialEntries.forEach(([material, amount]) => {
            this.state.materials[material] -= amount;
        });

        const tierMultiplier = this.getCraftingTierMultiplier(recipe.tier || 1);
        const scaledStats = this.scaleItemStats(recipe.stats || {}, tierMultiplier);
        const scaledValue = Math.round((recipe.value || 0) * tierMultiplier);

        const item = {
            id: this.nextItemId++,
            name: recipe.name,
            type: recipe.type,
            rarity: recipe.rarity,
            level: recipe.level,
            value: scaledValue,
            stats: scaledStats,
            description: recipe.description
        };

        this.state.inventory.push(item);
        this.save();
        this.render();
    },

    refineMaterial(recipeId) {
        const recipe = this.refiningRecipes.find(r => r.id === recipeId);
        if (!recipe) return;

        const inputs = Object.entries(recipe.inputs || {}) as [string, number][];
        const outputs = Object.entries(recipe.outputs || {}) as [string, number][];

        const canRefine = inputs.every(([material, amount]) => {
            return (this.state.materials[material] || 0) >= amount;
        });

        if (!canRefine) {
            alert('Not enough materials to refine.');
            return;
        }

        inputs.forEach(([material, amount]) => {
            this.state.materials[material] -= amount;
        });

        outputs.forEach(([material, amount]) => {
            if (!this.state.materials[material]) {
                this.state.materials[material] = 0;
            }
            this.state.materials[material] += amount;
        });

        this.save();
        this.render();
    },

    applyItemStats(hero, item, direction: number) {
        const stats = item.stats || {};
        const attack = stats.attack || 0;
        const defense = stats.defense || 0;

        hero.atk += attack * direction;
        hero.def += defense * direction;
    },

    getCraftingTierMultiplier(tier) {
        const multipliers = {
            1: 1.0,
            2: 1.3,
            3: 1.6
        };
        return multipliers[tier] || 1.0;
    },

    scaleItemStats(stats, multiplier: number) {
        const scaled = {};
        (Object.entries(stats) as [string, number][]).forEach(([key, value]) => {
            scaled[key] = Math.round((value || 0) * multiplier);
        });
        return scaled;
    }
};
