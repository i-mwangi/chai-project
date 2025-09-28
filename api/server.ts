#!/usr/bin/env node

/**
 * Coffee Tree Platform API Server
 * 
 * This server provides REST endpoints for:
 * - Farmer verification functionality
 * - Harvest reporting and revenue distribution
 * - Grove management and token holder tracking
 */

import "dotenv/config"
import "../loadIntoEnv"
import { createServer, IncomingMessage, ServerResponse } from 'http'
import { parse } from 'url'
import { FarmerVerificationAPI } from './farmer-verification'
import { InvestorVerificationAPI } from './investor-verification'
import { HarvestReportingAPI } from './harvest-reporting'
import { TreeMonitoringAPI } from './tree-monitoring'
import { TreeHealthReportingService } from './tree-health-reporting'
import { 
    initializeMarketServices,
    getCurrentPrices,
    getPriceHistory,
    getMarketConditions,
    validatePrice,
    getMarketAlerts,
    acknowledgeAlert,
    updateNotificationPreferences,
    triggerPriceUpdate,
    getMarketOverview
} from './market-data'
import { 
    CoffeeGroveAnalytics, 
    InvestorPortfolioAnalytics, 
    FarmerEarningsAnalytics, 
    MarketTrendAnalytics,
    PlatformAnalytics 
} from '../lib/coffee-analytics'
import {
    getMarketplaceListings,
    listTokensForSale,
    purchaseFromMarketplace,
    cancelListing,
    updateListing,
    getTradeHistory,
    getMarketplaceStats,
    getUserListings
} from './marketplace'
import { db } from '../db'
import { userSettings, coffeeGroves } from '../db/schema'
import { eq } from 'drizzle-orm'

const PORT = parseInt(process.env.API_PORT || '3001')

// Developer toggle: for Option A we want verification flows disabled by default.
const DISABLE_INVESTOR_KYC = true

// Utility functions
function sendResponse(res: ServerResponse, statusCode: number, data: any) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-demo-bypass'
    })
    res.end(JSON.stringify(data))
}

function sendError(res: ServerResponse, statusCode: number, message: string) {
    sendResponse(res, statusCode, { success: false, error: message })
}

// Parse request body
function parseRequestBody(req: IncomingMessage): Promise<any> {
    return new Promise((resolve, reject) => {
        let body = ''
        req.on('data', chunk => {
            body += chunk.toString()
        })
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {})
            } catch (error) {
                reject(error)
            }
        })
        req.on('error', reject)
    })
}

// Enhanced request object with body and params
interface EnhancedRequest extends IncomingMessage {
    body?: any
    params?: { [key: string]: string }
    query?: { [key: string]: string | string[] | undefined }
}

