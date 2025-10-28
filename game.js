class MerchantGame {
    constructor() {
        this.state = {
            gold: 100,
            heroes: [],
            crafters: [],
            inventory: [],
            materials: {},
            inventorySize: 20,
            nextHeroId: 1,
            nextCrafterId: 1
        };

        this.heroClasses = {
            warrior: { name: 'Warrior', cost: 50, hp: 100, atk: 15, def: 10, icon: '⚔️' },
            mage: { name: 'Mage', cost: 50, hp: 60, atk: 25, def: 5, icon: '🔮' },
            rogue: { name: 'Rogue', cost: 50, hp: 75, atk: 20, def: 7, icon: '🗡️' },
            cleric: { name: 'Cleric', cost: 75, hp: 80, atk: 12, def: 15, icon: '✨' }
        };

        this.quests = [
            { id: 1, name: 'Forest Path', duration: 5, level: 1, rewards: { gold: 20, materials: ['wood', 'herb'] }, icon: '🌲' },
            { id: 2, name: 'Dark Cave', duration: 10, level: 3, rewards: { gold: 50, materials: ['iron', 'gem'] }, icon: '🕳️' },
            { id: 3, name: 'Mountain Peak', duration: 15, level: 5, rewards: { gold: 100, materials: ['mithril', 'crystal'] }, icon: '⛰️' },
            { id: 4, name: 'Ancient Ruins', duration: 20, level: 8, rewards: { gold: 200, materials: ['artifact', 'rune'] }, icon: '🏛️' },
            { id: 5, name: 'Dragon Lair', duration: 30, level: 10, rewards: { gold: 500, materials: ['dragon_scale', 'treasure'] }, icon: '🐉' }
        ];

        this.crafterTypes = {
            blacksmith: { name: 'Blacksmith', cost: 100, icon: '🔨', specialty: 'weapons' },
            tailor: { name: 'Tailor', cost: 100, icon: '🧵', specialty: 'armor' },
            alchemist: { name: 'Alchemist', cost: 100, icon: '⚗️', specialty: 'potions' }
        };

        this.recipes = {
            weapons: [
                { name: 'Iron Sword', materials: { iron: 3, wood: 1 }, value: 50, level: 1 },
                { name: 'Steel Axe', materials: { iron: 5, wood: 2 }, value: 100, level: 3 },
                { name: 'Mithril Blade', materials: { mithril: 3, gem: 1 }, value: 300, level: 5 }
            ],
            armor: [
                { name: 'Leather Armor', materials: { wood: 2, herb: 3 }, value: 40, level: 1 },
                { name: 'Iron Armor', materials: { iron: 4, wood: 1 }, value: 80, level: 3 },
                { name: 'Crystal Armor', materials: { crystal: 2, mithril: 2 }, value: 250, level: 5 }
            ],
            potions: [
                { name: 'Health Potion', materials: { herb: 3 }, value: 30, level: 1 },
                { name: 'Mana Potion', materials: { herb: 2, crystal: 1 }, value: 60, level: 3 },
                { name: 'Elixir', materials: { crystal: 2, gem: 1, herb: 1 }, value: 150, level: 5 }
            ]
        };

        this.load();
        this.render();
        this.startGameLoop();
    }

    hireHero() {
        const classSelect = document.getElementById('hero-class');
        const heroClass = classSelect.value;
        const classData = this.heroClasses[heroClass];

        if (this.state.gold < classData.cost) {
            alert('Not enough gold!');
            return;
        }

        this.state.gold -= classData.cost;
        const hero = {
            id: this.state.nextHeroId++,
            class: heroClass,
            name: `${classData.name} #${this.state.nextHeroId - 1}`,
            level: 1,
            exp: 0,
            hp: classData.hp,
            maxHp: classData.hp,
            atk: classData.atk,
            def: classData.def,
            status: 'idle',
            questEndTime: null,
            currentQuest: null
        };

        this.state.heroes.push(hero);
        this.render();
    }

    sendOnQuest(heroId, questId) {
        const hero = this.state.heroes.find(h => h.id === heroId);
        const quest = this.quests.find(q => q.id === questId);

        if (!hero || !quest) return;

        if (hero.status !== 'idle') {
            alert('Hero is busy!');
            return;
        }

        if (hero.level < quest.level) {
            alert(`Hero level too low! Need level ${quest.level}`);
            return;
        }

        hero.status = 'questing';
        hero.currentQuest = quest;
        hero.questEndTime = Date.now() + (quest.duration * 1000);
        this.render();
    }

    completeQuest(heroId) {
        const hero = this.state.heroes.find(h => h.id === heroId);
        if (!hero || !hero.currentQuest) return;

        const quest = hero.currentQuest;

        // Give rewards
        this.state.gold += quest.rewards.gold;

        // Add materials
        quest.rewards.materials.forEach(material => {
            const amount = Math.floor(Math.random() * 3) + 1;
            this.state.materials[material] = (this.state.materials[material] || 0) + amount;
        });

        // Give exp
        const expGained = quest.level * 10;
        hero.exp += expGained;

        // Level up check
        const expNeeded = hero.level * 50;
        if (hero.exp >= expNeeded) {
            hero.level++;
            hero.exp = 0;
            hero.maxHp += 10;
            hero.hp = hero.maxHp;
            hero.atk += 3;
            hero.def += 2;
        }

        // Reset hero
        hero.status = 'idle';
        hero.currentQuest = null;
        hero.questEndTime = null;

        this.render();
    }

    hireCrafter() {
        const typeSelect = document.getElementById('crafter-type');
        const crafterType = typeSelect.value;
        const crafterData = this.crafterTypes[crafterType];

        if (this.state.gold < crafterData.cost) {
            alert('Not enough gold!');
            return;
        }

        this.state.gold -= crafterData.cost;
        const crafter = {
            id: this.state.nextCrafterId++,
            type: crafterType,
            name: `${crafterData.name} #${this.state.nextCrafterId - 1}`,
            level: 1,
            exp: 0,
            status: 'idle',
            craftEndTime: null,
            currentRecipe: null
        };

        this.state.crafters.push(crafter);
        this.render();
    }

    craft(crafterId, recipe) {
        const crafter = this.state.crafters.find(c => c.id === crafterId);
        if (!crafter || crafter.status !== 'idle') return;

        if (crafter.level < recipe.level) {
            alert(`Crafter level too low! Need level ${recipe.level}`);
            return;
        }

        // Check materials
        for (let [material, amount] of Object.entries(recipe.materials)) {
            if ((this.state.materials[material] || 0) < amount) {
                alert(`Not enough ${material}!`);
                return;
            }
        }

        // Check inventory space
        if (this.state.inventory.length >= this.state.inventorySize) {
            alert('Inventory full!');
            return;
        }

        // Consume materials
        for (let [material, amount] of Object.entries(recipe.materials)) {
            this.state.materials[material] -= amount;
        }

        // Start crafting
        crafter.status = 'crafting';
        crafter.currentRecipe = recipe;
        crafter.craftEndTime = Date.now() + (recipe.level * 3000); // Crafting time based on level

        this.render();
    }

    completeCraft(crafterId) {
        const crafter = this.state.crafters.find(c => c.id === crafterId);
        if (!crafter || !crafter.currentRecipe) return;

        const recipe = crafter.currentRecipe;

        // Add item to inventory
        const item = {
            id: Date.now() + Math.random(),
            name: recipe.name,
            value: recipe.value,
            type: crafter.type
        };
        this.state.inventory.push(item);

        // Give exp
        crafter.exp += recipe.level * 5;
        const expNeeded = crafter.level * 30;
        if (crafter.exp >= expNeeded) {
            crafter.level++;
            crafter.exp = 0;
        }

        // Reset crafter
        crafter.status = 'idle';
        crafter.currentRecipe = null;
        crafter.craftEndTime = null;

        this.render();
    }

    sellItem(itemId) {
        const itemIndex = this.state.inventory.findIndex(i => i.id === itemId);
        if (itemIndex === -1) return;

        const item = this.state.inventory[itemIndex];
        this.state.gold += item.value;
        this.state.inventory.splice(itemIndex, 1);

        this.render();
    }

    startGameLoop() {
        setInterval(() => {
            const now = Date.now();

            // Check quest completion
            this.state.heroes.forEach(hero => {
                if (hero.status === 'questing' && hero.questEndTime && now >= hero.questEndTime) {
                    this.completeQuest(hero.id);
                }
            });

            // Check craft completion
            this.state.crafters.forEach(crafter => {
                if (crafter.status === 'crafting' && crafter.craftEndTime && now >= crafter.craftEndTime) {
                    this.completeCraft(crafter.id);
                }
            });

            this.render();
        }, 1000);
    }

    render() {
        // Update resources
        document.getElementById('gold').textContent = Math.floor(this.state.gold);
        document.getElementById('inventory-count').textContent = this.state.inventory.length;

        // Render heroes
        const heroesHtml = this.state.heroes.map(hero => {
            const classData = this.heroClasses[hero.class];
            const timeLeft = hero.questEndTime ? Math.max(0, Math.ceil((hero.questEndTime - Date.now()) / 1000)) : 0;

            return `
                <div class="hero-card">
                    <div class="hero-header">
                        <span>${classData.icon} ${hero.name}</span>
                        <span>Lv.${hero.level}</span>
                    </div>
                    <div class="hero-stats">
                        HP: ${hero.hp}/${hero.maxHp} | ATK: ${hero.atk} | DEF: ${hero.def}
                    </div>
                    <div class="hero-exp">EXP: ${hero.exp}/${hero.level * 50}</div>
                    <div class="hero-status">
                        ${hero.status === 'questing'
                            ? `⏳ ${hero.currentQuest.name} (${timeLeft}s)`
                            : '✅ Idle'}
                    </div>
                    ${hero.status === 'idle' ? `
                        <select class="quest-select" id="quest-select-${hero.id}">
                            ${this.quests.map(q =>
                                `<option value="${q.id}" ${hero.level < q.level ? 'disabled' : ''}>
                                    ${q.icon} ${q.name} (Lv.${q.level}, ${q.duration}s)
                                </option>`
                            ).join('')}
                        </select>
                        <button onclick="game.sendOnQuest(${hero.id}, parseInt(document.getElementById('quest-select-${hero.id}').value))">
                            Send on Quest
                        </button>
                    ` : ''}
                </div>
            `;
        }).join('');
        document.getElementById('heroes-list').innerHTML = heroesHtml || '<p class="empty-state">No heroes hired yet</p>';

        // Render quests info
        const questsHtml = this.quests.map(q => `
            <div class="quest-card">
                <div class="quest-header">${q.icon} ${q.name}</div>
                <div class="quest-info">Level: ${q.level} | Duration: ${q.duration}s</div>
                <div class="quest-rewards">
                    💰 ${q.rewards.gold}g | Materials: ${q.rewards.materials.join(', ')}
                </div>
            </div>
        `).join('');
        document.getElementById('quests-list').innerHTML = questsHtml;

        // Render crafters
        const craftersHtml = this.state.crafters.map(crafter => {
            const crafterData = this.crafterTypes[crafter.type];
            const timeLeft = crafter.craftEndTime ? Math.max(0, Math.ceil((crafter.craftEndTime - Date.now()) / 1000)) : 0;
            const recipes = this.recipes[crafterData.specialty];

            return `
                <div class="crafter-card">
                    <div class="crafter-header">
                        <span>${crafterData.icon} ${crafter.name}</span>
                        <span>Lv.${crafter.level}</span>
                    </div>
                    <div class="crafter-exp">EXP: ${crafter.exp}/${crafter.level * 30}</div>
                    <div class="crafter-status">
                        ${crafter.status === 'crafting'
                            ? `⏳ Crafting ${crafter.currentRecipe.name} (${timeLeft}s)`
                            : '✅ Idle'}
                    </div>
                    ${crafter.status === 'idle' ? `
                        <div class="recipes">
                            ${recipes.map(recipe => {
                                const canCraft = Object.entries(recipe.materials).every(([mat, amt]) =>
                                    (this.state.materials[mat] || 0) >= amt
                                );
                                const materialsText = Object.entries(recipe.materials)
                                    .map(([mat, amt]) => `${mat}:${this.state.materials[mat] || 0}/${amt}`)
                                    .join(', ');

                                return `
                                    <button
                                        class="recipe-btn ${!canCraft || crafter.level < recipe.level ? 'disabled' : ''}"
                                        onclick="game.craft(${crafter.id}, ${JSON.stringify(recipe).replace(/"/g, '&quot;')})"
                                        ${!canCraft || crafter.level < recipe.level ? 'disabled' : ''}
                                    >
                                        ${recipe.name} (Lv.${recipe.level})
                                        <br><small>${materialsText} → ${recipe.value}g</small>
                                    </button>
                                `;
                            }).join('')}
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
        document.getElementById('crafters-list').innerHTML = craftersHtml || '<p class="empty-state">No crafters hired yet</p>';

        // Render inventory
        const inventoryHtml = this.state.inventory.map(item => `
            <div class="item-card">
                <div class="item-name">${item.name}</div>
                <div class="item-value">💰 ${item.value}g</div>
                <button onclick="game.sellItem(${item.id})">Sell</button>
            </div>
        `).join('');
        document.getElementById('inventory-list').innerHTML = inventoryHtml || '<p class="empty-state">Inventory is empty</p>';

        // Render shop (same as inventory but different context)
        document.getElementById('shop-list').innerHTML = inventoryHtml || '<p class="empty-state">No items to sell</p>';

        // Render materials
        const materialsHtml = Object.entries(this.state.materials)
            .filter(([_, amount]) => amount > 0)
            .map(([material, amount]) => `
                <div class="material-item">
                    <span class="material-name">${material}</span>
                    <span class="material-amount">×${amount}</span>
                </div>
            `).join('');
        document.getElementById('materials-list').innerHTML = materialsHtml || '<p class="empty-state">No materials collected yet</p>';
    }

    save() {
        localStorage.setItem('merchantRPG', JSON.stringify(this.state));
        alert('Game saved!');
    }

    load() {
        const saved = localStorage.getItem('merchantRPG');
        if (saved) {
            this.state = JSON.parse(saved);
        }
    }

    reset() {
        if (confirm('Are you sure you want to reset? All progress will be lost!')) {
            localStorage.removeItem('merchantRPG');
            location.reload();
        }
    }
}

// Initialize game
const game = new MerchantGame();
