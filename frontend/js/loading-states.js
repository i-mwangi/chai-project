/**
 * Loading States and Progress Indicators Module
 * Provides centralized loading state management for async operations
 */

/**
 * LoadingStateManager
 * Manages loading spinners and progress indicators for async operations
 */
class LoadingStateManager {
    constructor() {
        this.activeOperations = new Map();
        this.progressBars = new Map();
        this.initialized = false;
    }

    /**
     * Initialize the loading state manager
     * Creates the necessary DOM elements for loading indicators
     */
    initialize() {
        if (this.initialized) {
            return;
        }

        // Create loading overlay container if it doesn't exist
        if (!document.getElementById('loading-overlay-container')) {
            const container = document.createElement('div');
            container.id = 'loading-overlay-container';
            container.className = 'loading-overlay-container';
            document.body.appendChild(container);
        }

        this.initialized = true;
        console.log('LoadingStateManager initialized');
    }

    /**
     * Show loading spinner for an operation
     * @param {string} operationId - Unique identifier for the operation
     * @param {string} message - Loading message to display
     * @param {HTMLElement} targetElement - Optional target element to show spinner in
     * @returns {string} Operation ID
     */
    showLoading(operationId, message = 'Loading...', targetElement = null) {
        this.initialize();

        // If operation already exists, update message
        if (this.activeOperations.has(operationId)) {
            this.updateLoadingMessage(operationId, message);
            return operationId;
        }

        const loadingElement = this._createLoadingElement(operationId, message);
        
        if (targetElement) {
            // Show spinner in specific element
            targetElement.style.position = 'relative';
            targetElement.appendChild(loadingElement);
        } else {
            // Show spinner in overlay
            const container = document.getElementById('loading-overlay-container');
            container.appendChild(loadingElement);
        }

        this.activeOperations.set(operationId, {
            element: loadingElement,
            message,
            startTime: Date.now(),
            targetElement
        });

        return operationId;
    }

    /**
     * Hide loading spinner for an operation
     * @param {string} operationId - Operation identifier
     */
    hideLoading(operationId) {
        const operation = this.activeOperations.get(operationId);
        if (!operation) {
            return;
        }

        // Remove element with fade out animation
        operation.element.classList.add('fade-out');
        setTimeout(() => {
            if (operation.element.parentNode) {
                operation.element.parentNode.removeChild(operation.element);
            }
        }, 300);

        this.activeOperations.delete(operationId);
    }

    /**
     * Update loading message for an operation
     * @param {string} operationId - Operation identifier
     * @param {string} message - New message
     */
    updateLoadingMessage(operationId, message) {
        const operation = this.activeOperations.get(operationId);
        if (!operation) {
            return;
        }

        const messageElement = operation.element.querySelector('.loading-message');
        if (messageElement) {
            messageElement.textContent = message;
            operation.message = message;
        }
    }

    /**
     * Show progress bar for batch operations
     * @param {string} progressId - Unique identifier for the progress bar
     * @param {Object} options - Progress bar options
     * @returns {string} Progress ID
     */
    showProgress(progressId, options = {}) {
        this.initialize();

        const {
            message = 'Processing...',
            total = 100,
            current = 0,
            targetElement = null
        } = options;

        // If progress bar already exists, update it
        if (this.progressBars.has(progressId)) {
            this.updateProgress(progressId, current, message);
            return progressId;
        }

        const progressElement = this._createProgressElement(progressId, message, total, current);
        
        if (targetElement) {
            targetElement.style.position = 'relative';
            targetElement.appendChild(progressElement);
        } else {
            const container = document.getElementById('loading-overlay-container');
            container.appendChild(progressElement);
        }

        this.progressBars.set(progressId, {
            element: progressElement,
            total,
            current,
            message,
            startTime: Date.now(),
            targetElement
        });

        return progressId;
    }

    /**
     * Update progress bar
     * @param {string} progressId - Progress identifier
     * @param {number} current - Current progress value
     * @param {string} message - Optional message update
     */
    updateProgress(progressId, current, message = null) {
        const progress = this.progressBars.get(progressId);
        if (!progress) {
            return;
        }

        progress.current = current;
        const percentage = Math.min(100, Math.max(0, (current / progress.total) * 100));

        // Update progress bar
        const progressBar = progress.element.querySelector('.progress-bar-fill');
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
        }

        // Update counter
        const counter = progress.element.querySelector('.progress-counter');
        if (counter) {
            counter.textContent = `${current} of ${progress.total}`;
        }

        // Update percentage
        const percentageElement = progress.element.querySelector('.progress-percentage');
        if (percentageElement) {
            percentageElement.textContent = `${Math.round(percentage)}%`;
        }

        // Update message if provided
        if (message) {
            progress.message = message;
            const messageElement = progress.element.querySelector('.progress-message');
            if (messageElement) {
                messageElement.textContent = message;
            }
        }
    }

    /**
     * Hide progress bar
     * @param {string} progressId - Progress identifier
     */
    hideProgress(progressId) {
        const progress = this.progressBars.get(progressId);
        if (!progress) {
            return;
        }

        // Remove element with fade out animation
        progress.element.classList.add('fade-out');
        setTimeout(() => {
            if (progress.element.parentNode) {
                progress.element.parentNode.removeChild(progress.element);
            }
        }, 300);

        this.progressBars.delete(progressId);
    }

    /**
     * Create loading spinner element
     * @private
     */
    _createLoadingElement(operationId, message) {
        const element = document.createElement('div');
        element.className = 'loading-overlay';
        element.id = `loading-${operationId}`;
        element.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <div class="loading-message">${message}</div>
            </div>
        `;
        return element;
    }

    /**
     * Create progress bar element
     * @private
     */
    _createProgressElement(progressId, message, total, current) {
        const percentage = Math.min(100, Math.max(0, (current / total) * 100));
        
        const element = document.createElement('div');
        element.className = 'progress-overlay';
        element.id = `progress-${progressId}`;
        element.innerHTML = `
            <div class="progress-content">
                <div class="progress-message">${message}</div>
                <div class="progress-bar-container">
                    <div class="progress-bar-fill" style="width: ${percentage}%"></div>
                </div>
                <div class="progress-info">
                    <span class="progress-counter">${current} of ${total}</span>
                    <span class="progress-percentage">${Math.round(percentage)}%</span>
                </div>
            </div>
        `;
        return element;
    }

    /**
     * Clear all loading states and progress bars
     */
    clearAll() {
        // Clear all loading spinners
        for (const operationId of this.activeOperations.keys()) {
            this.hideLoading(operationId);
        }

        // Clear all progress bars
        for (const progressId of this.progressBars.keys()) {
            this.hideProgress(progressId);
        }
    }

    /**
     * Check if any operations are active
     * @returns {boolean}
     */
    hasActiveOperations() {
        return this.activeOperations.size > 0 || this.progressBars.size > 0;
    }

    /**
     * Get active operation count
     * @returns {number}
     */
    getActiveOperationCount() {
        return this.activeOperations.size + this.progressBars.size;
    }
}

// Create singleton instance
const loadingStateManager = new LoadingStateManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        LoadingStateManager,
        loadingStateManager
    };
}
