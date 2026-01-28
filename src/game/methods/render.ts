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
        } else if (this.state.activeTab === 'equipment') {
            this.renderEquipment();
        } else if (this.state.activeTab === 'crafting') {
            this.renderCrafting();
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
        if (!item || !item.stats) return 'No stats';
        const parts = [];
        if (item.stats.attack) parts.push(`ATK +${item.stats.attack}`);
        if (item.stats.defense) parts.push(`DEF +${item.stats.defense}`);
        return parts.length ? parts.join(' • ') : 'No stats';
    }
};
