# Frontend Documentation

This document provides comprehensive information about the frontend architecture, components, and development patterns used in the Chai Platform.

## 📋 Overview

The Chai Platform frontend is built with vanilla JavaScript, HTML, and CSS, providing a lightweight and performant user interface. The frontend is organized into distinct sections for different user roles and functionality.

## 🏗️ Architecture

```
frontend/
├── index.html          # Landing page
├── app.html            # Main application
├── css/                # Stylesheets
│   ├── design-system.css
│   ├── buttons.css
│   ├── cards.css
│   └── ... (component styles)
├── js/                 # JavaScript modules
│   ├── main.js
│   ├── farmer-dashboard.js
│   ├── investor-portal.js
│   └── ... (feature modules)
├── wallet/             # Wallet integration
├── public/             # Static assets
└── dist/               # Build output
```

## 🎯 Key Pages

### Landing Page (index.html)

The main landing page that introduces the platform to new users. Features include:

- Hero section with value proposition
- Problem/solution explanation
- Feature highlights
- Call-to-action buttons
- FAQ section

### Main Application (app.html)

The primary application interface with role-based navigation:

- Dashboard view
- Farmer portal
- Investor portal
- Admin panel (when authorized)

## 🎨 Design System

### CSS Architecture

The frontend uses a modular CSS approach:

```css
/* Design System Core */
design-system.css    /* Base styles and variables */
spacing.css          /* Spacing utilities */
cards.css            /* Card components */
buttons.css          /* Button styles */
forms.css            /* Form elements */
navigation.css       /* Navigation components */
notifications.css    /* Notification system */
data-visualization.css /* Charts and graphs */
loading-states.css   /* Loading indicators */
wallet-loading.css   /* Wallet connection states */
wallet-connection-ui.css /* Wallet UI components */
animations.css       /* Animation utilities */
responsive.css       /* Responsive design */
accessibility.css    /* Accessibility features */
```

### Color Palette

```css
:root {
  --bg-dark: #1F1612;
  --bg-glass: rgba(60, 45, 38, 0.5);
  --border-glass: rgba(199, 172, 149, 0.2);
  --text-light: #F5EFE6;
  --text-dark: #B0A090;
  --gradient-primary: linear-gradient(90deg, #8A5A44 0%, #D4A373 100%);
  --glow-primary: rgba(212, 163, 115, 0.4);
}
```

## 🛠️ JavaScript Architecture

### Module Structure

The frontend JavaScript is organized into modules:

```javascript
// Main application controller
main.js              // Application initialization and routing
farmer-dashboard.js  // Farmer-specific functionality
investor-portal.js   // Investor-specific functionality
api.js               // API client
wallet/              // Wallet integration (detailed in WALLET_INTEGRATION.md)
```

### Global Objects

Several global objects provide platform functionality:

```javascript
// Wallet manager (from wallet integration)
window.walletManager

// View manager for navigation
window.viewManager

// Notification manager
window.notificationManager

// Coffee API client
window.coffeeAPI
```

### Component Patterns

#### UI Components

```javascript
// Example component pattern
class DashboardEnhanced {
  constructor() {
    this.init();
  }
  
  init() {
    this.setupEventListeners();
    this.loadDashboardData();
  }
  
  setupEventListeners() {
    // Add event listeners for UI interactions
  }
  
  loadDashboardData() {
    // Load and display dashboard data
  }
}

// Initialize on page load
window.dashboardEnhanced = new DashboardEnhanced();
```

#### State Management

```javascript
// Simple state management pattern
class StateManager {
  constructor() {
    this.state = {
      isConnected: false,
      userType: null,
      accountId: null
    };
  }
  
  update(newState) {
    this.state = { ...this.state, ...newState };
    this.notifyListeners();
  }
  
  subscribe(listener) {
    // Add listener for state changes
  }
}
```

## 🔌 Wallet Integration

The frontend integrates with the wallet system through:

### Connection UI

```html
<div class="wallet-connection">
  <button id="connect-wallet-btn" class="btn btn-primary">
    Connect Wallet
  </button>
  <div id="walletInfo" class="wallet-info hidden">
    <span id="walletAddress"></span>
    <button id="disconnectWallet" class="btn btn-danger btn-sm">
      Disconnect
    </button>
  </div>
</div>
```

### JavaScript Integration

```javascript
// Connect wallet
document.getElementById('connect-wallet-btn').addEventListener('click', async () => {
  try {
    await window.walletManager.connectWallet();
    // Handle successful connection
  } catch (error) {
    // Handle connection error
  }
});

// Listen for wallet events
window.addEventListener('wallet-connected', (event) => {
  console.log('Connected:', event.detail.accountId);
});
```

## 📊 Data Visualization

### Chart.js Integration

The platform uses Chart.js for data visualization:

```javascript
// Price chart example
const priceChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: priceData.dates,
    datasets: [{
      label: 'Coffee Price (USDC)',
      data: priceData.prices,
      borderColor: '#D4A373',
      backgroundColor: 'rgba(212, 163, 115, 0.1)',
      tension: 0.4
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        display: false
      }
    }
  }
});
```

