export const partyMethods = {
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
    },

    // Remove hero from party position
    removeHeroFromParty(position) {
        if (position < 0 || position >= 6) return false;

        this.state.battleParty.positions[position].heroId = null;
        this.state.battleParty.positions[position].tacticId = null;
        this.save();
        return true;
    },

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
    },

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
    },

    // Check if party is ready for battle (at least 1 hero)
    isPartyReady() {
        return this.state.battleParty.positions.some(p => p.heroId !== null);
    },

    // Check if position is in front row
    isFrontRow(position) {
        return this.state.battleParty.positions[position]?.row === 0;
    },

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
    },

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
    },

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
        const heroSelect = document.getElementById('modal-party-hero-select') as HTMLSelectElement | null;
        if (!heroSelect) return;
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
    },

    updateTacticSelection() {
        const heroSelect = document.getElementById('modal-party-hero-select') as HTMLSelectElement | null;
        const tacticSection = document.getElementById('modal-tactic-selection') as HTMLElement | null;
        const tacticSelect = document.getElementById('modal-tactic-select') as HTMLSelectElement | null;
        const tacticDesc = document.getElementById('modal-tactic-description') as HTMLElement | null;
        if (!heroSelect || !tacticSection || !tacticSelect || !tacticDesc) return;

        const heroId = parseInt(heroSelect.value);

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
        tacticSelect.onchange?.(new Event('change'));
    },

    savePartyPosition() {
        const position = this.currentPartyPosition;
        const heroSelect = document.getElementById('modal-party-hero-select') as HTMLSelectElement | null;
        const tacticSelect = document.getElementById('modal-tactic-select') as HTMLSelectElement | null;
        if (!heroSelect || !tacticSelect) return;

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
    },

    closePartyModal() {
        document.getElementById('party-modal').classList.remove('active');
        this.currentPartyPosition = null;
    }
};
