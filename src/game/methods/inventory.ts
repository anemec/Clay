export const inventoryMethods = {
    // === Inventory + Shop ===
    sellItem(itemId) {
        const itemIndex = this.state.inventory.findIndex(item => item.id === itemId);
        if (itemIndex === -1) return;

        const item = this.state.inventory[itemIndex];
        const value = item.value || 0;

        this.state.inventory.splice(itemIndex, 1);
        this.state.gold += value;

        this.save();
        this.render();
    },

    buyShopItem(shopItemId) {
        const shopItem = this.shopItems.find(item => item.id === shopItemId);
        if (!shopItem) return;

        if (this.state.gold < shopItem.price) {
            alert(`Not enough gold! Need ${shopItem.price}g`);
            return;
        }

        this.state.gold -= shopItem.price;

        const item = {
            id: this.nextItemId++,
            name: shopItem.name,
            type: shopItem.type,
            rarity: shopItem.rarity,
            level: shopItem.level,
            value: shopItem.value,
            stats: shopItem.stats || {},
            description: shopItem.description
        };

        this.state.inventory.push(item);
        this.save();
        this.render();
    }
};
