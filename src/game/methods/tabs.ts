export const tabMethods = {
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
};
