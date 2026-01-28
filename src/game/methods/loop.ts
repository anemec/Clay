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
        setInterval(() => {
            this.updateGameState();
            if (this.state.adventure?.active) {
                const now = Date.now();
                const lastTickAt = this.state.adventure.lastTickAt || now;
                const elapsed = now - lastTickAt;
                if (elapsed >= 5000) {
                    this.processAdventureTicks(elapsed);
                    this.state.adventure.lastTickAt = now;
                }
            }
            this.render();
        }, 1000);
    }
};
