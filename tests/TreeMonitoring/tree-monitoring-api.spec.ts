/**
 * Tree Monitoring API Tests
 * 
 * Tests for IoT sensor data ingestion, tree health scoring, and environmental alerts
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { TreeMonitoringAPI } from '../../api/tree-monitoring'
import { sensorConfigService } from '../../api/sensor-configuration'
import { db } from '../../db'
import { 
    coffeeGroves, 
    iotSensorData, 
    treeHealthRecords, 
    environmentalAlerts,
    maintenanceActivities,
    sensorConfigurations
} from '../../db/schema'
import { eq } from 'drizzle-orm'

// Mock HTTP request/response objects
function createMockRequest(body: any = {}, query: any = {}, params: any = {}): any {
    return {
        body,
        query,
        params,
        method: 'POST',
        url: '/test'
    }
}

function createMockResponse(): any {
    let statusCode = 200
    let responseData: any = null
    
    return {
        writeHead: (code: number, headers: any) => {
            statusCode = code
        },
        end: (data: string) => {
            responseData = JSON.parse(data)
        },
        getStatusCode: () => statusCode,
        getResponseData: () => responseData
    }
}

describe('Tree Monitoring API', () => {
    let treeMonitoringAPI: TreeMonitoringAPI
    let testGroveId: number

    beforeAll(async () => {
        treeMonitoringAPI = new TreeMonitoringAPI()
        
        // Create a test grove
        const [grove] = await db.insert(coffeeGroves).values({
            groveName: 'Test Monitoring Grove',
            farmerAddress: '0x1234567890123456789012345678901234567890',
            location: 'Test Location',
            coordinatesLat: 10.0,
            coordinatesLng: -84.0,
            treeCount: 100,
            coffeeVariety: 'Arabica',
            plantingDate: Math.floor(Date.now() / 1000),
            expectedYieldPerTree: 5000,
            verificationStatus: 'verified'
        }).returning()
        
        testGroveId = grove.id
        
        // Initialize sensor configurations for the test grove
        await sensorConfigService.initializeGroveConfigurations(testGroveId)
    })

    afterAll(async () => {
        // Clean up test data
        await db.delete(maintenanceActivities).where(eq(maintenanceActivities.groveId, testGroveId))
        await db.delete(environmentalAlerts).where(eq(environmentalAlerts.groveId, testGroveId))
        await db.delete(treeHealthRecords).where(eq(treeHealthRecords.groveId, testGroveId))
        await db.delete(iotSensorData).where(eq(iotSensorData.groveId, testGroveId))
        await db.delete(sensorConfigurations).where(eq(sensorConfigurations.groveId, testGroveId))
        await db.delete(coffeeGroves).where(eq(coffeeGroves.id, testGroveId))
    })

    beforeEach(async () => {
        // Clean up sensor data and alerts before each test
        await db.delete(environmentalAlerts).where(eq(environmentalAlerts.groveId, testGroveId))
        await db.delete(iotSensorData).where(eq(iotSensorData.groveId, testGroveId))
    })

    describe('Sensor Data Ingestion', () => {
        it('should successfully ingest valid sensor data', async () => {
            const req = createMockRequest({
                groveId: testGroveId,
                sensorId: 'SOIL_001',
                sensorType: 'soil_moisture',
                value: 65,
                unit: '%',
                location: { lat: 10.0, lng: -84.0 },
                timestamp: new Date().toISOString()
            })
            const res = createMockResponse()

            await treeMonitoringAPI.ingestSensorData(req, res)

            expect(res.getStatusCode()).toBe(201)
            expect(res.getResponseData().success).toBe(true)
            expect(res.getResponseData().data.sensorType).toBe('soil_moisture')
            expect(res.getResponseData().data.value).toBe(65)
        })

        it('should reject sensor data with missing required fields', async () => {
            const req = createMockRequest({
                groveId: testGroveId,
                sensorId: 'SOIL_001',
                // Missing sensorType, value, unit
            })
            const res = createMockResponse()

            await treeMonitoringAPI.ingestSensorData(req, res)

            expect(res.getStatusCode()).toBe(400)
            expect(res.getResponseData().success).toBe(false)
            expect(res.getResponseData().error).toContain('Missing required fields')
        })

        it('should reject sensor data with invalid sensor type', async () => {
            const req = createMockRequest({
                groveId: testGroveId,
                sensorId: 'INVALID_001',
                sensorType: 'invalid_sensor',
                value: 50,
                unit: '%'
            })
            const res = createMockResponse()

            await treeMonitoringAPI.ingestSensorData(req, res)

            expect(res.getStatusCode()).toBe(400)
            expect(res.getResponseData().success).toBe(false)
            expect(res.getResponseData().error).toContain('Invalid sensor type')
        })

        it('should reject sensor data for non-existent grove', async () => {
            const req = createMockRequest({
                groveId: 99999,
                sensorId: 'SOIL_001',
                sensorType: 'soil_moisture',
                value: 65,
                unit: '%'
            })
            const res = createMockResponse()

            await treeMonitoringAPI.ingestSensorData(req, res)

            expect(res.getStatusCode()).toBe(404)
            expect(res.getResponseData().success).toBe(false)
            expect(res.getResponseData().error).toBe('Grove not found')
        })

        it('should create environmental alert for critical sensor values', async () => {
            // Insert critical low soil moisture reading
            const req = createMockRequest({
                groveId: testGroveId,
                sensorId: 'SOIL_001',
                sensorType: 'soil_moisture',
                value: 15, // Below critical threshold (20%)
                unit: '%'
            })
            const res = createMockResponse()

            await treeMonitoringAPI.ingestSensorData(req, res)

            expect(res.getStatusCode()).toBe(201)

            // Check that an alert was created
            const alerts = await db.select()
                .from(environmentalAlerts)
                .where(eq(environmentalAlerts.groveId, testGroveId))

            expect(alerts.length).toBe(1)
            expect(alerts[0].alertType).toBe('DROUGHT_RISK')
            expect(alerts[0].severity).toBe('CRITICAL')
        })
    })

    describe('Sensor Data Retrieval', () => {
        beforeEach(async () => {
            // Insert test sensor data
            await db.insert(iotSensorData).values([
                {
                    groveId: testGroveId,
                    sensorId: 'SOIL_001',
                    sensorType: 'soil_moisture',
                    value: 65,
                    unit: '%',
                    timestamp: Math.floor(Date.now() / 1000) - 3600 // 1 hour ago
                },
                {
                    groveId: testGroveId,
                    sensorId: 'TEMP_001',
                    sensorType: 'temperature',
                    value: 22,
                    unit: 'C',
                    timestamp: Math.floor(Date.now() / 1000) - 1800 // 30 minutes ago
                }
            ])
        })

        it('should retrieve sensor data for a grove', async () => {
            const req = createMockRequest({}, { limit: '10' })
            const res = createMockResponse()

            await treeMonitoringAPI.getSensorData(req, res, testGroveId.toString())

            expect(res.getStatusCode()).toBe(200)
            expect(res.getResponseData().success).toBe(true)
            expect(res.getResponseData().data.length).toBe(2)
            expect(res.getResponseData().count).toBe(2)
        })

        it('should filter sensor data by sensor type', async () => {
            const req = createMockRequest({}, { sensorType: 'soil_moisture', limit: '10' })
            const res = createMockResponse()

            await treeMonitoringAPI.getSensorData(req, res, testGroveId.toString())

            expect(res.getStatusCode()).toBe(200)
            expect(res.getResponseData().data.length).toBe(1)
            expect(res.getResponseData().data[0].sensorType).toBe('soil_moisture')
        })

        it('should reject invalid grove ID', async () => {
            const req = createMockRequest({}, { limit: '10' })
            const res = createMockResponse()

            await treeMonitoringAPI.getSensorData(req, res, 'invalid')

            expect(res.getStatusCode()).toBe(400)
            expect(res.getResponseData().error).toBe('Invalid grove ID')
        })
    })

    describe('Environmental Alerts', () => {
        beforeEach(async () => {
            // Insert test alert
            await db.insert(environmentalAlerts).values({
                groveId: testGroveId,
                alertType: 'DROUGHT_RISK',
                severity: 'HIGH',
                title: 'Low Soil Moisture',
                message: 'Soil moisture is below optimal levels',
                farmerNotified: false,
                investorNotified: false,
                acknowledged: false,
                resolved: false
            })
        })

        it('should retrieve environmental alerts for a grove', async () => {
            const req = createMockRequest({}, { limit: '10' })
            const res = createMockResponse()

            await treeMonitoringAPI.getEnvironmentalAlerts(req, res, testGroveId.toString())

            expect(res.getStatusCode()).toBe(200)
            expect(res.getResponseData().success).toBe(true)
            expect(res.getResponseData().data.length).toBe(1)
            expect(res.getResponseData().data[0].alertType).toBe('DROUGHT_RISK')
        })

        it('should acknowledge an alert', async () => {
            // Get the alert ID
            const alerts = await db.select()
                .from(environmentalAlerts)
                .where(eq(environmentalAlerts.groveId, testGroveId))
                .limit(1)

            const alertId = alerts[0].id

            const req = createMockRequest({})
            const res = createMockResponse()

            await treeMonitoringAPI.acknowledgeAlert(req, res, alertId.toString())

            expect(res.getStatusCode()).toBe(200)
            expect(res.getResponseData().success).toBe(true)
            expect(res.getResponseData().data.acknowledged).toBe(true)
        })

        it('should resolve an alert', async () => {
            // Get the alert ID
            const alerts = await db.select()
                .from(environmentalAlerts)
                .where(eq(environmentalAlerts.groveId, testGroveId))
                .limit(1)

            const alertId = alerts[0].id

            const req = createMockRequest({})
            const res = createMockResponse()

            await treeMonitoringAPI.resolveAlert(req, res, alertId.toString())

            expect(res.getStatusCode()).toBe(200)
            expect(res.getResponseData().success).toBe(true)
            expect(res.getResponseData().data.resolved).toBe(true)
            expect(res.getResponseData().data.resolvedAt).toBeDefined()
        })
    })

    describe('Maintenance Activities', () => {
        it('should log maintenance activity successfully', async () => {
            const req = createMockRequest({
                groveId: testGroveId,
                farmerAddress: '0x1234567890123456789012345678901234567890',
                activityType: 'WATERING',
                description: 'Irrigation of coffee trees',
                cost: 5000, // $50.00 in cents
                materialsUsed: ['Water', 'Fertilizer'],
                areaTreated: 2.5,
                weatherConditions: 'Sunny, 25°C',
                notes: 'Trees looking healthy',
                activityDate: new Date().toISOString()
            })
            const res = createMockResponse()

            await treeMonitoringAPI.logMaintenanceActivity(req, res)

            expect(res.getStatusCode()).toBe(201)
            expect(res.getResponseData().success).toBe(true)
            expect(res.getResponseData().data.activityType).toBe('WATERING')
            expect(res.getResponseData().data.cost).toBe(5000)
        })

        it('should reject maintenance activity with missing required fields', async () => {
            const req = createMockRequest({
                groveId: testGroveId,
                farmerAddress: '0x1234567890123456789012345678901234567890',
                // Missing activityType, description, activityDate
            })
            const res = createMockResponse()

            await treeMonitoringAPI.logMaintenanceActivity(req, res)

            expect(res.getStatusCode()).toBe(400)
            expect(res.getResponseData().success).toBe(false)
            expect(res.getResponseData().error).toContain('Missing required fields')
        })

        it('should retrieve maintenance activities for a grove', async () => {
            // Insert test maintenance activity
            await db.insert(maintenanceActivities).values({
                groveId: testGroveId,
                farmerAddress: '0x1234567890123456789012345678901234567890',
                activityType: 'FERTILIZING',
                description: 'Applied organic fertilizer',
                cost: 10000,
                materialsUsed: JSON.stringify(['Organic fertilizer', 'Compost']),
                areaTreated: 5.0,
                activityDate: Math.floor(Date.now() / 1000)
            })

            const req = createMockRequest({}, { limit: '10' })
            const res = createMockResponse()

            await treeMonitoringAPI.getMaintenanceActivities(req, res, testGroveId.toString())

            expect(res.getStatusCode()).toBe(200)
            expect(res.getResponseData().success).toBe(true)
            expect(res.getResponseData().data.length).toBe(1)
            expect(res.getResponseData().data[0].activityType).toBe('FERTILIZING')
        })
    })

    describe('Tree Health Assessment', () => {
        it('should calculate and store tree health score after sensor data ingestion', async () => {
            // Insert multiple sensor readings to trigger health score calculation
            const sensorReadings = [
                { sensorType: 'soil_moisture', value: 70, unit: '%' },
                { sensorType: 'temperature', value: 22, unit: 'C' },
                { sensorType: 'humidity', value: 75, unit: '%' },
                { sensorType: 'ph', value: 6.5, unit: 'pH' }
            ]

            for (const reading of sensorReadings) {
                const req = createMockRequest({
                    groveId: testGroveId,
                    sensorId: `${reading.sensorType.toUpperCase()}_001`,
                    sensorType: reading.sensorType,
                    value: reading.value,
                    unit: reading.unit
                })
                const res = createMockResponse()

                await treeMonitoringAPI.ingestSensorData(req, res)
                expect(res.getStatusCode()).toBe(201)
            }

            // Check that health record was created
            const healthRecords = await db.select()
                .from(treeHealthRecords)
                .where(eq(treeHealthRecords.groveId, testGroveId))

            expect(healthRecords.length).toBeGreaterThan(0)
            expect(healthRecords[0].healthScore).toBeGreaterThan(0)
            expect(healthRecords[0].healthScore).toBeLessThanOrEqual(100)
        })

        it('should retrieve tree health records for a grove', async () => {
            // Insert test health record
            await db.insert(treeHealthRecords).values({
                groveId: testGroveId,
                healthScore: 85,
                assessmentDate: Math.floor(Date.now() / 1000),
                soilMoistureScore: 90,
                temperatureScore: 85,
                humidityScore: 80,
                phScore: 85,
                riskFactors: JSON.stringify([]),
                recommendations: JSON.stringify(['Continue current care routine'])
            })

            const req = createMockRequest({}, { limit: '10' })
            const res = createMockResponse()

            await treeMonitoringAPI.getTreeHealth(req, res, testGroveId.toString())

            expect(res.getStatusCode()).toBe(200)
            expect(res.getResponseData().success).toBe(true)
            expect(res.getResponseData().data.length).toBe(1)
            expect(res.getResponseData().data[0].healthScore).toBe(85)
        })
    })
})