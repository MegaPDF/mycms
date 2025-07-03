/**
 * Sample Test Plugin JavaScript
 * Comprehensive functionality for the plugin interface
 */

console.log('Sample Test Plugin loaded - Full PHP Version 1.0.0');

// Plugin namespace
window.SampleTestPlugin = {
    version: '1.0.0',
    name: 'Sample Test Plugin',
    initialized: false,
    
    // Initialize plugin
    init: function() {
        if (this.initialized) return;
        
        console.log('Initializing Sample Test Plugin...');
        this.setupEventListeners();
        this.loadInitialData();
        this.initialized = true;
        
        // Show initialization notice
        this.showNotification('Plugin initialized successfully!', 'success');
    },
    
    // Setup event listeners
    setupEventListeners: function() {
        // Auto-refresh stats every 30 seconds if on dashboard
        if (window.location.pathname.includes('dashboard')) {
            setInterval(() => {
                this.refreshStats();
            }, 30000);
        }
        
        // Handle form submissions
        document.addEventListener('submit', (e) => {
            if (e.target.classList.contains('sample-form')) {
                e.preventDefault();
                this.handleFormSubmit(e.target);
            }
        });
    },
    
    // Load initial data
    loadInitialData: function() {
        this.getPluginStatus().then(status => {
            console.log('Plugin status:', status);
        });
    },
    
    // API Methods
    async getPluginData() {
        try {
            const response = await fetch('/api/plugins/sample-test-plugin/data');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Failed to get plugin data:', error);
            throw error;
        }
    },
    
    async getPluginStatus() {
        try {
            const response = await fetch('/api/plugins/sample-test-plugin/status');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Failed to get plugin status:', error);
            throw error;
        }
    },
    
    async createSample(sampleData) {
        try {
            const response = await fetch('/api/plugins/sample-test-plugin/samples', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify(sampleData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showNotification('Sample created successfully!', 'success');
                return data.data;
            } else {
                throw new Error(data.message || 'Failed to create sample');
            }
        } catch (error) {
            console.error('Failed to create sample:', error);
            this.showNotification('Failed to create sample: ' + error.message, 'error');
            throw error;
        }
    },
    
    async runTests() {
        try {
            const response = await fetch('/api/plugins/sample-test-plugin/test');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Plugin tests failed:', error);
            throw error;
        }
    },
    
    // UI Helper Methods
    showNotification: function(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    },
    
    refreshStats: function() {
        const statsElements = document.querySelectorAll('.stat-number');
        
        this.getPluginStatus().then(status => {
            if (status.stats) {
                statsElements.forEach(element => {
                    const statType = element.dataset.stat;
                    if (status.stats[statType] !== undefined) {
                        this.animateNumber(element, status.stats[statType]);
                    }
                });
            }
        }).catch(error => {
            console.error('Failed to refresh stats:', error);
        });
    },
    
    animateNumber: function(element, newValue) {
        const currentValue = parseInt(element.textContent) || 0;
        const duration = 1000; // 1 second
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = Math.round(currentValue + (newValue - currentValue) * progress);
            element.textContent = current.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    },
    
    handleFormSubmit: function(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        this.createSample(data).then(sample => {
            form.reset();
            this.refreshStats();
        }).catch(error => {
            console.error('Form submission failed:', error);
        });
    },
    
    // Test functions for the UI
    testPlugin: function() {
        this.showNotification('Running plugin tests...', 'info');
        
        return this.runTests().then(results => {
            const allPassed = results.all_passed;
            const message = allPassed ? 'All tests passed!' : 'Some tests failed';
            const type = allPassed ? 'success' : 'error';
            
            this.showNotification(message, type);
            return results;
        });
    }
};

// CSS for notifications
const notificationStyles = `
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    border-radius: 6px;
    color: white;
    font-weight: 600;
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: 1rem;
    max-width: 400px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.notification-success {
    background: #28a745;
}

.notification-error {
    background: #dc3545;
}

.notification-info {
    background: #17a2b8;
}

.notification button {
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
}
`;

// Add notification styles to page
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.SampleTestPlugin.init();
    });
} else {
    window.SampleTestPlugin.init();
}

// Make functions globally available for button onclick handlers
window.testPlugin = () => window.SampleTestPlugin.testPlugin();
window.loadStats = () => window.SampleTestPlugin.getPluginData();
window.checkStatus = () => window.SampleTestPlugin.getPluginStatus();