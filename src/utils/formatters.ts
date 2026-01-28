/**
 * Formatting Utilities
 * Helper functions for displaying data
 */

/**
 * Format seconds into human-readable time
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string (e.g., "1m 30s", "2h 15m")
 */
export function formatTime(seconds) {
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

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number (e.g., "1,234,567")
 */
export function formatNumber(num) {
    return Math.floor(num).toLocaleString();
}
