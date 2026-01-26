// Merchant RPG - MVP Version
// Using data from MerchantGameDB: https://github.com/Benzeliden/MerchantGameDB

// Import data and utilities
import {
    heroTemplates,
    questTemplates,
    tacticsLibrary,
    lootRarities,
    itemTypes,
    lootTables,
    battlePartyGrid
} from './src/data/index.js';

import {
    formatTime as utilFormatTime,
    SAVE_KEY,
    STARTING_GOLD,
    UNLOCKED_CLASSES_DEFAULT,
    EXP_PER_LEVEL_MULTIPLIER
} from './src/utils/index.js';

class MerchantRPG {
    constructor(options = {}) {
        // Options for testing
        this.skipInit = options.skipInit || false;

        // Load game data from modules
        this.heroTemplates = heroTemplates;
        this.questTemplates = questTemplates;
        this.tacticsLibrary = tacticsLibrary;
        this.lootRarities = lootRarities;
        this.itemTypes = itemTypes;
        this.lootTables = lootTables;
        this.battlePartyGrid = battlePartyGrid;

        // Skip the old inline data definitions below - now using imports

        this.nextItemId = 1; // For unique item IDs

        this.state = {
            gold: STARTING_GOLD,
            heroes: [],
            materials: {},
            inventory: [], // Loot items
            nextHeroId: 1,
            activeTab: 'heroes',
            unlockedClasses: [...UNLOCKED_CLASSES_DEFAULT], // Fighter, Wizard, Rogue start unlocked
            battleParty: {
                positions: [
                    // Front row (row 0)
                    { row: 0, col: 0, heroId: null, tacticId: null },
                    { row: 0, col: 1, heroId: null, tacticId: null },
                    { row: 0, col: 2, heroId: null, tacticId: null },
                    // Back row (row 1)
                    { row: 1, col: 0, heroId: null, tacticId: null },
                    { row: 1, col: 1, heroId: null, tacticId: null },
                    { row: 1, col: 2, heroId: null, tacticId: null }
                ]
            }
        };

        this.currentQuest = null; // For modal
        this.lastUnlockedClasses = []; // Track for dropdown updates (empty to force initial render)

        this.load();
        this.updateGameState(); // Process any completed quests from offline time

        // Skip rendering and game loop in test environment
        if (!this.skipInit) {
            this.render();
            this.startGameLoop();
        }
    }

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
    }

    checkUnlockRequirement(classIndex) {
        const template = this.heroTemplates[classIndex];

        switch(template.name) {
            case "Cleric":
                // Requires Wizard Lv.15
                return this.state.heroes.some(h => h.classIndex === 1 && h.level >= 15);

            case "Ranger":
                // Requires Rogue Lv.15
                return this.state.heroes.some(h => h.classIndex === 2 && h.level >= 15);

            case "Barbarian":
                // Requires Fighter Lv.15
                return this.state.heroes.some(h => h.classIndex === 0 && h.level >= 15);

            case "Paladin":
                // Requires Fighter Lv.30 + Cleric Lv.15
                const hasFighter30 = this.state.heroes.some(h => h.classIndex === 0 && h.level >= 30);
                const hasCleric15 = this.state.heroes.some(h => h.classIndex === 3 && h.level >= 15);
                return hasFighter30 && hasCleric15;

            case "Warlock":
                // Requires Wizard Lv.30
                return this.state.heroes.some(h => h.classIndex === 1 && h.level >= 30);

            case "Monk":
                // Requires Fighter Lv.20 + Rogue Lv.15
                const hasFighter20 = this.state.heroes.some(h => h.classIndex === 0 && h.level >= 20);
                const hasRogue15 = this.state.heroes.some(h => h.classIndex === 2 && h.level >= 15);
                return hasFighter20 && hasRogue15;

            case "Bard":
                // Requires 3 heroes at Lv.20+
                const level20Heroes = this.state.heroes.filter(h => h.level >= 20);
                return level20Heroes.length >= 3;

            default:
                return false;
        }
    }

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
            unlockedTactics: [] // Initialize empty tactics array
        };

        this.state.heroes.push(hero);

        // Unlock tactics for new hero
        this.checkTacticUnlocks(hero);

        return hero;
    }

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
    }

    // === Quest System ===
    openQuestModal(questId) {
        const quest = this.questTemplates.find(q => q.id === questId);
        if (!quest) return;

        this.currentQuest = quest;

        // Update modal content
        document.getElementById('modal-quest-name').textContent = quest.name;

        const detailsHtml = `
            <div class="quest-details">
                <p class="quest-desc">${quest.desc}</p>
                <div class="quest-stats">
                    <div class="stat">⏱️ Duration: ${this.formatTime(quest.duration)}</div>
                    <div class="stat">📊 Level Required: ${quest.level}</div>
                    <div class="stat">💰 Reward: ${quest.gold}g</div>
                    <div class="stat">⭐ EXP: ${quest.exp}</div>
                </div>
                <div class="quest-materials">
                    <strong>Materials:</strong>
                    ${quest.materials.map((m, i) => `<span class="material-chip">${m} ×${quest.materialCount[i]}</span>`).join('')}
                </div>
            </div>
        `;
        document.getElementById('modal-quest-details').innerHTML = detailsHtml;

        // Populate hero selection
        const heroSelect = document.getElementById('modal-hero-select');
        const idleHeroes = this.state.heroes.filter(h => h.status === 'idle');

        if (idleHeroes.length === 0) {
            heroSelect.innerHTML = '<option>No heroes available</option>';
        } else {
            heroSelect.innerHTML = idleHeroes.map(hero => {
                const canQuest = hero.level >= quest.level;
                return `<option value="${hero.id}" ${!canQuest ? 'disabled' : ''}>
                    ${hero.name} (Lv.${hero.level}) ${!canQuest ? '- Too low level!' : ''}
                </option>`;
            }).join('');
        }

        // Show modal
        document.getElementById('quest-modal').classList.add('active');
    }

    closeQuestModal() {
        document.getElementById('quest-modal').classList.remove('active');
        this.currentQuest = null;
    }

    startQuest() {
        if (!this.currentQuest) return;

        const heroSelect = document.getElementById('modal-hero-select');
        const heroId = parseInt(heroSelect.value);
        const hero = this.state.heroes.find(h => h.id === heroId);

        if (!hero || hero.status !== 'idle') {
            alert('Hero not available!');
            return;
        }

        if (hero.level < this.currentQuest.level) {
            alert(`Hero level too low! Need level ${this.currentQuest.level}`);
            return;
        }

        // Start the quest
        hero.status = 'questing';
        hero.questId = this.currentQuest.id;
        hero.questStartTime = Date.now();
        hero.questDuration = this.currentQuest.duration;

        this.closeQuestModal();
        this.save();
        this.render();
    }

    completeQuest(hero) {
        const quest = this.questTemplates.find(q => q.id === hero.questId);
        if (!quest) return;

        // Reward gold
        this.state.gold += quest.gold;

        // Reward materials
        quest.materials.forEach((material, index) => {
            const amount = quest.materialCount[index];
            if (!this.state.materials[material]) {
                this.state.materials[material] = 0;
            }
            this.state.materials[material] += amount;
        });

        // Generate and add loot to inventory
        const loot = this.generateQuestLoot(hero.questId);
        if (!this.state.inventory) {
            this.state.inventory = [];
        }
        this.state.inventory.push(...loot);

        // Reward EXP
        this.giveExp(hero, quest.exp);

        // Reset hero
        hero.status = 'idle';
        hero.questId = null;
        hero.questStartTime = null;
        hero.questDuration = null;

        this.save();
        if (!this.skipInit) {
            this.render();
        }
    }

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
    }

    getExpForLevel(level) {
        return level * EXP_PER_LEVEL_MULTIPLIER;
    }

    // === Loot System Functions ===
    getDropRate(rarity) {
        return this.lootRarities[rarity]?.dropRate || 0;
    }

    rollForDrop(rarity) {
        const dropRate = this.getDropRate(rarity);
        return Math.random() <= dropRate;
    }

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
    }

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
    }

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

    // === Battle Party System Functions ===

    // Add hero to specific party position
    addHeroToParty(heroId, position) {
        if (position < 0 || position >= 6) return false;

        const hero = this.state.heroes.find(h => h.id === heroId);
        if (!hero) return false;

        // Check if hero already in party
        const alreadyInParty = this.state.battleParty.positions.some(p => p.heroId === heroId);
        if (alreadyInParty) return false;

        // Check if position is occupied
        if (this.state.battleParty.positions[position].heroId !== null) return false;

        // Add hero to position
        this.state.battleParty.positions[position].heroId = heroId;
        this.save();
        return true;
    }

    // Remove hero from party position
    removeHeroFromParty(position) {
        if (position < 0 || position >= 6) return false;

        this.state.battleParty.positions[position].heroId = null;
        this.state.battleParty.positions[position].tacticId = null;
        this.save();
        return true;
    }

    // Swap heroes between two positions
    swapPartyPositions(pos1, pos2) {
        if (pos1 < 0 || pos1 >= 6 || pos2 < 0 || pos2 >= 6) return false;

        const temp = { ...this.state.battleParty.positions[pos1] };
        this.state.battleParty.positions[pos1].heroId = this.state.battleParty.positions[pos2].heroId;
        this.state.battleParty.positions[pos1].tacticId = this.state.battleParty.positions[pos2].tacticId;
        this.state.battleParty.positions[pos2].heroId = temp.heroId;
        this.state.battleParty.positions[pos2].tacticId = temp.tacticId;

        this.save();
        return true;
    }

    // Get list of heroes currently in party
    getPartyHeroes() {
        const partyHeroes = [];
        this.state.battleParty.positions.forEach(pos => {
            if (pos.heroId !== null) {
                const hero = this.state.heroes.find(h => h.id === pos.heroId);
                if (hero) partyHeroes.push(hero);
            }
        });
        return partyHeroes;
    }

    // Check if party is ready for battle (at least 1 hero)
    isPartyReady() {
        return this.state.battleParty.positions.some(p => p.heroId !== null);
    }

    // Check if position is in front row
    isFrontRow(position) {
        return this.state.battleParty.positions[position]?.row === 0;
    }

    // Get warnings about suboptimal party positioning
    getPartyWarnings() {
        const warnings = [];

        this.state.battleParty.positions.forEach((pos, index) => {
            if (pos.heroId === null || pos.tacticId === null) return;

            const hero = this.state.heroes.find(h => h.id === pos.heroId);
            if (!hero) return;

            const tactic = this.getActiveTactic(index);
            if (!tactic) return;

            // Check row preference mismatch
            const isFront = pos.row === 0;
            if (tactic.effects.rowPreference === 'front' && !isFront) {
                warnings.push({
                    position: index,
                    message: `${hero.name} prefers front row with ${tactic.name} tactic`
                });
            } else if (tactic.effects.rowPreference === 'back' && isFront) {
                warnings.push({
                    position: index,
                    message: `${hero.name} prefers back row with ${tactic.name} tactic`
                });
            }
        });

        return warnings;
    }

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
    }

    // Get all available (unlocked) tactics for a hero
    getAvailableTactics(hero) {
        if (!hero.unlockedTactics) return [];

        const className = this.heroTemplates[hero.classIndex].name.toLowerCase();
        const classTactics = this.tacticsLibrary[className] || [];

        return classTactics.filter(tactic => hero.unlockedTactics.includes(tactic.id));
    }

    // Check if hero can use specific tactic
    canUseTactic(hero, tacticId) {
        return hero.unlockedTactics && hero.unlockedTactics.includes(tacticId);
    }

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
    }

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

    // === Game Loop ===
    updateGameState() {
        const now = Date.now();

        this.state.heroes.forEach(hero => {
            if (hero.status === 'questing' && hero.questStartTime && hero.questDuration) {
                const elapsed = (now - hero.questStartTime) / 1000; // seconds

                if (elapsed >= hero.questDuration) {
                    // Quest completed while offline!
                    this.completeQuest(hero);
                }
            }
        });
    }

    startGameLoop() {
        setInterval(() => {
            this.updateGameState();
            this.render();
        }, 1000);
    }

    // === Tab Management ===
    switchTab(tabName) {
        this.state.activeTab = tabName;

        // Update tab buttons
        document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
        event.target.closest('.tab').classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(`${tabName}-tab`).classList.add('active');

        this.render();
    }

    // === Rendering ===
    render() {
        // Update gold
        document.getElementById('gold').textContent = Math.floor(this.state.gold);
        document.getElementById('hero-count').textContent = this.state.heroes.length;

        // Render based on active tab
        if (this.state.activeTab === 'heroes') {
            this.renderHeroes();
        } else if (this.state.activeTab === 'party') {
            this.renderParty();
        } else if (this.state.activeTab === 'quests') {
            this.renderQuests();
        } else if (this.state.activeTab === 'materials') {
            this.renderMaterials();
        }
    }

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
    }

    renderQuests() {
        const questsListElement = document.getElementById('quests-list');

        const questsHtml = this.questTemplates.map(quest => {
            return `
                <div class="quest-card" onclick="game.openQuestModal(${quest.id})">
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
    }

    renderMaterials() {
        const materialsListElement = document.getElementById('materials-list');
        const materials = Object.entries(this.state.materials).filter(([_, count]) => count > 0);

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
    }

    renderParty() {
        // Render grid positions
        this.state.battleParty.positions.forEach((pos, index) => {
            const posElement = document.querySelector(`[data-position="${index}"]`);
            if (!posElement) return;

            if (pos.heroId === null) {
                // Empty position
                posElement.innerHTML = '<div class="empty-slot">Empty</div>';
                posElement.classList.remove('filled');
            } else {
                // Filled position
                const hero = this.state.heroes.find(h => h.id === pos.heroId);
                if (!hero) return;

                const template = this.heroTemplates[hero.classIndex];
                const tactic = this.getActiveTactic(index);

                posElement.classList.add('filled');
                posElement.innerHTML = `
                    <div class="position-hero-name">${hero.name}</div>
                    <div class="position-hero-class">${template.name} Lv.${hero.level}</div>
                    ${tactic ? `<div class="position-tactic ${tactic.category}">${tactic.name}</div>` : '<div class="position-tactic">No tactic</div>'}
                `;
            }
        });

        // Render warnings
        const warnings = this.getPartyWarnings();
        const warningsElement = document.getElementById('party-warnings');
        if (warnings.length === 0) {
            warningsElement.innerHTML = '';
        } else {
            warningsElement.innerHTML = warnings.map(w =>
                `<div class="party-warning">⚠️ ${w.message}</div>`
            ).join('');
        }
    }

    // Party Modal Management
    openPartyPositionModal(position) {
        this.currentPartyPosition = position;
        const pos = this.state.battleParty.positions[position];
        const row = pos.row === 0 ? 'Front Row' : 'Back Row';
        const col = pos.col + 1;

        document.getElementById('modal-position-title').textContent = `${row} - Position ${col}`;
        document.getElementById('modal-position-info').textContent =
            `Configure hero and tactic for this position. ${row === 'Front Row' ? 'Front row heroes engage enemies directly.' : 'Back row heroes provide ranged support.'}`;

        // Populate hero select
        const heroSelect = document.getElementById('modal-party-hero-select');
        const availableHeroes = this.state.heroes.filter(h => {
            // Hero is either in this position, or not in any position
            return h.status === 'idle' && (
                pos.heroId === h.id ||
                !this.state.battleParty.positions.some(p => p.heroId === h.id)
            );
        });

        heroSelect.innerHTML = '<option value="">- Remove Hero -</option>' +
            availableHeroes.map(hero => {
                const template = this.heroTemplates[hero.classIndex];
                return `<option value="${hero.id}" ${pos.heroId === hero.id ? 'selected' : ''}>
                    ${hero.name} (${template.name} Lv.${hero.level})
                </option>`;
            }).join('');

        // Handle hero selection change
        heroSelect.onchange = () => {
            this.updateTacticSelection();
        };

        // Initial tactic update
        this.updateTacticSelection();

        // Show modal
        document.getElementById('party-modal').classList.add('active');
    }

    updateTacticSelection() {
        const heroSelect = document.getElementById('modal-party-hero-select');
        const heroId = parseInt(heroSelect.value);
        const tacticSection = document.getElementById('modal-tactic-selection');
        const tacticSelect = document.getElementById('modal-tactic-select');
        const tacticDesc = document.getElementById('modal-tactic-description');

        if (!heroId) {
            tacticSection.style.display = 'none';
            return;
        }

        const hero = this.state.heroes.find(h => h.id === heroId);
        if (!hero) return;

        tacticSection.style.display = 'block';

        // Get available tactics
        const tactics = this.getAvailableTactics(hero);
        const pos = this.state.battleParty.positions[this.currentPartyPosition];

        tacticSelect.innerHTML = '<option value="">- No Tactic -</option>' +
            tactics.map(tactic =>
                `<option value="${tactic.id}" ${pos.tacticId === tactic.id ? 'selected' : ''}>
                    ${tactic.name} (Lv.${tactic.unlockLevel})
                </option>`
            ).join('');

        // Show tactic description on selection
        tacticSelect.onchange = () => {
            const tacticId = tacticSelect.value;
            if (!tacticId) {
                tacticDesc.innerHTML = '';
                return;
            }

            const tactic = tactics.find(t => t.id === tacticId);
            if (!tactic) return;

            tacticDesc.innerHTML = `
                <div><span class="tactic-category ${tactic.category}">${tactic.category.toUpperCase()}</span></div>
                <div style="margin-top: 8px;">${tactic.description}</div>
            `;
        };

        // Trigger initial description update
        tacticSelect.onchange();
    }

    savePartyPosition() {
        const position = this.currentPartyPosition;
        const heroSelect = document.getElementById('modal-party-hero-select');
        const tacticSelect = document.getElementById('modal-tactic-select');

        const heroId = parseInt(heroSelect.value) || null;
        const tacticId = tacticSelect.value || null;

        // Remove hero from this position if empty
        if (heroId === null) {
            this.removeHeroFromParty(position);
        } else {
            // Remove hero from any other position first
            this.state.battleParty.positions.forEach((p, i) => {
                if (p.heroId === heroId && i !== position) {
                    this.removeHeroFromParty(i);
                }
            });

            // Add to this position
            this.addHeroToParty(heroId, position);

            // Assign tactic if selected
            if (tacticId) {
                this.assignTacticToPartyHero(position, tacticId);
            } else {
                this.state.battleParty.positions[position].tacticId = null;
            }
        }

        this.save();
        this.closePartyModal();
        this.render();
    }

    closePartyModal() {
        document.getElementById('party-modal').classList.remove('active');
        this.currentPartyPosition = null;
    }

    // === Utilities ===
    formatTime(seconds) {
        return utilFormatTime(seconds);
    }

    // === Save/Load ===
    save() {
        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify(this.state));
        } catch (e) {
            console.error('Failed to save game:', e);
        }
    }

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
                    });
                }
            }
        } catch (e) {
            console.error('Failed to load game:', e);
        }
    }

    reset() {
        if (confirm('Are you sure you want to reset all progress? This cannot be undone!')) {
            localStorage.removeItem(SAVE_KEY);
            location.reload();
        }
    }
}

// Initialize game when page loads (browser only)
let game;
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        game = new MerchantRPG();
    });
}

// Export for testing (Node.js/Vitest) - CommonJS only
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MerchantRPG };
}
