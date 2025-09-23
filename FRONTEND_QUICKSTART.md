# Coffee Tree Platform Frontend - Quick Start Guide

## Overview

I've successfully implemented the coffee grove management frontend with both farmer and investor portals. The frontend provides a comprehensive web interface for managing coffee grove investments.

## What's Been Built

### ✅ Farmer Dashboard (Task 6.1)
- **Grove Registration**: Interactive form with map-based location selection
- **Harvest Reporting**: Comprehensive forms for yield and sales data
- **Revenue Tracking**: Dashboard with charts and distribution history
- **Tree Health Monitoring**: Health scores and maintenance recommendations
- **Farmer Verification**: Document upload and status tracking

### ✅ Investor Portal (Task 6.2)
- **Grove Browsing**: Filterable marketplace with detailed grove information
- **Token Purchasing**: Investment flow with projections and calculations
- **Portfolio Management**: Holdings tracking with performance metrics
- **Secondary Market**: Token trading interface
- **Earnings History**: Revenue distribution tracking and analytics

## Quick Start

### Option 1: Easy Demo Startup (Windows)
```bash
# Run the batch file
start-demo.bat

# Or run the PowerShell script
.\start-demo.ps1
```
This automatically starts both servers and opens the frontend in your browser.

### Option 2: Manual Startup

#### 1. Start the Mock API Server
```bash
npm run api:mock
```
This starts the mock API server on port 3001 (no dependencies required).

#### 2. Start the Frontend Server (in a new terminal)
```bash
npm run frontend
```
This starts the web interface on port 3000.

### Option 3: NPM Scripts
```bash
# Start both together (may not work on all systems)
npm run dev

# Full backend with all services (requires all dependencies)
npm run dev:full
```

### 4. Access the Application
Open your browser and navigate to:
```
http://localhost:3000
```

## Key Features Implemented

### User Experience
- **Wallet Connection**: Simulated Hedera wallet integration
- **User Type Detection**: Automatic farmer/investor role assignment
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Interactive Maps**: Leaflet.js integration for grove locations
- **Data Visualization**: Chart.js for revenue and portfolio analytics

### Farmer Features
- Grove registration with GPS coordinates
- Harvest reporting with quality grades
- Revenue distribution tracking
- Tree health monitoring dashboard
- Document verification system

### Investor Features
- Grove marketplace with filtering
- Token purchase calculations
- Portfolio performance tracking
- Secondary market trading
- Earnings history visualization

### Technical Implementation
- **Frontend**: Vanilla HTML/CSS/JavaScript for performance
- **API Integration**: RESTful API client with error handling
- **State Management**: Modular JavaScript architecture
- **UI Components**: Custom CSS with modern design
- **Data Persistence**: LocalStorage for wallet connection state

## File Structure
```
frontend/
├── index.html              # Main HTML structure
├── styles/main.css         # Complete styling system
├── js/
│   ├── api.js             # API client and communication
│   ├── wallet.js          # Wallet connection management
│   ├── farmer-dashboard.js # Farmer-specific functionality
│   ├── investor-portal.js  # Investor-specific functionality
│   └── main.js            # Application controller
├── server.js              # Development server
└── README.md              # Detailed documentation
```

## Requirements Satisfied

### Requirement 2.1 & 2.2 (Grove Management)
✅ Grove registration with location mapping and tree details
✅ Harvest reporting forms with yield and sales data input

### Requirement 3.1 (Revenue Tracking)
✅ Revenue tracking dashboard showing earnings and distributions

### Requirement 8.1 & 8.2 (Tree Health)
✅ Tree health monitoring interface with status updates

### Requirement 1.1, 1.2, 1.5 (Investment Features)
✅ Grove browsing interface with filtering by location, variety, and yield
✅ Tree token purchase flow with grove details and projections
✅ Portfolio dashboard showing owned tokens and earnings history

### Requirement 6.1, 6.2, 6.4 (Secondary Market)
✅ Secondary market interface for trading tree tokens between investors

## Next Steps

The frontend is now complete and ready for use. You can:

1. **Test the Interface**: Connect as different user types to explore features
2. **Integrate Real Data**: Connect to actual smart contracts and databases
3. **Deploy**: Set up production hosting for the web interface
4. **Enhance**: Add real Hedera wallet integration when ready

## Demo Flow

1. **Visit Homepage**: See platform overview and statistics
2. **Connect Wallet**: Simulated connection assigns farmer/investor role
3. **Farmer Flow**: Register groves, report harvests, track revenue
4. **Investor Flow**: Browse groves, purchase tokens, manage portfolio
5. **Switch Views**: Navigate between dashboard, farmer, and investor portals

The implementation provides a complete, functional web interface that satisfies all the requirements for the coffee grove management frontend!
## Is
sues Fixed

✅ **ES Module Compatibility**: Fixed frontend server to use ES6 imports instead of CommonJS require()
✅ **Dependency Issues**: Created a lightweight mock API server that doesn't require problematic dependencies  
✅ **Cross-Platform Startup**: Added Windows batch and PowerShell scripts for easy demo startup

## Ready to Run!

The frontend is now fully functional and ready to demo. Simply run:

```bash
start-demo.bat
```

Or manually start the servers:

```bash
# Terminal 1
npm run api:mock

# Terminal 2  
npm run frontend
```

Then visit: http://localhost:3000