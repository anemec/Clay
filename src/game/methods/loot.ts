export const lootMethods = {
    // === Loot System Functions ===
    getDropRate(rarity) {
        return this.lootRarities[rarity]?.dropRate || 0;
    },

    rollForDrop(rarity) {
        const dropRate = this.getDropRate(rarity);
        return Math.random() <= dropRate;
    },

    selectRarity(luckMultiplier = 1.0) {
        // Generate a random number and select rarity based on cumulative drop rates
        // Higher luck multiplier shifts the roll towards better rarities
        let roll = Math.random() / luckMultiplier;

        // Check rarities from best to worst
        if (roll <= this.lootRarities.legendary.dropRate) return 'legendary';
        if (roll <= this.lootRarities.legendary.dropRate + this.lootRarities.epic.dropRate) return 'epic';
        if (roll <= this.lootRarities.legendary.dropRate + this.lootRarities.epic.dropRate + this.lootRarities.rare.dropRate) return 'rare';
        if (roll <= 0.40) return 'uncommon'; // Roughly 0.01 + 0.04 + 0.10 + 0.25
        return 'common';
    },

    generateLoot(level, options = {}) {
        const luckMultiplier = options.luckMultiplier || 1.0;

        // Select rarity
        const rarity = this.selectRarity(luckMultiplier);
        const rarityData = this.lootRarities[rarity];

        // Select item type
        const type = this.itemTypes[Math.floor(Math.random() * this.itemTypes.length)];

        // Generate value based on level and rarity
        // Ensure level always contributes significantly to value
        const baseValue = level * 20; // Base value from level
        const rarityBonus = level * 10 * (rarityData.valueMultiplier - 1); // Rarity bonus
        const value = Math.floor(baseValue + rarityBonus);

        // Generate item name based on type
        let name = '';
        let description = '';
        let stats = {};

        if (type === 'weapon') {
            const weaponNames = ['Sword', 'Axe', 'Bow', 'Staff', 'Dagger', 'Mace'];
            const baseName = weaponNames[Math.floor(Math.random() * weaponNames.length)];
            name = `${rarity.charAt(0).toUpperCase() + rarity.slice(1)} ${baseName}`;

            const attackPower = Math.floor(level * rarityData.valueMultiplier * 0.5);
            stats.attack = attackPower;
            description = `A ${rarity} weapon with ${attackPower} attack power.`;

        } else if (type === 'armor') {
            const armorNames = ['Helmet', 'Chestplate', 'Boots', 'Gloves', 'Shield'];
            const baseName = armorNames[Math.floor(Math.random() * armorNames.length)];
            name = `${rarity.charAt(0).toUpperCase() + rarity.slice(1)} ${baseName}`;

            const defensePower = Math.floor(level * rarityData.valueMultiplier * 0.4);
            stats.defense = defensePower;
            description = `A ${rarity} armor piece with ${defensePower} defense.`;

        } else if (type === 'potion') {
            const potionTypes = ['Health', 'Mana', 'Strength', 'Defense', 'Speed'];
            const baseName = potionTypes[Math.floor(Math.random() * potionTypes.length)];
            name = `${rarity.charAt(0).toUpperCase() + rarity.slice(1)} ${baseName} Potion`;
            description = `A ${rarity} potion that restores or enhances ${baseName.toLowerCase()}.`;

        } else if (type === 'material') {
            const materialNames = ['Ore', 'Crystal', 'Essence', 'Shard', 'Dust'];
            const baseName = materialNames[Math.floor(Math.random() * materialNames.length)];
            name = `${rarity.charAt(0).toUpperCase() + rarity.slice(1)} ${baseName}`;
            description = `A ${rarity} crafting material.`;
        }

        return {
            id: this.nextItemId++,
            name,
            type,
            rarity,
            level,
            value,
            stats,
            description
        };
    },

    generateQuestLoot(questId) {
        const quest = this.questTemplates.find(q => q.id === questId);
        if (!quest) return [];

        // Determine quest type based on quest name/description
        let questType = 'forest';
        if (quest.name.toLowerCase().includes('yarsol') || quest.desc.toLowerCase().includes('cove')) {
            questType = 'cove';
        } else if (quest.name.toLowerCase().includes('aldur') || quest.desc.toLowerCase().includes('highland')) {
            questType = 'highlands';
        }

        // Generate 1-3 items based on quest level
        const itemCount = Math.floor(Math.random() * 3) + 1;
        const loot = [];

        for (let i = 0; i < itemCount; i++) {
            const item = this.generateLoot(quest.level);
            loot.push(item);
        }

        return loot;
    }
};
