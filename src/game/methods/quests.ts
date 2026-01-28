export const questMethods = {
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
    },

    closeQuestModal() {
        document.getElementById('quest-modal').classList.remove('active');
        this.currentQuest = null;
    },

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
    },

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
};