### Custom Visualization Components

```javascript
// Health score visualization
class HealthScoreDisplay {
  constructor(element, score) {
    this.element = element;
    this.score = score;
    this.render();
  }
  
  render() {
    const percentage = (this.score / 100) * 100;
    this.element.innerHTML = `
      <div class="health-score-bar">
        <div class="health-score-fill" style="width: ${percentage}%"></div>
      </div>
      <span class="health-score-text">${this.score}/100</span>
    `;
  }
}
```

## 📱 Responsive Design

### Mobile-First Approach

```css
/* Base styles for mobile */
.navbar {
  flex-direction: column;
  padding: 10px;
}

/* Tablet and desktop enhancements */
@media (min-width: 768px) {
  .navbar {
    flex-direction: row;
    padding: 15px 30px;
  }
}
```

### Touch-Friendly UI

```css
.btn {
  min-height: 44px; /* Minimum touch target size */
  padding: 12px 24px;
}

.nav-btn {
  min-width: 44px;
  min-height: 44px;
}
```

## ♿ Accessibility

### ARIA Labels

```html
<button id="connect-wallet-btn" class="btn btn-primary" 
        aria-label="Connect your Hedera wallet">
  Connect Wallet
</button>

<nav aria-label="Main navigation">
  <button class="nav-btn" data-view="dashboard" 
          aria-current="page">
    Dashboard
  </button>
</nav>
```

### Keyboard Navigation

```javascript
// Keyboard navigation support
document.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    // Handle tab navigation
  }
});
```

### Screen Reader Support

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

## 🚀 Performance

### Code Splitting

The Vite configuration splits code for better performance:

```javascript
manualChunks: {
  'hedera-wallet-vendor': ['@hashgraph/hedera-wallet-connect'],
  'hashgraph-vendor': ['@hashgraph/sdk'],
  'walletconnect-vendor': ['@walletconnect/sign-client', '@walletconnect/universal-provider'],
}
```

### Lazy Loading

```javascript
// Lazy load heavy components
const loadChart = async () => {
  const { Chart } = await import('chart.js');
  return Chart;
};
```

### Asset Optimization

```javascript
// Optimize images
const optimizeImages = () => {
  const images = document.querySelectorAll('img[loading="lazy"]');
  // Implement lazy loading and optimization
};
```

## 🧪 Testing

### Manual Testing

```html
<!-- Test pages for specific functionality -->
wallet-test.html      <!-- Wallet integration testing -->
notification-test.html <!-- Notification system testing -->
modal-notification-test.html <!-- Modal testing -->
```

### Browser Compatibility

Tested on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome for Android)

## 🔧 Development

### Local Development

```bash
# Start development server
pnpm run dev:vite

# Build for production
pnpm run frontend:build

# Preview production build
pnpm run frontend:preview
```

### Code Organization

```javascript
// Feature-based organization
farmer-dashboard.js    // All farmer functionality
investor-portal.js     // All investor functionality
admin-panel.js         // Admin features
marketplace.js         // Marketplace features
```

### Component Reusability

```css
/* Reusable utility classes */
.btn {
  /* Base button styles */
}

.btn-primary {
  /* Primary button variant */
}

.btn-secondary {
  /* Secondary button variant */
}

.btn-sm {
  /* Small button size */
}

.btn-lg {
  /* Large button size */
}
```

## 📚 Resources

- [Vite Documentation](https://vitejs.dev/)
- [Chart.js Documentation](https://www.chartjs.org/docs/)
- [Web Accessibility Initiative](https://www.w3.org/WAI/)
- [Responsive Design Guidelines](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)

## 🆘 Troubleshooting

### Common Issues

#### Wallet Connection Problems
- Ensure WalletConnect Project ID is configured
- Check that wallet extension is installed
- Verify network configuration

#### Chart Rendering Issues
- Check that Chart.js is properly loaded
- Verify data format for charts
- Ensure canvas elements are properly sized

#### Responsive Layout Problems
- Check CSS media queries
- Verify flexbox/grid layouts
- Test on multiple screen sizes

### Debugging Tools

```javascript
// Debugging utilities
const debug = {
  log: (message, data) => {
    if (window.DEBUG) {
      console.log(`[DEBUG] ${message}`, data);
    }
  },
  
  error: (message, error) => {
    console.error(`[ERROR] ${message}`, error);
  }
};
```

### Performance Monitoring

```javascript
// Performance tracking
const trackPerformance = () => {
  const perfData = performance.getEntriesByType('navigation')[0];
  console.log('Page load time:', perfData.loadEventEnd - perfData.loadEventStart);
};
```

## 🔄 Future Improvements

### Planned Enhancements

1. **Component Library** - Create reusable web components
2. **State Management** - Implement more sophisticated state management
3. **Internationalization** - Add multi-language support
4. **Progressive Web App** - Add PWA capabilities
5. **Advanced Analytics** - Implement detailed user analytics

### Migration Path

Consider migration to modern frameworks:
- React with Vite
- Vue with Vite
- SvelteKit
- Next.js (for full-stack applications)