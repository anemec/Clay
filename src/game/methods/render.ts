export const renderMethods = {
    // === Rendering ===
    render() {
        // Update gold
        const goldElement = document.getElementById('gold');
        const heroCountElement = document.getElementById('hero-count');
        if (goldElement) goldElement.textContent = String(Math.floor(this.state.gold));
        if (heroCountElement) heroCountElement.textContent = String(this.state.heroes.length);

        // Render based on active tab
        if (this.state.activeTab === 'heroes') {
            this.renderHeroes();
        } else if (this.state.activeTab === 'party') {
            this.renderParty();
        } else if (this.state.activeTab === 'quests') {
            this.renderQuests();
        } else if (this.state.activeTab === 'adventure') {
            this.renderAdventure();
        } else if (this.state.activeTab === 'inventory') {
            this.renderInventory();
        } else if (this.state.activeTab === 'equipment') {
            this.renderEquipment();
        } else if (this.state.activeTab === 'crafting') {
            this.renderCrafting();
        } else if (this.state.activeTab === 'shop') {
            this.renderShop();
        } else if (this.state.activeTab === 'materials') {
            this.renderMaterials();
        }
    },

    renderHeroes() {
        // Render hero class select dropdown (only when unlocked classes change)
        const heroClassSelect = document.getElementById('hero-class-select');
        if (heroClassSelect) {
            // Check if unlocked classes changed
            const unlocksChanged = JSON.stringify(this.state.unlockedClasses) !== JSON.stringify(this.lastUnlockedClasses);

            if (unlocksChanged) {
                heroClassSelect.innerHTML = this.heroTemplates.map((template, index) => {
                    const isUnlocked = this.state.unlockedClasses.includes(index);
                    if (isUnlocked) {
                        return `<option value="${index}">${template.name} - ${template.cost}g</option>`;
                    } else {
                        return `<option value="${index}" disabled>🔒 ${template.name} - ${template.unlockReq}</option>`;
                    }
                }).join('');

                // Update tracking variable
                this.lastUnlockedClasses = [...this.state.unlockedClasses];
            }
        }

        // Render hero list
        const heroesListElement = document.getElementById('heroes-list');

        if (this.state.heroes.length === 0) {
            heroesListElement.innerHTML = '<div class="empty-state">No heroes hired yet. Hire your first hero above!</div>';
            return;
        }

        const heroesHtml = this.state.heroes.map(hero => {
            const template = this.heroTemplates[hero.classIndex];
            const isQuesting = hero.status === 'questing';
            const now = Date.now();
            const elapsed = isQuesting ? (now - hero.questStartTime) / 1000 : 0;
            const remaining = isQuesting ? Math.max(0, hero.questDuration - elapsed) : 0;
            const progress = isQuesting ? Math.min(100, (elapsed / hero.questDuration) * 100) : 0;
            const quest = isQuesting ? this.questTemplates.find(q => q.id === hero.questId) : null;
            const weapon = hero.equipment?.weapon?.name || 'None';
            const armor = hero.equipment?.armor?.name || 'None';

            return `
                <div class="hero-card ${isQuesting ? 'questing' : ''}">
                    <div class="hero-icon">
                        <img src="${template.icon}" alt="${template.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2264%22 height=%2264%22%3E%3Crect fill=%22%23333%22 width=%2264%22 height=%2264%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22white%22 font-size=%2232%22%3E${template.name[0]}%3C/text%3E%3C/svg%3E'">
                    </div>
                    <div class="hero-info">
                        <div class="hero-name">${hero.name}</div>
                        <div class="hero-class">${template.name} • Lv.${hero.level}</div>
                        <div class="hero-stats">
                            <span>❤️ ${hero.hp}/${hero.maxHp}</span>
                            <span>⚔️ ${Math.floor(hero.atk)}</span>
                            <span>🛡️ ${Math.floor(hero.def)}</span>
                            ${hero.crit > 1 ? `<span>💥 ${hero.crit}</span>` : ''}
                        </div>
                        <div class="hero-exp">
                            <div class="exp-bar">
                                <div class="exp-fill" style="width: ${(hero.exp / this.getExpForLevel(hero.level)) * 100}%"></div>
                            </div>
                            <span class="exp-text">${hero.exp}/${this.getExpForLevel(hero.level)} EXP</span>
                        </div>
                        <div class="hero-equipment">⚙️ ${weapon} • ${armor}</div>
                        ${isQuesting ? `
                            <div class="quest-status">
                                <div class="quest-name">⏳ ${quest.name}</div>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${progress}%"></div>
                                </div>
                                <div class="quest-timer">${this.formatTime(Math.ceil(remaining))}</div>
                            </div>
                        ` : `
                            <div class="hero-status">✅ Idle - Ready for quest</div>
                        `}
                    </div>
                </div>
            `;
        }).join('');

        heroesListElement.innerHTML = heroesHtml;
    },

    renderQuests() {
        const questsListElement = document.getElementById('quests-list');

        const questsHtml = this.questTemplates.map(quest => {
            return `
                <div class="quest-card" data-action="openQuestModal" data-quest-id="${quest.id}">
                    <div class="quest-header">
                        <div class="quest-title">${quest.name}</div>
                        <div class="quest-level">Lv.${quest.level}</div>
                    </div>
                    <div class="quest-description">${quest.desc}</div>
                    <div class="quest-rewards">
                        <span class="reward">💰 ${quest.gold}g</span>
                        <span class="reward">⭐ ${quest.exp} EXP</span>
                        <span class="reward">⏱️ ${this.formatTime(quest.duration)}</span>
                    </div>
                    <div class="quest-materials-preview">
                        ${quest.materials.slice(0, 3).map((m, i) => `<span class="material-tag">${m} ×${quest.materialCount[i]}</span>`).join('')}
                    </div>
                </div>
            `;
        }).join('');

        questsListElement.innerHTML = questsHtml;
    },

    renderInventory() {
        const inventoryList = document.getElementById('inventory-list');
        if (!inventoryList) return;

        if (!this.state.inventory || this.state.inventory.length === 0) {
            inventoryList.innerHTML = '<div class="empty-state">No items in inventory yet.</div>';
            return;
        }

        const inventoryHtml = this.state.inventory.map(item => {
            return `
                <div class="inventory-item">
                    <div class="inventory-name">${item.name}</div>
                    <div class="inventory-meta">${item.rarity} • ${item.type} • Lv.${item.level}</div>
                    <div class="inventory-stats">${this.formatItemStats(item)}</div>
                    <div class="inventory-actions">
                        <span class="inventory-value">💰 ${item.value}g</span>
                        <button class="btn btn-secondary" data-action="sellItem" data-item-id="${item.id}">Sell</button>
                    </div>
                </div>
            `;
        }).join('');

        inventoryList.innerHTML = inventoryHtml;
    },

    renderAdventure() {
        const adventureList = document.getElementById('adventure-list');
        const adventureStatus = document.getElementById('adventure-status');
        const adventureLog = document.getElementById('adventure-log');
        if (!adventureList || !adventureStatus || !adventureLog) return;

        const heroes = this.state.heroes || [];

        if (this.state.adventure?.active) {
            const activeAdventure = this.adventureTemplates.find(a => a.id === this.state.adventure.adventureId);
            adventureStatus.innerHTML = `
                <div class="panel">
                    <h2 class="panel-title">Adventure In Progress</h2>
                    <div class="adventure-status">
                        <div><strong>${activeAdventure?.name || 'Unknown Adventure'}</strong></div>
                        <div>Tick ${this.state.adventure.tick} / ${this.state.adventure.ticksToGoal}</div>
                        <div>Last Event: ${this.state.adventure.lastEvent || 'None'}</div>
                        <div>Supplies: 🧪 ${this.state.adventure.resources.potions} • 🍖 ${this.state.adventure.resources.food} • 💰 ${this.state.adventure.resources.gold}</div>
                    </div>
                    <button class="btn btn-secondary" data-action="tickAdventure">Advance Tick</button>
                </div>
            `;
        } else {
            const outcome = this.state.adventure?.outcome ? `Last outcome: ${this.state.adventure.outcome}` : 'No adventure active.';
            adventureStatus.innerHTML = `<div class="panel"><div class="panel-title">Status</div><div>${outcome}</div></div>`;
        }

        if (heroes.length === 0) {
            adventureList.innerHTML = '<div class="empty-state">Hire heroes to start an adventure.</div>';
            return;
        }

        adventureList.innerHTML = this.adventureTemplates.map(adventure => {
            return `
                <div class="adventure-card">
                    <div class="adventure-header">
                        <div class="adventure-title">${adventure.name}</div>
                        <div class="adventure-goal">${adventure.goalType}</div>
                    </div>
                    <div class="adventure-meta">Goal in ${adventure.ticksToGoal} ticks • Difficulty ${adventure.difficulty}</div>
                    <div class="adventure-heroes">
                        ${heroes.map(hero => `
                            <label class="adventure-hero">
                                <input type="checkbox" data-adventure-id="${adventure.id}" data-adventure-hero="${hero.id}">
                                ${hero.name} (Lv.${hero.level})
                            </label>
                        `).join('')}
                    </div>
                    <div class="adventure-resources">
                        <label>Potions <input type="number" min="0" value="0" data-adventure-resource="potions" data-adventure-id="${adventure.id}"></label>
                        <label>Food <input type="number" min="0" value="0" data-adventure-resource="food" data-adventure-id="${adventure.id}"></label>
                        <label>Gold <input type="number" min="0" value="0" data-adventure-resource="gold" data-adventure-id="${adventure.id}"></label>
                        <label>Risk <input type="number" min="0" max="1" step="0.05" value="0.4" data-adventure-resource="risk" data-adventure-id="${adventure.id}"></label>
                    </div>
                    <button class="btn btn-primary" data-action="startAdventureForm" data-adventure-id="${adventure.id}">Start Adventure</button>
                </div>
            `;
        }).join('');

        const logEntries = this.state.adventure?.log || [];
        if (logEntries.length === 0) {
            adventureLog.innerHTML = '<div class="empty-state">No adventure log entries yet.</div>';
        } else {
            adventureLog.innerHTML = logEntries.slice().reverse().map(entry => {
                return `<div class="adventure-log-entry">${entry}</div>`;
            }).join('');
        }
    },

    renderEquipment() {
        const heroSelect = document.getElementById('equipment-hero-select') as HTMLSelectElement | null;
        const equippedList = document.getElementById('equipment-slots');
        const inventoryList = document.getElementById('equipment-inventory');

        if (!heroSelect || !equippedList || !inventoryList) return;

        if (this.state.heroes.length === 0) {
            heroSelect.innerHTML = '<option>No heroes available</option>';
            equippedList.innerHTML = '<div class="empty-state">Hire a hero to equip items.</div>';
            inventoryList.innerHTML = '<div class="empty-state">No equipment items yet.</div>';
            return;
        }

        let selectedHeroId = this.state.selectedEquipmentHeroId;
        if (!selectedHeroId || !this.state.heroes.some(h => h.id === selectedHeroId)) {
            selectedHeroId = this.state.heroes[0].id;
            this.state.selectedEquipmentHeroId = selectedHeroId;
        }

        heroSelect.innerHTML = this.state.heroes.map(hero => {
            return `<option value="${hero.id}">${hero.name} (Lv.${hero.level})</option>`;
        }).join('');
        heroSelect.value = String(selectedHeroId);

        const hero = this.state.heroes.find(h => h.id === selectedHeroId);
        if (!hero) return;

        if (!hero.equipment) {
            hero.equipment = { weapon: null, armor: null };
        }

        const slots = [
            { key: 'weapon', label: 'Weapon' },
            { key: 'armor', label: 'Armor' }
        ];

        equippedList.innerHTML = slots.map(slot => {
            const item = hero.equipment[slot.key];
            if (item) {
                return `
                    <div class="equipment-slot">
                        <div class="equipment-name">${slot.label}: ${item.name}</div>
                        <div class="equipment-stats">${this.formatItemStats(item)}</div>
                        <button class="btn btn-secondary" data-action="unequipItem" data-slot="${slot.key}" data-hero-id="${hero.id}">Unequip</button>
                    </div>
                `;
            }

            return `
                <div class="equipment-slot empty">
                    <div class="equipment-name">${slot.label}: None</div>
                    <div class="equipment-stats">No ${slot.label.toLowerCase()} equipped.</div>
                </div>
            `;
        }).join('');

        const equipmentItems = this.state.inventory.filter(item => item.type === 'weapon' || item.type === 'armor');
        if (equipmentItems.length === 0) {
            inventoryList.innerHTML = '<div class="empty-state">No equipment items in inventory.</div>';
        } else {
            inventoryList.innerHTML = equipmentItems.map(item => {
                return `
                    <div class="inventory-item">
                        <div class="inventory-name">${item.name}</div>
                        <div class="inventory-meta">${item.rarity} • Lv.${item.level}</div>
                        <div class="inventory-stats">${this.formatItemStats(item)}</div>
                        <button class="btn btn-primary" data-action="equipItem" data-item-id="${item.id}" data-hero-id="${hero.id}">Equip</button>
                    </div>
                `;
            }).join('');
        }
    },

    renderCrafting() {
        const recipesList = document.getElementById('crafting-recipes');
        if (!recipesList) return;

        recipesList.innerHTML = this.craftingRecipes.map(recipe => {
            const materials = Object.entries(recipe.materials || {}).map(([material, amount]) => {
                const owned = this.state.materials[material] || 0;
                const isEnough = owned >= amount;
                return `<span class="material-tag ${isEnough ? '' : 'material-missing'}">${material} ×${amount}</span>`;
            }).join('');

            const canCraft = Object.entries(recipe.materials || {}).every(([material, amount]) => {
                return (this.state.materials[material] || 0) >= amount;
            });

            return `
                <div class="crafting-card">
                    <div class="crafting-header">
                        <div class="crafting-title">${recipe.name}</div>
                        <div class="crafting-level">Lv.${recipe.level}</div>
                    </div>
                    <div class="crafting-description">${recipe.description}</div>
                    <div class="crafting-rewards">
                        <span class="reward">⚔️ ${recipe.type}</span>
                        <span class="reward">${this.formatItemStats(recipe)}</span>
                        <span class="reward">💰 ${recipe.value}g</span>
                    </div>
                    <div class="quest-materials-preview">
                        ${materials}
                    </div>
                    <button class="btn btn-primary" data-action="craftItem" data-recipe-id="${recipe.id}" ${canCraft ? '' : 'disabled'}>Craft</button>
                </div>
            `;
        }).join('');
    },

    renderShop() {
        const shopList = document.getElementById('shop-list');
        if (!shopList) return;

        shopList.innerHTML = this.shopItems.map(item => {
            const canBuy = this.state.gold >= item.price;

            return `
                <div class="shop-item">
                    <div class="shop-name">${item.name}</div>
                    <div class="shop-meta">${item.rarity} • ${item.type} • Lv.${item.level}</div>
                    <div class="shop-description">${item.description}</div>
                    <div class="shop-actions">
                        <span class="inventory-value">💰 ${item.price}g</span>
                        <button class="btn btn-primary" data-action="buyShopItem" data-shop-item-id="${item.id}" ${canBuy ? '' : 'disabled'}>Buy</button>
                    </div>
                </div>
            `;
        }).join('');
    },

    renderMaterials() {
        const materialsListElement = document.getElementById('materials-list');
        if (!materialsListElement) return;
        const materials = (Object.entries(this.state.materials) as [string, number][]).filter(([_, count]) => count > 0);

        if (materials.length === 0) {
            materialsListElement.innerHTML = '<div class="empty-state">No materials collected yet. Send heroes on quests to gather materials!</div>';
            return;
        }

        const materialsHtml = materials.map(([material, count]) => {
            return `
                <div class="material-item">
                    <div class="material-icon">📦</div>
                    <div class="material-info">
                        <div class="material-name">${material}</div>
                        <div class="material-count">×${count}</div>
                    </div>
                </div>
            `;
        }).join('');

        materialsListElement.innerHTML = materialsHtml;
    },
    formatItemStats(item) {
        if (!item) return 'No stats';
        if (item.type === 'potion' || item.type === 'food') return 'Consumable';
        if (!item.stats) return 'No stats';
        const parts = [];
        if (item.stats.attack) parts.push(`ATK +${item.stats.attack}`);
        if (item.stats.defense) parts.push(`DEF +${item.stats.defense}`);
        return parts.length ? parts.join(' • ') : 'No stats';
    }
};
