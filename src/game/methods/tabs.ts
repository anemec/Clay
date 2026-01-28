export const tabMethods = {
    // === Tab Management ===
    switchTab(tabName, target = null) {
        this.state.activeTab = tabName;

        // Update tab buttons
        document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
        const tabButton = target ? target.closest('.tab') : null;
        if (tabButton) {
            tabButton.classList.add('active');
        }

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(`${tabName}-tab`).classList.add('active');

        this.render();
    }
};