// Create combined server
function createCoffeeTreePlatformServer(port: number = 3001) {
    const farmerVerificationAPI = new FarmerVerificationAPI()
    const investorVerificationAPI = new InvestorVerificationAPI()
    const harvestReportingAPI = new HarvestReportingAPI()
    const treeMonitoringAPI = new TreeMonitoringAPI()
    const treeHealthReportingService = new TreeHealthReportingService()
    // Note: user settings persisted to DB via `user_settings` table in schema
    
    // Initialize market services with coffee price oracle contract ID
    const coffeeOracleContractId = process.env.COFFEE_ORACLE_CONTRACT_ID || '0.0.123456'
    initializeMarketServices(coffeeOracleContractId)
    
    const server = createServer(async (req: EnhancedRequest, res: ServerResponse) => {
        // Handle CORS preflight requests
        if (req.method === 'OPTIONS') {
            res.writeHead(200, {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-demo-bypass'
            })
            res.end()
            return
        }
        
        const parsedUrl = parse(req.url || '', true)
        const pathname = parsedUrl.pathname || ''
        const method = req.method || 'GET'
        
        // Parse request body for POST/PUT requests
        if (method === 'POST' || method === 'PUT') {
            try {
                req.body = await parseRequestBody(req)
            } catch (error) {
                sendError(res, 400, 'Invalid JSON in request body')
                return
            }
        }
        
        // Add query parameters
        req.query = parsedUrl.query
        
        // Create an Express-like response adapter so existing modules
        // that call `res.status(...).json(...)` or `res.json(...)`
        // continue to work with the raw Node `ServerResponse`.
        const expressRes = {
            status(code: number) {
                return {
                    json: (data: any) => sendResponse(res, code, data)
                }
            },
            json: (data: any) => sendResponse(res, 200, data)
            ,
            // Provide low-level ServerResponse methods for modules that
            // call `res.writeHead`, `res.end`, `res.setHeader`, or `res.write`.
            writeHead: (statusCode: number, headers?: any) => {
                try {
                    return (res as ServerResponse).writeHead(statusCode, headers)
                } catch (e) {
                    // If underlying res doesn't support writeHead, ignore and let
                    // higher-level sendResponse handle it.
                    return undefined as any
                }
            },
            end: (data?: any) => (res as ServerResponse).end(data),
            setHeader: (name: string, value: string | number | readonly string[]) => (res as ServerResponse).setHeader(name, value),
            write: (chunk: any, encoding?: string) => (res as any).write(chunk, encoding)
        }

        try {
            // Farmer Verification Routes
            if (pathname === '/api/farmer-verification/submit-documents' && method === 'POST') {
                await farmerVerificationAPI.submitDocuments(req, expressRes as any)
            } else if (pathname === '/api/farmer-verification/verify' && method === 'POST') {
                await farmerVerificationAPI.verifyFarmer(req, expressRes as any)
            } else if (pathname.startsWith('/api/farmer-verification/status/') && method === 'GET') {
                const farmerAddress = pathname.split('/').pop() || ''
                await farmerVerificationAPI.getVerificationStatus(req, expressRes as any, farmerAddress)
            } else if (pathname === '/api/farmer-verification/register-grove' && method === 'POST') {
                await farmerVerificationAPI.registerGroveOwnership(req, expressRes as any)
            } else if (pathname === '/api/farmer-verification/pending' && method === 'GET') {
                await farmerVerificationAPI.getPendingVerifications(req, expressRes as any)
            } else if (pathname === '/api/farmer-verification/upload' && method === 'POST') {
                await farmerVerificationAPI.uploadFile(req, expressRes as any)
            
            // Investor Verification Routes
            } else if (pathname === '/api/investor-verification/submit-documents' && method === 'POST') {
                await investorVerificationAPI.submitDocuments(req, expressRes as any)
            } else if (pathname.startsWith('/api/investor-verification/status/') && method === 'GET') {
                const investorAddress = pathname.split('/').pop() || ''
                await investorVerificationAPI.getVerificationStatus(req, expressRes as any, investorAddress)
            } else if (pathname === '/api/investor-verification/pending' && method === 'GET') {
                await investorVerificationAPI.getPendingVerifications(req, expressRes as any)
            } else if (pathname === '/api/investor-verification/process' && method === 'POST') {
                await investorVerificationAPI.processVerification(req, expressRes as any)
            } else if (pathname === '/api/investor-verification/metrics' && method === 'GET') {
                await investorVerificationAPI.getVerificationMetrics(req, expressRes as any)
            
            // Harvest Reporting Routes
            } else if (pathname === '/api/harvest/report' && method === 'POST') {
                await harvestReportingAPI.reportHarvest(req, expressRes as any)
            } else if (pathname === '/api/harvest/history' && method === 'GET') {
                await harvestReportingAPI.getHarvestHistory(req, expressRes as any)
            } else if (pathname === '/api/harvest/pending' && method === 'GET') {
                await harvestReportingAPI.getPendingHarvests(req, expressRes as any)
            } else if (pathname === '/api/harvest/distribute' && method === 'POST') {
                await harvestReportingAPI.markHarvestDistributed(req, expressRes as any)
            } else if (pathname === '/api/harvest/stats' && method === 'GET') {
                await harvestReportingAPI.getHarvestStats(req, expressRes as any)
            } else if (pathname === '/api/harvest/calculate-distribution' && method === 'POST') {
                await harvestReportingAPI.calculateDistribution(req, expressRes as any)
            } else if (pathname === '/api/harvest/record-distribution' && method === 'POST') {
                await harvestReportingAPI.recordDistribution(req, expressRes as any)
            } else if (pathname === '/api/harvest/pending-distributions' && method === 'GET') {
                await harvestReportingAPI.getAllPendingDistributions(req, expressRes as any)
            } else if (pathname.startsWith('/api/harvest/holder/') && pathname.endsWith('/earnings') && method === 'GET') {
                const holderAddress = pathname.split('/')[4]
                await harvestReportingAPI.getHolderEarnings(req, expressRes as any, holderAddress)
            } else if (pathname.startsWith('/api/harvest/') && pathname.endsWith('/distribution-summary') && method === 'GET') {
                const harvestId = pathname.split('/')[3]
                await harvestReportingAPI.getDistributionSummary(req, expressRes as any, harvestId)
            } else if (pathname.startsWith('/api/harvest/') && pathname.endsWith('/earnings') && method === 'GET') {
                const harvestId = pathname.split('/')[3]
                await harvestReportingAPI.getHarvestEarnings(req, expressRes as any, harvestId)
            
            // Market Data Routes
            } else if (pathname === '/api/market/prices' && method === 'GET') {
                await getCurrentPrices(req as any, expressRes as any)
            } else if (pathname === '/api/market/price-history' && method === 'GET') {
                await getPriceHistory(req as any, expressRes as any)
            } else if (pathname === '/api/market/conditions' && method === 'GET') {
                await getMarketConditions(req as any, expressRes as any)
            } else if (pathname === '/api/market/validate-price' && method === 'POST') {
                await validatePrice(req as any, expressRes as any)
            } else if (pathname.startsWith('/api/market/alerts/') && method === 'GET') {
                const farmerAddress = pathname.split('/').pop() || ''
                req.params = { farmerAddress }
                await getMarketAlerts(req as any, expressRes as any)
            } else if (pathname.startsWith('/api/market/alerts/') && pathname.endsWith('/acknowledge') && method === 'POST') {
                const alertId = pathname.split('/')[4]
                req.params = { alertId }
                await acknowledgeAlert(req as any, expressRes as any)
            } else if (pathname.startsWith('/api/market/preferences/') && method === 'PUT') {
                const farmerAddress = pathname.split('/').pop() || ''
                req.params = { farmerAddress }
                await updateNotificationPreferences(req as any, expressRes as any)
            // User settings (simple key/value store per account)
            } else if (pathname.startsWith('/api/user/settings/') && method === 'PUT') {
                const accountId = pathname.split('/').pop() || ''
                const settings = req.body || {}
                try {
                    // Upsert-like behavior: try update, otherwise insert
                    const existing = await db.query.userSettings.findFirst({ where: eq(userSettings.account, accountId) })
                    if (existing) {
                        await db.update(userSettings).set({
                            skipFarmerVerification: settings.skipFarmerVerification ? 1 : 0,
                            skipInvestorVerification: settings.skipInvestorVerification ? 1 : 0,
                            demoBypass: settings.demoBypass ? 1 : 0,
                            updatedAt: Date.now()
                        }).where(eq(userSettings.account, accountId))
                    } else {
                        await db.insert(userSettings).values({
                            account: accountId,
                            skipFarmerVerification: settings.skipFarmerVerification ? 1 : 0,
                            skipInvestorVerification: settings.skipInvestorVerification ? 1 : 0,
                            demoBypass: settings.demoBypass ? 1 : 0,
                            updatedAt: Date.now()
                        })
                    }
                    const saved = await db.query.userSettings.findFirst({ where: eq(userSettings.account, accountId) })
                    sendResponse(res, 200, { success: true, settings: saved || {} })
                } catch (e) {
                    console.error('Error saving user settings:', e)
                    sendError(res, 500, 'Failed to save user settings')
                }
            } else if (pathname.startsWith('/api/user/settings/') && method === 'GET') {
                const accountId = pathname.split('/').pop() || ''
                try {
                    const settings = await db.query.userSettings.findFirst({ where: eq(userSettings.account, accountId) })
                    sendResponse(res, 200, { success: true, settings: settings || {} })
                } catch (e) {
                    console.error('Error fetching user settings:', e)
                    sendError(res, 500, 'Failed to fetch user settings')
                }
            } else if (pathname === '/api/market/update-prices' && method === 'POST') {
                await triggerPriceUpdate(req as any, expressRes as any)
            } else if (pathname === '/api/market/overview' && method === 'GET') {
                await getMarketOverview(req as any, expressRes as any)
            
            // Grove management endpoints (UI expects /api/groves)
            } else if (pathname.startsWith('/api/groves') && method === 'GET') {
                try {
                    const farmerAddress = (req.query && (req.query as any).farmerAddress) ? String((req.query as any).farmerAddress) : undefined
                    let groves
                    if ((db as any).__dumpStorage) {
                        // In-memory DB fallback: locate any table that looks like coffee_groves
                        const dump = (db as any).__dumpStorage()
                        const allTables = Object.values(dump || {}) as any[]
                        const candidates = allTables.flat().filter(r => r && typeof r === 'object' && ('groveName' in r || 'grove_name' in r))
                        // Normalize and filter by farmerAddress (accept different key names and formats)
                        if (farmerAddress) {
                            const q = String(farmerAddress).trim()
                            groves = candidates.filter((g: any) => {
                                const stored = String(g.farmerAddress ?? g.farmer_address ?? '').trim()
                                return stored === q
                            })
                        } else {
                            groves = candidates
                        }
                    } else {
                        if (farmerAddress) {
                            groves = await db.select().from(coffeeGroves).where(eq(coffeeGroves.farmerAddress, farmerAddress))
                        } else {
                            groves = await db.select().from(coffeeGroves)
                        }
                    }
                    sendResponse(res, 200, { success: true, groves })
                } catch (error) {
                    console.error('Error fetching groves:', error)
                    sendError(res, 500, 'Failed to fetch groves')
                }
            } else if (pathname === '/api/groves/register' && method === 'POST') {
                // Delegate to the existing farmer verification handler for registration logic
                await farmerVerificationAPI.registerGroveOwnership(req, expressRes as any)

            // Investment endpoints (basic compatibility with frontend/demo)
            } else if (pathname === '/api/investment/available-groves' && method === 'GET') {
                try {
                    // Pull groves from the DB and shape them like the demo/mock server expects
                    let groves: any[] = []
                    if ((db as any).__dumpStorage) {
                        const dump = (db as any).__dumpStorage()
                        const allTables = Object.values(dump || {}) as any[]
                        groves = allTables.flat().filter(r => r && typeof r === 'object' && 'groveName' in r)
                    } else {
                        groves = await db.select().from(coffeeGroves)
                    }
                    const availableGroves = groves.map(grove => {
                        const treeCount = Number((grove as any).treeCount || 0)
                        return {
                            ...grove,
                            tokensAvailable: Math.floor(treeCount * 0.5),
                            pricePerToken: 25 + Math.floor(Math.random() * 100) / 10,
                            projectedAnnualReturn: 10 + Math.floor(Math.random() * 80) / 10
                        }
                    })
                    sendResponse(res, 200, { success: true, groves: availableGroves })
                } catch (error) {
                    console.error('Error fetching available groves:', error)
                    sendError(res, 500, 'Failed to fetch available groves')
                }

            // Tree Monitoring Routes
            } else if (pathname === '/api/tree-monitoring/sensor-data' && method === 'POST') {
                await treeMonitoringAPI.ingestSensorData(req, expressRes as any)
            } else if (pathname.startsWith('/api/tree-monitoring/sensor-data/') && method === 'GET') {
                const groveId = pathname.split('/').pop() || ''
                await treeMonitoringAPI.getSensorData(req, expressRes as any, groveId)
            } else if (pathname.startsWith('/api/tree-monitoring/health/') && method === 'GET') {
                const groveId = pathname.split('/').pop() || ''
                await treeMonitoringAPI.getTreeHealth(req, expressRes as any, groveId)
            } else if (pathname.startsWith('/api/tree-monitoring/alerts/') && !pathname.includes('/acknowledge') && !pathname.includes('/resolve') && method === 'GET') {
                const groveId = pathname.split('/').pop() || ''
                await treeMonitoringAPI.getEnvironmentalAlerts(req, expressRes as any, groveId)
            } else if (pathname.startsWith('/api/tree-monitoring/alerts/') && pathname.endsWith('/acknowledge') && method === 'POST') {
                const alertId = pathname.split('/')[4]
                await treeMonitoringAPI.acknowledgeAlert(req, expressRes as any, alertId)
            } else if (pathname.startsWith('/api/tree-monitoring/alerts/') && pathname.endsWith('/resolve') && method === 'POST') {
                const alertId = pathname.split('/')[4]
                await treeMonitoringAPI.resolveAlert(req, expressRes as any, alertId)
            } else if (pathname === '/api/tree-monitoring/maintenance' && method === 'POST') {
                await treeMonitoringAPI.logMaintenanceActivity(req, expressRes as any)
            } else if (pathname.startsWith('/api/tree-monitoring/maintenance/') && method === 'GET') {
                const groveId = pathname.split('/').pop() || ''
                await treeMonitoringAPI.getMaintenanceActivities(req, expressRes as any, groveId)
            
            // Tree Health Reporting Routes
            } else if (pathname.startsWith('/api/tree-monitoring/reports/health-trend/') && method === 'GET') {
                const groveId = pathname.split('/').pop() || ''
                await treeHealthReportingService.generateHealthTrendReport(req, res, groveId)
            } else if (pathname === '/api/tree-monitoring/reports/grove-comparison' && method === 'GET') {
                await treeHealthReportingService.generateGroveComparisonReport(req, res)
            } else if (pathname.startsWith('/api/tree-monitoring/reports/yield-impact/') && method === 'GET') {
                const groveId = pathname.split('/').pop() || ''
                await treeHealthReportingService.generateYieldImpactAnalysis(req, res, groveId)
            } else if (pathname.startsWith('/api/tree-monitoring/reports/maintenance-effectiveness/') && method === 'GET') {
                const groveId = pathname.split('/').pop() || ''
                await treeHealthReportingService.generateMaintenanceEffectivenessReport(req, res, groveId)
            } else if (pathname.startsWith('/api/tree-monitoring/reports/risk-assessment/') && method === 'GET') {
                const groveId = pathname.split('/').pop() || ''
                await treeHealthReportingService.generateRiskAssessment(req, res, groveId)
            
            // Analytics Routes - Grove Performance
            } else if (pathname.startsWith('/api/analytics/grove/') && pathname.endsWith('/performance') && method === 'GET') {
                const groveId = parseInt(pathname.split('/')[4])
                const { startDate, endDate } = req.query || {}
                let timeframe
                if (startDate && endDate) {
                    timeframe = {
                        start: parseInt(startDate as string),
                        end: parseInt(endDate as string)
                    }
                }
                try {
                    const performance = await CoffeeGroveAnalytics.getGrovePerformance(groveId, timeframe)
                    sendResponse(res, 200, performance)
                } catch (error) {
                    console.error('Error fetching grove performance:', error)
                    sendError(res, 500, 'Failed to fetch grove performance data')
                }
            } else if (pathname.startsWith('/api/analytics/grove/') && pathname.endsWith('/health') && method === 'GET') {
                const groveId = parseInt(pathname.split('/')[4])
                const days = parseInt(req.query?.days as string) || 30
                try {
                    const healthAnalytics = await CoffeeGroveAnalytics.getGroveHealthAnalytics(groveId, days)
                    sendResponse(res, 200, healthAnalytics)
                } catch (error) {
                    console.error('Error fetching grove health analytics:', error)
                    sendError(res, 500, 'Failed to fetch grove health data')
                }
            } else if (pathname.startsWith('/api/analytics/grove/') && pathname.endsWith('/maintenance') && method === 'GET') {
                const groveId = parseInt(pathname.split('/')[4])
                const { startDate, endDate } = req.query || {}
                let timeframe
                if (startDate && endDate) {
                    timeframe = {
                        start: parseInt(startDate as string),
                        end: parseInt(endDate as string)
                    }
                }
                try {
                    const maintenance = await CoffeeGroveAnalytics.getMaintenanceAnalytics(groveId, timeframe)
                    sendResponse(res, 200, maintenance)
                } catch (error) {
                    console.error('Error fetching maintenance analytics:', error)
                    sendError(res, 500, 'Failed to fetch maintenance data')
                }
            
            // Analytics Routes - Investor Portfolio
            } else if (pathname.startsWith('/api/analytics/investor/') && pathname.endsWith('/portfolio') && method === 'GET') {
                const investorAddress = pathname.split('/')[4]
                try {
                    const portfolio = await InvestorPortfolioAnalytics.getInvestorPortfolio(investorAddress)
                    sendResponse(res, 200, portfolio)
                } catch (error) {
                    console.error('Error fetching investor portfolio:', error)
                    sendError(res, 500, 'Failed to fetch investor portfolio data')
                }
            } else if (pathname.startsWith('/api/analytics/investor/') && pathname.endsWith('/projections') && method === 'GET') {
                const investorAddress = pathname.split('/')[4]
                try {
                    const projections = await InvestorPortfolioAnalytics.getReturnProjections(investorAddress)
                    sendResponse(res, 200, projections)
                } catch (error) {
                    console.error('Error fetching return projections:', error)
                    sendError(res, 500, 'Failed to fetch return projections')
                }
            
            // Analytics Routes - Farmer Earnings
            } else if (pathname.startsWith('/api/analytics/farmer/') && pathname.endsWith('/earnings') && method === 'GET') {
                const farmerAddress = pathname.split('/')[4]
                const { startDate, endDate } = req.query || {}
                let timeframe
                if (startDate && endDate) {
                    timeframe = {
                        start: parseInt(startDate as string),
                        end: parseInt(endDate as string)
                    }
                }
                try {
                    const earnings = await FarmerEarningsAnalytics.getFarmerEarnings(farmerAddress, timeframe)
                    sendResponse(res, 200, earnings)
                } catch (error) {
                    console.error('Error fetching farmer earnings:', error)
                    sendError(res, 500, 'Failed to fetch farmer earnings data')
                }
            } else if (pathname.startsWith('/api/analytics/farmer/') && pathname.endsWith('/performance') && method === 'GET') {
                const farmerAddress = pathname.split('/')[4]
                try {
                    const performance = await FarmerEarningsAnalytics.getFarmerPerformanceMetrics(farmerAddress)
                    sendResponse(res, 200, performance)
                } catch (error) {
                    console.error('Error fetching farmer performance:', error)
                    sendError(res, 500, 'Failed to fetch farmer performance data')
                }
            
            // Analytics Routes - Market Trends
            } else if (pathname === '/api/analytics/market/price-trends' && method === 'GET') {
                const variety = parseInt(req.query?.variety as string) || 1
                const grade = parseInt(req.query?.grade as string) || 1
                const days = parseInt(req.query?.days as string) || 90
                try {
                    const trends = await MarketTrendAnalytics.getCoffeePriceTrends(variety, grade, days)
                    sendResponse(res, 200, trends)
                } catch (error) {
                    console.error('Error fetching price trends:', error)
                    sendError(res, 500, 'Failed to fetch price trend data')
                }
            } else if (pathname === '/api/analytics/market/yield-price-correlation' && method === 'GET') {
                const { startDate, endDate } = req.query || {}
                let timeframe
                if (startDate && endDate) {
                    timeframe = {
                        start: parseInt(startDate as string),
                        end: parseInt(endDate as string)
                    }
                }
                try {
                    const correlation = await MarketTrendAnalytics.getYieldPriceCorrelation(timeframe)
                    sendResponse(res, 200, correlation)
                } catch (error) {
                    console.error('Error fetching yield-price correlation:', error)
                    sendError(res, 500, 'Failed to fetch correlation data')
                }
            } else if (pathname === '/api/analytics/market/insights' && method === 'GET') {
                try {
                    const insights = await MarketTrendAnalytics.getMarketInsights()
                    sendResponse(res, 200, insights)
                } catch (error) {
                    console.error('Error fetching market insights:', error)
                    sendError(res, 500, 'Failed to fetch market insights')
                }
            
            // Analytics Routes - Platform Statistics
            } else if (pathname === '/api/analytics/platform/stats' && method === 'GET') {
                try {
                    const stats = await PlatformAnalytics.getPlatformStats()
                    sendResponse(res, 200, stats)
                } catch (error) {
                    console.error('Error fetching platform stats:', error)
                    sendError(res, 500, 'Failed to fetch platform statistics')
                }
            } else if (pathname === '/api/analytics/platform/growth' && method === 'GET') {
                const days = parseInt(req.query?.days as string) || 90
                try {
                    const growth = await PlatformAnalytics.getPlatformGrowthMetrics(days)
                    sendResponse(res, 200, growth)
                } catch (error) {
                    console.error('Error fetching platform growth:', error)
                    sendError(res, 500, 'Failed to fetch platform growth data')
                }
            
            // Health check and API info
            } else if (pathname === '/health' && method === 'GET') {
                sendResponse(res, 200, { 
                    success: true, 
                    message: 'Coffee Tree Platform API is running',
                    timestamp: new Date().toISOString(),
                    version: '1.0.0'
                })
            } else if (pathname === '/api' && method === 'GET') {
                sendResponse(res, 200, {
                    success: true,
                    message: 'Coffee Tree Platform API',
                    endpoints: {
                        farmerVerification: [
                            'POST /api/farmer-verification/submit-documents',
                            'POST /api/farmer-verification/verify',
                            'GET  /api/farmer-verification/status/:farmerAddress',
                            'POST /api/farmer-verification/register-grove',
                            'GET  /api/farmer-verification/pending',
                            'POST /api/farmer-verification/upload'
                        ],
                        investorVerification: [
                            'POST /api/investor-verification/submit-documents',
                            'GET  /api/investor-verification/status/:investorAddress',
                            'GET  /api/investor-verification/pending',
                            'POST /api/investor-verification/process',
                            'GET  /api/investor-verification/metrics'
                        ],
                        harvestReporting: [
                            'POST /api/harvest/report',
                            'GET  /api/harvest/history',
                            'GET  /api/harvest/pending',
                            'POST /api/harvest/distribute',
                            'GET  /api/harvest/stats',
                            'POST /api/harvest/calculate-distribution',
                            'POST /api/harvest/record-distribution',
                            'GET  /api/harvest/pending-distributions',
                            'GET  /api/harvest/holder/:holderAddress/earnings',
                            'GET  /api/harvest/:harvestId/distribution-summary',
                            'GET  /api/harvest/:harvestId/earnings'
                        ],
                        marketData: [
                            'GET  /api/market/prices',
                            'GET  /api/market/price-history',
                            'GET  /api/market/conditions',
                            'POST /api/market/validate-price',
                            'GET  /api/market/alerts/:farmerAddress',
                            'POST /api/market/alerts/:alertId/acknowledge',
                            'PUT  /api/market/preferences/:farmerAddress',
                            'POST /api/market/update-prices',
                            'GET  /api/market/overview'
                        ],
                        treeMonitoring: [
                            'POST /api/tree-monitoring/sensor-data',
                            'GET  /api/tree-monitoring/sensor-data/:groveId',
                            'GET  /api/tree-monitoring/health/:groveId',
                            'GET  /api/tree-monitoring/alerts/:groveId',
                            'POST /api/tree-monitoring/alerts/:alertId/acknowledge',
                            'POST /api/tree-monitoring/alerts/:alertId/resolve',
                            'POST /api/tree-monitoring/maintenance',
                            'GET  /api/tree-monitoring/maintenance/:groveId'
                        ],
                        treeHealthReporting: [
                            'GET  /api/tree-monitoring/reports/health-trend/:groveId',
                            'GET  /api/tree-monitoring/reports/grove-comparison',
                            'GET  /api/tree-monitoring/reports/yield-impact/:groveId',
                            'GET  /api/tree-monitoring/reports/maintenance-effectiveness/:groveId',
                            'GET  /api/tree-monitoring/reports/risk-assessment/:groveId'
                        ],
                        analytics: [
                            'GET  /api/analytics/grove/:groveId/performance',
                            'GET  /api/analytics/grove/:groveId/health',
                            'GET  /api/analytics/grove/:groveId/maintenance',
                            'GET  /api/analytics/investor/:address/portfolio',
                            'GET  /api/analytics/investor/:address/projections',
                            'GET  /api/analytics/farmer/:address/earnings',
                            'GET  /api/analytics/farmer/:address/performance',
                            'GET  /api/analytics/market/price-trends',
                            'GET  /api/analytics/market/yield-price-correlation',
                            'GET  /api/analytics/market/insights',
                            'GET  /api/analytics/platform/stats',
                            'GET  /api/analytics/platform/growth'
                        ]
                    }
                })
            // Marketplace Routes
            } else if (pathname === '/api/marketplace/listings' && method === 'GET') {
                await getMarketplaceListings(req, res)
            } else if (pathname === '/api/marketplace/list-tokens' && method === 'POST') {
                await listTokensForSale(req, res)
            } else if (pathname === '/api/marketplace/purchase' && method === 'POST') {
                await purchaseFromMarketplace(req, res)
            } else if (pathname === '/api/marketplace/cancel-listing' && method === 'POST') {
                await cancelListing(req, res)
            } else if (pathname === '/api/marketplace/update-listing' && method === 'POST') {
                await updateListing(req, res)
            } else if (pathname === '/api/marketplace/trades' && method === 'GET') {
                await getTradeHistory(req, res)
            } else if (pathname === '/api/marketplace/stats' && method === 'GET') {
                await getMarketplaceStats(req, res)
            } else if (pathname === '/api/marketplace/user-listings' && method === 'GET') {
                await getUserListings(req, res)
            
            // Debug endpoint: dump in-memory DB storage or query groves
            } else if (pathname === '/__debug/db' && method === 'GET') {
                try {
                    // If running with in-memory DB, expose the raw storage map
                    if ((db as any).__dumpStorage) {
                        return sendResponse(res, 200, { success: true, inmemory: (db as any).__dumpStorage() })
                    }

                    // Otherwise, return the coffee_groves rows
                    const groves = await db.select().from(coffeeGroves)
                    return sendResponse(res, 200, { success: true, groves })
                } catch (e) {
                    console.error('Debug DB dump failed:', e)
                    return sendError(res, 500, 'Failed to dump DB')
                }
            } else {
                sendError(res, 404, 'Endpoint not found')
            }
        } catch (error) {
            console.error('Server error:', error)
            sendError(res, 500, 'Internal server error')
        }
    })
    
    server.listen(port, () => {
        console.log(`Coffee Tree Platform API server running on port ${port}`)
        if (DISABLE_INVESTOR_KYC) {
            console.warn('\n⚠️  WARNING: Investor KYC is DISABLED (DISABLE_INVESTOR_KYC=true)')
            console.warn('         This mode auto-approves investors and should only be used for demos or testing.')
            console.warn('         Do NOT enable in production environments where regulatory compliance is required.\n')
        }
        console.log(`Health check: http://localhost:${port}/health`)
        console.log(`API info: http://localhost:${port}/api`)
        console.log('')
    console.log('Verification: farmer and investor verification flows are DISABLED in this build (auto-approve mode).')
        console.log('')
        console.log('Harvest Reporting Endpoints:')
        console.log('  POST /api/harvest/report')
        console.log('  GET  /api/harvest/history')
        console.log('  GET  /api/harvest/pending')
        console.log('  POST /api/harvest/distribute')
        console.log('  GET  /api/harvest/stats')
        console.log('  POST /api/harvest/calculate-distribution')
        console.log('  POST /api/harvest/record-distribution')
        console.log('  GET  /api/harvest/pending-distributions')
        console.log('  GET  /api/harvest/holder/:holderAddress/earnings')
        console.log('  GET  /api/harvest/:harvestId/distribution-summary')
        console.log('  GET  /api/harvest/:harvestId/earnings')
        console.log('')
        console.log('Market Data Endpoints:')
        console.log('  GET  /api/market/prices')
        console.log('  GET  /api/market/price-history')
        console.log('  GET  /api/market/conditions')
        console.log('  POST /api/market/validate-price')
        console.log('  GET  /api/market/alerts/:farmerAddress')
        console.log('  POST /api/market/alerts/:alertId/acknowledge')
        console.log('  PUT  /api/market/preferences/:farmerAddress')
        console.log('  POST /api/market/update-prices')
        console.log('  GET  /api/market/overview')
        console.log('')
        console.log('Tree Monitoring Endpoints:')
        console.log('  POST /api/tree-monitoring/sensor-data')
        console.log('  GET  /api/tree-monitoring/sensor-data/:groveId')
        console.log('  GET  /api/tree-monitoring/health/:groveId')
        console.log('  GET  /api/tree-monitoring/alerts/:groveId')
        console.log('  POST /api/tree-monitoring/alerts/:alertId/acknowledge')
        console.log('  POST /api/tree-monitoring/alerts/:alertId/resolve')
        console.log('  POST /api/tree-monitoring/maintenance')
        console.log('  GET  /api/tree-monitoring/maintenance/:groveId')
        console.log('')
        console.log('Tree Health Reporting Endpoints:')
        console.log('  GET  /api/tree-monitoring/reports/health-trend/:groveId')
        console.log('  GET  /api/tree-monitoring/reports/grove-comparison')
        console.log('  GET  /api/tree-monitoring/reports/yield-impact/:groveId')
        console.log('  GET  /api/tree-monitoring/reports/maintenance-effectiveness/:groveId')
        console.log('  GET  /api/tree-monitoring/reports/risk-assessment/:groveId')
        console.log('')
        console.log('Analytics Endpoints:')
        console.log('  GET  /api/analytics/grove/:groveId/performance')
        console.log('  GET  /api/analytics/grove/:groveId/health')
        console.log('  GET  /api/analytics/grove/:groveId/maintenance')
        console.log('  GET  /api/analytics/investor/:address/portfolio')
        console.log('  GET  /api/analytics/investor/:address/projections')
        console.log('  GET  /api/analytics/farmer/:address/earnings')
        console.log('  GET  /api/analytics/farmer/:address/performance')
        console.log('  GET  /api/analytics/market/price-trends')
        console.log('  GET  /api/analytics/market/yield-price-correlation')
        console.log('  GET  /api/analytics/market/insights')
        console.log('  GET  /api/analytics/platform/stats')
        console.log('  GET  /api/analytics/platform/growth')
    })
    
    return server
}

// Start the server
const server = createCoffeeTreePlatformServer(PORT)

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully')
    server.close(() => {
        console.log('Server closed')
        process.exit(0)
    })
})

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully')
    server.close(() => {
        console.log('Server closed')
        process.exit(0)
    })
})