// Merchant RPG - MVP Version
// Using data from MerchantGameDB: https://github.com/Benzeliden/MerchantGameDB

class MerchantRPG {
    constructor(options = {}) {
        // Options for testing
        this.skipInit = options.skipInit || false;

        // Hero templates from HeroList.json (all 9 classes)
        this.heroTemplates = [
            {
                class: 1, name: "Warrior", hp: 100, atk: 5, def: 14, mdef: 8, crit: 1,
                hpPlv: [10, 15, 20], atkPlv: [0.4, 1, 1.4], defPlv: [1.2, 1.8, 2.5],
                desc1: "A strong tank with", desc2: "high defense",
                icon: "images/heroes/Icn_Hero_Warrior.png",
                unlocked: true, cost: 100
            },
            {
                class: 2, name: "Rogue", hp: 90, atk: 5, def: 9, mdef: 8, crit: 5,
                hpPlv: [8, 12, 14], atkPlv: [0.6, 1.2, 1.8], defPlv: [0.5, 1, 1.5],
                desc1: "A nimble fighter with", desc2: "high accuracy",
                icon: "images/heroes/Icn_Hero_Rogue.png",
                unlocked: true, cost: 100
            },
            {
                class: 3, name: "Mage", hp: 80, atk: 1, def: 7, mdef: 10, crit: 1, matk: 5,
                hpPlv: [7, 11, 14], atkPlv: [0.1, 0.2, 0.3], defPlv: [0.4, 0.8, 1.2],
                desc1: "A powerful wizard with", desc2: "high magic attack",
                icon: "images/heroes/Icn_Hero_Mage.png",
                unlocked: true, cost: 100
            },
            {
                class: 4, name: "Berserker", hp: 90, atk: 5, def: 10, mdef: 7, crit: 1,
                hpPlv: [8, 12, 16], atkPlv: [0.9, 1.8, 2.4], defPlv: [0.5, 1, 1.5],
                desc1: "A mighty warrior with", desc2: "high attack",
                icon: "images/heroes/Icn_Hero_Berserker.png",
                unlocked: false, cost: 150,
                unlockReq: "Requires Warrior Lv.15"
            },
            {
                class: 5, name: "Cleric", hp: 80, atk: 1, def: 7, mdef: 10, crit: 1, matk: 5,
                hpPlv: [7, 11, 14], atkPlv: [0.1, 0.2, 0.3], defPlv: [0.4, 0.8, 1.2],
                desc1: "A wise priest with", desc2: "high accuracy",
                icon: "images/heroes/Icn_Hero_Cleric.png",
                unlocked: false, cost: 150,
                unlockReq: "Requires Mage Lv.15"
            },
            {
                class: 6, name: "Assassin", hp: 90, atk: 5, def: 9, mdef: 8, crit: 10,
                hpPlv: [8, 12, 16], atkPlv: [0.5, 1, 1.6], defPlv: [0.5, 1, 1.5],
                desc1: "A deadly ninja with", desc2: "high crit",
                icon: "images/heroes/Icn_Hero_Assassin.png",
                unlocked: false, cost: 150,
                unlockReq: "Requires Rogue Lv.15"
            },
            {
                class: 7, name: "Paladin", hp: 100, atk: 3, def: 8, mdef: 14, crit: 1, matk: 3,
                hpPlv: [10, 15, 20], atkPlv: [0.3, 0.6, 0.9], defPlv: [0.4, 0.8, 1.2],
                desc1: "A sturdy tank with", desc2: "high magic defense",
                icon: "images/heroes/Icn_Hero_Paladin.png",
                unlocked: false, cost: 250,
                unlockReq: "Requires Warrior Lv.30 + Cleric Lv.15"
            },
            {
                class: 8, name: "Dark Knight", hp: 80, atk: 3, def: 10, mdef: 9, crit: 1, matk: 3,
                hpPlv: [7, 11, 15], atkPlv: [0.4, 0.9, 1.4], defPlv: [0.4, 0.8, 1.2],
                desc1: "A powerful warlock", desc2: "with high damage",
                icon: "images/heroes/Icn_Hero_Dark_Knight.png",
                unlocked: false, cost: 250,
                unlockReq: "Requires Mage Lv.30 + Berserker Lv.15"
            },
            {
                class: 9, name: "Bard", hp: 60, atk: 2, def: 6, mdef: 6, crit: 1, matk: 2,
                hpPlv: [7, 10, 13], atkPlv: [0.3, 0.6, 0.9], defPlv: [0.2, 0.4, 1],
                desc1: "A chronicler", desc2: "of adventures",
                icon: "images/heroes/Icn_Hero_Bard.png",
                unlocked: false, cost: 300,
                unlockReq: "Requires 3 heroes at Lv.20+"
            }
        ];

        // Quest templates from MapList.json (first 6 maps, simplified for MVP)
        this.questTemplates = [
            {
                id: 1, name: "Tuvale Map", desc: "Basic Forest Dungeon",
                duration: 30, level: 1, gold: 50, exp: 25,
                materials: ["Wood", "Herbs"], materialCount: [2, 3]
            },
            {
                id: 2, name: "Hard Tuvale Map", desc: "Hard Forest Dungeon",
                duration: 60, level: 3, gold: 100, exp: 50,
                materials: ["Wood", "Iron Ore", "Herbs"], materialCount: [3, 2, 4]
            },
            {
                id: 3, name: "Yarsol Map", desc: "Basic Cove Dungeon",
                duration: 90, level: 10, gold: 200, exp: 100,
                materials: ["Fish", "Shells", "Coral"], materialCount: [4, 2, 1]
            },
            {
                id: 4, name: "Hard Yarsol Map", desc: "Hard Cove Dungeon",
                duration: 120, level: 16, gold: 400, exp: 200,
                materials: ["Fish", "Pearls", "Shells"], materialCount: [5, 1, 3]
            },
            {
                id: 5, name: "Aldur Map", desc: "Basic Highlands Dungeon",
                duration: 150, level: 20, gold: 600, exp: 300,
                materials: ["Stone", "Gems", "Ore"], materialCount: [6, 2, 3]
            },
            {
                id: 6, name: "Hard Aldur Map", desc: "Hard Highlands Dungeon",
                duration: 180, level: 26, gold: 1000, exp: 500,
                materials: ["Gems", "Crystals", "Stone"], materialCount: [4, 2, 5]
            }
        ];

        this.state = {
            gold: 1000,  // Starting gold for testing
            heroes: [],
            materials: {},
            nextHeroId: 1,
            activeTab: 'heroes',
            unlockedClasses: [0, 1, 2] // Warrior, Rogue, Mage start unlocked
        };

        this.currentQuest = null; // For modal

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
            case "Berserker":
                // Requires Warrior Lv.15
                return this.state.heroes.some(h => h.classIndex === 0 && h.level >= 15);

            case "Cleric":
                // Requires Mage Lv.15
                return this.state.heroes.some(h => h.classIndex === 2 && h.level >= 15);

            case "Assassin":
                // Requires Rogue Lv.15
                return this.state.heroes.some(h => h.classIndex === 1 && h.level >= 15);

            case "Paladin":
                // Requires Warrior Lv.30 + Cleric Lv.15
                const hasWarrior30 = this.state.heroes.some(h => h.classIndex === 0 && h.level >= 30);
                const hasCleric15 = this.state.heroes.some(h => h.classIndex === 4 && h.level >= 15);
                return hasWarrior30 && hasCleric15;

            case "Dark Knight":
                // Requires Mage Lv.30 + Berserker Lv.15
                const hasMage30 = this.state.heroes.some(h => h.classIndex === 2 && h.level >= 30);
                const hasBerserker15 = this.state.heroes.some(h => h.classIndex === 3 && h.level >= 15);
                return hasMage30 && hasBerserker15;

            case "Bard":
                // Requires 3 heroes at Lv.20+
                const level20Heroes = this.state.heroes.filter(h => h.level >= 20);
                return level20Heroes.length >= 3;

            default:
                return false;
        }
    }

    // === Hero Management ===
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
            questDuration: null
        };

        this.state.gold -= cost;
        this.state.heroes.push(hero);
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

        // Reward EXP
        this.giveExp(hero, quest.exp);

        // Reset hero
        hero.status = 'idle';
        hero.questId = null;
        hero.questStartTime = null;
        hero.questDuration = null;

        this.save();
        this.render();
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

        // Check for hero unlocks after leveling
        if (leveledUp) {
            this.checkHeroUnlocks();
        }
    }

    getExpForLevel(level) {
        return level * 100; // Simple formula: need 100/200/300... exp per level
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
        } else if (this.state.activeTab === 'quests') {
            this.renderQuests();
        } else if (this.state.activeTab === 'materials') {
            this.renderMaterials();
        }
    }

    renderHeroes() {
        // Render hero class select dropdown
        const heroClassSelect = document.getElementById('hero-class-select');
        if (heroClassSelect) {
            heroClassSelect.innerHTML = this.heroTemplates.map((template, index) => {
                const isUnlocked = this.state.unlockedClasses.includes(index);
                if (isUnlocked) {
                    return `<option value="${index}">${template.name} - ${template.cost}g</option>`;
                } else {
                    return `<option value="${index}" disabled>🔒 ${template.name} - ${template.unlockReq}</option>`;
                }
            }).join('');
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

    // === Utilities ===
    formatTime(seconds) {
        if (seconds < 60) {
            return `${Math.floor(seconds)}s`;
        } else if (seconds < 3600) {
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${mins}m ${secs}s`;
        } else {
            const hours = Math.floor(seconds / 3600);
            const mins = Math.floor((seconds % 3600) / 60);
            return `${hours}h ${mins}m`;
        }
    }

    // === Save/Load ===
    save() {
        try {
            localStorage.setItem('merchantRPG_v2', JSON.stringify(this.state));
        } catch (e) {
            console.error('Failed to save game:', e);
        }
    }

    load() {
        try {
            const saved = localStorage.getItem('merchantRPG_v2');
            if (saved) {
                const loadedState = JSON.parse(saved);
                // Merge with defaults to handle new properties
                this.state = { ...this.state, ...loadedState };
            }
        } catch (e) {
            console.error('Failed to load game:', e);
        }
    }

    reset() {
        if (confirm('Are you sure you want to reset all progress? This cannot be undone!')) {
            localStorage.removeItem('merchantRPG_v2');
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

// Export for testing (Node.js/Vitest)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MerchantRPG };
}

// ES6 export for modern environments
export { MerchantRPG };
