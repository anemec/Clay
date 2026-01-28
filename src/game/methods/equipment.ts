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

        const item = {
            id: this.nextItemId++,
            name: recipe.name,
            type: recipe.type,
            rarity: recipe.rarity,
            level: recipe.level,
            value: recipe.value,
            stats: recipe.stats,
            description: recipe.description
        };

        this.state.inventory.push(item);
        this.save();
        this.render();
    },

    applyItemStats(hero, item, direction: number) {
        const stats = item.stats || {};
        const attack = stats.attack || 0;
        const defense = stats.defense || 0;

        hero.atk += attack * direction;
        hero.def += defense * direction;
    }
};
