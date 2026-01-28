export const loopMethods = {
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
    },

    startGameLoop() {
        this.adventureLastTick = Date.now();
        setInterval(() => {
            this.updateGameState();
            if (this.state.adventure?.active) {
                const now = Date.now();
                if (now - this.adventureLastTick >= 5000) {
                    this.adventureLastTick = now;
                    this.tickAdventure();
                }
            }
            this.render();
        }, 1000);
    }
};
