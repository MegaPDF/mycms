/**
 * Hello World Plugin JavaScript
 * Simple functionality for the Hello World plugin
 */

console.log('Hello World Plugin loaded! 🌍');

// Plugin namespace
window.HelloWorldPlugin = {
    version: '1.0.0',
    name: 'Hello World Plugin',
    initialized: false,
    
    // Initialize plugin
    init: function() {
        if (this.initialized) return;
        
        console.log('Initializing Hello World Plugin...');
        this.setupEventListeners();
        this.addAnimations();
        this.initialized = true;
        
        // Show initialization notice
        this.showNotification('Hello World Plugin initialized! 🎉', 'success');
    },
    
    // Setup event listeners
    setupEventListeners: function() {
        // Add click handlers for buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('hello-button')) {
                this.handleButtonClick(e.target);
            }
        });
        
        // Auto-refresh data every 30 seconds if on dashboard
        if (window.location.pathname.includes('dashboard')) {
            setInterval(() => {
                this.refreshStats();
            }, 30000);
        }
    },
    
    // Add animations to elements
    addAnimations: function() {
        // Add fade-in animation to cards
        const cards = document.querySelectorAll('.hello-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('hello-animate-fade-in');
            }, index * 100);
        });
    },
    
    // Handle button clicks
    handleButtonClick: function(button) {
        const originalText = button.textContent;
        button.textContent = 'Loading...';
        button.disabled = true;
        
        setTimeout(() => {
            button.textContent = originalText;
            button.disabled = false;
        }, 1000);
    },
    
    // Show notification
    showNotification: function(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-x-full`;
        
        const bgColor = {
            'success': 'bg-green-500',
            'error': 'bg-red-500',
            'warning': 'bg-yellow-500',
            'info': 'bg-blue-500'
        }[type] || 'bg-blue-500';
        
        notification.classList.add(bgColor, 'text-white');
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Animate out after 3 seconds
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    },
    
    // API Methods
    async getPluginData() {
        try {
            const response = await fetch('/api/plugins/hello-world-plugin/data');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Failed to get plugin data:', error);
            this.showNotification('Failed to load plugin data', 'error');
            throw error;
        }
    },
    
    async getPluginStatus() {
        try {
            const response = await fetch('/api/plugins/hello-world-plugin/status');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Failed to get plugin status:', error);
            this.showNotification('Failed to load plugin status', 'error');
            throw error;
        }
    },
    
    async createMessage(message) {
        try {
            const response = await fetch('/api/plugins/hello-world-plugin/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({ message })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showNotification('Message created successfully!', 'success');
                return data;
            } else {
                throw new Error(data.message || 'Failed to create message');
            }
        } catch (error) {
            console.error('Failed to create message:', error);
            this.showNotification('Failed to create message', 'error');
            throw error;
        }
    },
    
    // Refresh stats on dashboard
    refreshStats: function() {
        if (!window.location.pathname.includes('dashboard')) return;
        
        this.getPluginData().then(data => {
            console.log('Stats refreshed:', data);
            this.showNotification('Stats refreshed', 'info');
        }).catch(error => {
            console.error('Failed to refresh stats:', error);
        });
    },
    
    // Test all API endpoints
    async testAllEndpoints() {
        const endpoints = [
            '/api/plugins/hello-world-plugin/data',
            '/api/plugins/hello-world-plugin/status',
            '/api/plugins/hello-world-plugin/test'
        ];
        
        const results = {};
        
        for (const endpoint of endpoints) {
            try {
                const response = await fetch(endpoint);
                const data = await response.json();
                results[endpoint] = { success: true, data };
            } catch (error) {
                results[endpoint] = { success: false, error: error.message };
            }
        }
        
        console.log('API Test Results:', results);
        return results;
    }
};

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.HelloWorldPlugin.init();
});

// Global functions for template usage
window.testHelloWorldApi = function(endpoint) {
    fetch(endpoint)
        .then(response => response.json())
        .then(data => {
            console.log('API Response:', data);
            window.HelloWorldPlugin.showNotification('API test successful!', 'success');
        })
        .catch(error => {
            console.error('API Error:', error);
            window.HelloWorldPlugin.showNotification('API test failed!', 'error');
        });
};

window.createHelloMessage = function() {
    const message = prompt('Enter a hello message:');
    if (message) {
        window.HelloWorldPlugin.createMessage(message);
    }
};