const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const adventureMethods = {
    startAdventureFromForm(adventureId) {
        const draft = this.state.adventureDrafts?.[adventureId];
        const selectedHeroes = draft?.heroIds?.length
            ? draft.heroIds
            : Array.from(document.querySelectorAll(`[data-adventure-id="${adventureId}"][data-adventure-hero]`))
                .filter((input: HTMLInputElement) => input.checked)
                .map((input: HTMLInputElement) => Number(input.dataset.adventureHero));

        if (selectedHeroes.length === 0) {
            alert('Select at least one hero.');
            return;
        }

        const potions = draft?.resources?.potions ?? Number((document.querySelector(`[data-adventure-id="${adventureId}"][data-adventure-resource="potions"]`) as HTMLInputElement | null)?.value || 0);
        const food = draft?.resources?.food ?? Number((document.querySelector(`[data-adventure-id="${adventureId}"][data-adventure-resource="food"]`) as HTMLInputElement | null)?.value || 0);
        const gold = draft?.resources?.gold ?? Number((document.querySelector(`[data-adventure-id="${adventureId}"][data-adventure-resource="gold"]`) as HTMLInputElement | null)?.value || 0);
        const risk = draft?.riskTolerance ?? Number((document.querySelector(`[data-adventure-id="${adventureId}"][data-adventure-resource="risk"]`) as HTMLInputElement | null)?.value || 0.4);

        this.startAdventure({
            adventureId,
            heroIds: selectedHeroes,
            resources: { potions, food, gold },
            riskTolerance: risk
        });
    },

    updateAdventureDraftHero(adventureId, heroId, checked) {
        if (!this.state.adventureDrafts) {
            this.state.adventureDrafts = {};
        }
        if (!this.state.adventureDrafts[adventureId]) {
            this.state.adventureDrafts[adventureId] = { heroIds: [], resources: {}, riskTolerance: 0.4 };
        }
        const draft = this.state.adventureDrafts[adventureId];
        const heroIds = new Set(draft.heroIds || []);
        if (checked) {
            heroIds.add(heroId);
        } else {
            heroIds.delete(heroId);
        }
        draft.heroIds = Array.from(heroIds);
        this.save();
    },

    updateAdventureDraftResource(adventureId, resource, value) {
        if (!this.state.adventureDrafts) {
            this.state.adventureDrafts = {};
        }
        if (!this.state.adventureDrafts[adventureId]) {
            this.state.adventureDrafts[adventureId] = { heroIds: [], resources: {}, riskTolerance: 0.4 };
        }
        const draft = this.state.adventureDrafts[adventureId];
        if (resource === 'risk') {
            draft.riskTolerance = value;
        } else {
            if (!draft.resources) draft.resources = {};
            draft.resources[resource] = value;
        }
        this.save();
    },

    startAdventure({ adventureId, heroIds, resources, riskTolerance }) {
        if (this.state.adventure?.active) {
            alert('An adventure is already in progress.');
            return;
        }

        const adventure = this.adventureTemplates.find(a => a.id === adventureId);
        if (!adventure) return;

        const partyHeroes = heroIds.map(id => this.state.heroes.find(h => h.id === id)).filter(Boolean);
        if (partyHeroes.length === 0) return;

        const idleHeroes = partyHeroes.filter(h => h.status === 'idle');
        if (idleHeroes.length !== partyHeroes.length) {
            alert('All heroes must be idle to start an adventure.');
            return;
        }

        const requestedPotions = resources?.potions || 0;
        const requestedFood = resources?.food || 0;
        const requestedGold = resources?.gold || 0;

        const potions = this.takeInventoryItems('potion', requestedPotions);
        const food = this.takeInventoryItems('food', requestedFood);

        if (potions.taken < requestedPotions || food.taken < requestedFood) {
            potions.returnItems();
            food.returnItems();
            alert('Not enough supplies in inventory.');
            return;
        }

        if (this.state.gold < requestedGold) {
            potions.returnItems();
            food.returnItems();
            alert(`Not enough gold! Need ${requestedGold}g`);
            return;
        }

        this.state.gold -= requestedGold;

        partyHeroes.forEach(hero => {
            hero.status = 'adventuring';
        });

        this.state.adventure = {
            active: true,
            adventureId: adventure.id,
            partyHeroIds: partyHeroes.map(h => h.id),
            resources: {
                potions: requestedPotions,
                food: requestedFood,
                gold: requestedGold
            },
            riskTolerance: riskTolerance ?? 0.4,
            tick: 0,
            ticksToGoal: adventure.ticksToGoal,
            goalType: adventure.goalType,
            outcome: null,
            lastEvent: null,
            log: [
                {
                    type: 'status',
                    message: `Adventure started: ${adventure.name} (Goal: ${adventure.goalType}).`
                }
            ],
            logFilters: this.state.adventure?.logFilters || {
                battle: true,
                encounter: true,
                opportunity: true,
                resource: true,
                status: true
            }
        };

        this.save();
        this.render();
    },

    tickAdventure() {
        const adventureState = this.state.adventure;
        if (!adventureState?.active) return;

        if (this.shouldRetreat(adventureState)) {
            this.endAdventure('retreat');
            return;
        }

        adventureState.tick += 1;
        this.logAdventure(adventureState, 'status', `Tick ${adventureState.tick} begins.`);
        this.consumeAdventureFood(adventureState);

        let eventType = this.rollAdventureEvent(adventureState);
        if (adventureState.goalType === 'boss' && adventureState.tick >= adventureState.ticksToGoal) {
            eventType = 'boss';
        }

        this.resolveAdventureEvent(eventType, adventureState);

        if (!adventureState.active) return;

        if (adventureState.goalType === 'town' && adventureState.tick >= adventureState.ticksToGoal) {
            this.endAdventure('success');
            return;
        }

        if (adventureState.goalType === 'boss' && adventureState.tick >= adventureState.ticksToGoal) {
            if (eventType !== 'boss') {
                this.resolveAdventureEvent('boss', adventureState);
            }
            if (adventureState.active) {
                this.endAdventure('success');
            }
        }

        this.save();
        this.render();
    },

    shouldRetreat(adventureState) {
        const confidence = this.getAdventureConfidence(adventureState);
        return confidence < adventureState.riskTolerance;
    },

    getAdventureConfidence(adventureState) {
        const heroes = adventureState.partyHeroIds
            .map(id => this.state.heroes.find(h => h.id === id))
            .filter(Boolean);

        if (heroes.length === 0) return 0;

        const avgHp = heroes.reduce((sum, hero) => sum + (hero.hp / hero.maxHp), 0) / heroes.length;
        const avgLevel = heroes.reduce((sum, hero) => sum + hero.level, 0) / heroes.length;
        const equipmentBonus = heroes.reduce((sum, hero) => {
            const weaponAtk = hero.equipment?.weapon?.stats?.attack || 0;
            const armorDef = hero.equipment?.armor?.stats?.defense || 0;
            return sum + weaponAtk + armorDef;
        }, 0);

        const levelScore = clamp(avgLevel / 30, 0, 1);
        const resourceScore = (adventureState.resources.food > 0 ? 0.1 : -0.2) + (adventureState.resources.potions > 0 ? 0.1 : -0.1);
        const equipmentScore = clamp(equipmentBonus / 100, 0, 0.2);

        return clamp(0.5 * avgHp + 0.3 * levelScore + 0.2 + resourceScore + equipmentScore, 0, 1);
    },

    consumeAdventureFood(adventureState) {
        if (adventureState.resources.food > 0) {
            adventureState.resources.food -= 1;
            this.logAdventure(adventureState, 'resource', 'The party consumes 1 food.');
            return;
        }

        const heroes = adventureState.partyHeroIds
            .map(id => this.state.heroes.find(h => h.id === id))
            .filter(Boolean);

        heroes.forEach(hero => {
            hero.hp = Math.max(1, hero.hp - Math.ceil(hero.maxHp * 0.05));
        });
        this.logAdventure(adventureState, 'resource', 'Supplies are low. The party loses some health.');
    },

    rollAdventureEvent(adventureState) {
        const adventure = this.adventureTemplates.find(a => a.id === adventureState.adventureId);
        const weights = adventure?.eventWeights || { battle: 0.5, encounter: 0.3, opportunity: 0.2 };
        const roll = Math.random();
        const battleWeight = weights.battle ?? 0;
        const encounterWeight = weights.encounter ?? 0;
        if (roll < battleWeight) return 'battle';
        if (roll < battleWeight + encounterWeight) return 'encounter';
        return 'opportunity';
    },

    resolveAdventureEvent(eventType, adventureState) {
        adventureState.lastEvent = eventType;
        this.logAdventure(adventureState, eventType, `Event: ${eventType}.`);

        if (eventType === 'opportunity') {
            if (Math.random() > 0.6) {
                this.awardAdventureLoot();
                this.logAdventure(adventureState, 'opportunity', 'Found equipment during the opportunity.');
            }
            return;
        }

        if (eventType === 'encounter') {
            if (Math.random() > 0.7 && adventureState.resources.gold > 0) {
                adventureState.resources.gold = Math.max(0, adventureState.resources.gold - 10);
                this.logAdventure(adventureState, 'encounter', 'Encounter cost the party 10 gold.');
            }
            return;
        }

        const heroes = adventureState.partyHeroIds
            .map(id => this.state.heroes.find(h => h.id === id))
            .filter(Boolean);

        if (heroes.length === 0) {
            this.endAdventure('defeat');
            return;
        }

        const avgLevel = heroes.reduce((sum, hero) => sum + hero.level, 0) / heroes.length;
        const partyPower = heroes.reduce((sum, hero) => sum + hero.atk + hero.def, 0) + avgLevel * 2;
        const difficulty = this.adventureTemplates.find(a => a.id === adventureState.adventureId)?.difficulty || 1;
        const enemyPower = difficulty * 25 * (0.8 + Math.random() * 0.4);

        const roll = Math.random() * (1 + avgLevel / 20);
        const success = partyPower * (0.75 + roll * 0.25) >= enemyPower;

        if (!success) {
            heroes.forEach(hero => {
                hero.hp = Math.max(0, hero.hp - Math.ceil(hero.maxHp * (0.15 + Math.random() * 0.2)));
            });
            this.logAdventure(adventureState, 'battle', 'Battle went poorly; the party took damage.');

            if (adventureState.resources.potions > 0) {
                const hero = heroes.find(h => h.hp > 0 && h.hp / h.maxHp < 0.5);
                if (hero) {
                    hero.hp = Math.min(hero.maxHp, hero.hp + Math.ceil(hero.maxHp * 0.4));
                    adventureState.resources.potions -= 1;
                    this.logAdventure(adventureState, 'resource', `${hero.name} used a potion.`);
                }
            }
        } else {
            this.logAdventure(adventureState, 'battle', 'Battle victory!');
            if (Math.random() > 0.5) {
                this.awardAdventureLoot();
                this.logAdventure(adventureState, 'battle', 'Recovered equipment after the battle.');
            }
        }

        const activeHeroes = heroes.filter(hero => hero.hp > 0);
        if (activeHeroes.length === 0) {
            this.endAdventure('defeat');
        }
    },

    awardAdventureLoot() {
        const item = this.generateAdventureEquipment();
        if (item) {
            this.state.inventory.push(item);
        }
    },

    generateAdventureEquipment() {
        const baseLevel = this.state.heroes.length
            ? Math.round(this.state.heroes.reduce((sum, hero) => sum + hero.level, 0) / this.state.heroes.length)
            : 1;

        for (let i = 0; i < 6; i += 1) {
            const item = this.generateLoot(baseLevel);
            if (item.type === 'weapon' || item.type === 'armor') {
                return item;
            }
        }

        return null;
    },

    endAdventure(outcome) {
        const adventureState = this.state.adventure;
        if (!adventureState) return;

        if (outcome === 'success') {
            this.awardAdventureLoot();
            this.logAdventure(adventureState, 'status', 'Adventure completed successfully!');
        } else if (outcome === 'retreat') {
            this.logAdventure(adventureState, 'status', 'The party chose to retreat.');
        } else if (outcome === 'defeat') {
            this.logAdventure(adventureState, 'status', 'The party was defeated.');
        }

        const heroes = adventureState.partyHeroIds
            .map(id => this.state.heroes.find(h => h.id === id))
            .filter(Boolean);

        heroes.forEach(hero => {
            hero.status = 'idle';
        });

        this.state.adventure.active = false;
        this.state.adventure.outcome = outcome;

        this.save();
        this.render();
    },

    logAdventure(adventureState, type, message) {
        if (!adventureState.log) {
            adventureState.log = [];
        }
        adventureState.log.push({ type, message });
        if (adventureState.log.length > 50) {
            adventureState.log.shift();
        }
    },

    setAdventureLogFilter(filter, enabled) {
        if (!this.state.adventure) return;
        if (!this.state.adventure.logFilters) {
            this.state.adventure.logFilters = {
                battle: true,
                encounter: true,
                opportunity: true,
                resource: true,
                status: true
            };
        }
        this.state.adventure.logFilters[filter] = enabled;
        this.save();
        this.render();
    },

    takeInventoryItems(type, count) {
        const removed = [];
        let remaining = count;

        for (let i = this.state.inventory.length - 1; i >= 0 && remaining > 0; i -= 1) {
            if (this.state.inventory[i].type === type) {
                removed.push(this.state.inventory[i]);
                this.state.inventory.splice(i, 1);
                remaining -= 1;
            }
        }

        return {
            taken: removed.length,
            returnItems: () => {
                this.state.inventory.push(...removed);
            }
        };
    }
};
