import { real, sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";



export const assets = sqliteTable("assets", {
    token: text("token").unique().primaryKey().notNull(),
    name: text("name").notNull().unique().notNull(),
    symbol: text("symbol").notNull().unique().notNull(), 
    timestamp: real("timestamp").notNull()
})

export const kyc = sqliteTable("kyc", {
    account: text("account").unique().primaryKey().notNull(),
    token: text("token").references(()=> assets.token).notNull(),
})

export const transactions = sqliteTable("transactions", {
    hash: text("hash").unique().primaryKey().notNull(),
    account: text("account").notNull(),
    token: text("token").notNull(),
    amount: real("amount").notNull(),
    type: text("type").notNull(),
    timestamp: real("timestamp").notNull()
})

export const prices = sqliteTable("prices",{
    id: text("id").unique().primaryKey().notNull(),
    token: text("token").references(()=> assets.token).notNull(),
    price: real("price").notNull(),
    timestamp: real("timestamp").notNull()
})

export const lendingReserves = sqliteTable("lendingReserves", {
    token: text("token").unique().primaryKey().notNull(),
    asset: text("asset").notNull().references(()=> assets.token),
    name: text("name").notNull(),
    symbol: text("symbol").notNull(),
    timestamp: real("timestamp").notNull()
})

export const loans = sqliteTable("loans", {
    id: text("id").unique().primaryKey().notNull(),
    account: text("account").notNull(),
    collateralAsset: text("collateralAsset").notNull().references(()=> assets.token),
    loanAmountUSDC: real("loanAmount").notNull(),
    collateralAmount: real("collateralAmount").notNull(),
    liquidationPrice: real("liquidationPrice").notNull(),
    repaymentAmount: real("repaymentAmount").notNull(),
    timestamp: real("timestamp").notNull()
})

export const liquidations = sqliteTable("liquidations", {
    id: text("id").unique().primaryKey().notNull(),
    loanId: text("loanId").notNull().references(()=> loans.id),
    account: text("account").notNull(),
    timestamp: real("timestamp").notNull()
})

export const loanRepayment = sqliteTable("loanRepayment", {
    id: text("id").unique().primaryKey().notNull(),
    loanId: text("loanId").notNull().references(()=> loans.id),
    token: text("token").notNull().references(()=> assets.token),
    account: text("account").notNull(),
    timestamp: real("timestamp").notNull()
})

export const providedLiquidity = sqliteTable("providedLiquidity", {
    id: text("id").unique().primaryKey().notNull(),
    asset: text("asset").notNull().references(()=> assets.token),
    amount: real("amount").notNull(),
    account: text("account").notNull(),
    timestamp: real("timestamp").notNull()
})

export const withdrawnLiquidity = sqliteTable("withdrawnLiquidity", {
    id: text("id").unique().primaryKey().notNull(),
    asset: text("asset").notNull().references(()=> assets.token),
    amount: real("amount").notNull(),
    account: text("account").notNull(),
    timestamp: real("timestamp").notNull()
})

export const realwordAssetTimeseries = sqliteTable("realwordAssetTimeseries", {
    id: text("id").unique().primaryKey().notNull(),
    open: real("open").notNull(),
    close: real("close").notNull(),
    high: real("high").notNull(),
    low: real("low").notNull(),
    net: real("net").notNull(),
    gross: real("gross").notNull(),
    timestamp: real("timestamp").notNull(),
    asset: text("asset").notNull()
})

// Coffee Tree specific tables
export const coffeeGroves = sqliteTable("coffee_groves", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    groveName: text("grove_name").unique().notNull(),
    farmerAddress: text("farmer_address").notNull(),
    tokenAddress: text("token_address").unique(),
    location: text("location").notNull(),
    coordinatesLat: real("coordinates_lat"),
    coordinatesLng: real("coordinates_lng"),
    treeCount: integer("tree_count").notNull(),
    coffeeVariety: text("coffee_variety").notNull(),
    plantingDate: integer("planting_date"),
    expectedYieldPerTree: integer("expected_yield_per_tree"),
    totalTokensIssued: integer("total_tokens_issued"),
    tokensPerTree: integer("tokens_per_tree"),
    verificationStatus: text("verification_status").default("pending"),
    currentHealthScore: integer("current_health_score"),
    createdAt: integer("created_at").default(Date.now()),
    updatedAt: integer("updated_at").default(Date.now())
}, (table) => {
    return {
        farmerAddressIdx: index("coffee_groves_farmer_address_idx").on(table.farmerAddress),
        groveNameIdx: index("coffee_groves_name_idx").on(table.groveName),
        
    }
});

export const harvestRecords = sqliteTable("harvest_records", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    groveId: integer("grove_id").notNull().references(() => coffeeGroves.id),
    harvestDate: integer("harvest_date").notNull(),
    yieldKg: integer("yield_kg").notNull(),
    qualityGrade: integer("quality_grade").notNull(),
    salePricePerKg: integer("sale_price_per_kg").notNull(),
    totalRevenue: integer("total_revenue").notNull(),
    farmerShare: integer("farmer_share").notNull(),
    investorShare: integer("investor_share").notNull(),
    revenueDistributed: integer("revenue_distributed", { mode: 'boolean' }).default(false),
    transactionHash: text("transaction_hash"),
    createdAt: integer("created_at").default(Date.now())
}, (table) => {
    return {
        groveIdIdx: index("harvest_records_grove_id_idx").on(table.groveId),
        harvestDateIdx: index("harvest_records_date_idx").on(table.harvestDate),
        revenueDistributedIdx: index("harvest_records_distributed_idx").on(table.revenueDistributed),
       
    }
});

export const tokenHoldings = sqliteTable("token_holdings", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    holderAddress: text("holder_address").notNull(),
    groveId: integer("grove_id").notNull().references(() => coffeeGroves.id),
    tokenAmount: integer("token_amount").notNull(),
    purchasePrice: integer("purchase_price").notNull(),
    purchaseDate: integer("purchase_date").notNull(),
    isActive: integer("is_active", { mode: 'boolean' }).default(true)
})


export const revenueDistributions = sqliteTable("revenue_distributions", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    harvestId: integer("harvest_id").notNull().references(() => harvestRecords.id),
    holderAddress: text("holder_address").notNull(),
    tokenAmount: integer("token_amount").notNull(),
    revenueShare: integer("revenue_share").notNull(),
    distributionDate: integer("distribution_date").notNull(),
    transactionHash: text("transaction_hash")
})

export const farmerVerifications = sqliteTable("farmer_verifications", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    farmerAddress: text("farmer_address").unique().notNull(),
    verificationStatus: text("verification_status").default("pending"),
    documentsHash: text("documents_hash"),
    verifierAddress: text("verifier_address"),
    verificationDate: integer("verification_date"),
    rejectionReason: text("rejection_reason"),
    createdAt: integer("created_at").default(Date.now())
}, (table) => {
    return {
        farmerAddressIdx: index("farmer_verifications_address_idx").on(table.farmerAddress),
        verificationStatusIdx: index("farmer_verifications_status_idx").on(table.verificationStatus),
    }
});

export const farmers = sqliteTable("farmers", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    address: text("address").unique().notNull(),
    name: text("name"),
    email: text("email"),
    phone: text("phone"),
    location: text("location"),
    verificationStatus: text("verification_status").default("pending"),
    createdAt: integer("created_at").default(Date.now())
})

export const marketAlerts = sqliteTable("market_alerts", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    farmerAddress: text("farmer_address").notNull(),
    alertType: text("alert_type").notNull(), // PRICE_SPIKE, PRICE_DROP, VOLATILITY, SEASONAL_CHANGE
    variety: integer("variety").notNull(), // CoffeeVariety enum value
    grade: integer("grade").notNull(),
    currentPrice: integer("current_price").notNull(), // Price in cents
    previousPrice: integer("previous_price").notNull(), // Price in cents
    changePercent: integer("change_percent").notNull(), // Percentage * 100
    message: text("message").notNull(),
    sentAt: integer("sent_at").notNull(),
    channel: text("channel").notNull(), // email, sms, push
    acknowledged: integer("acknowledged", { mode: 'boolean' }).default(false)
})

export const priceHistory = sqliteTable("price_history", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    variety: integer("variety").notNull(), // CoffeeVariety enum value
    grade: integer("grade").notNull(),
    price: integer("price").notNull(), // Price in cents
    source: text("source").notNull(), // ICE, CME, CoffeeExchange, etc.
    region: text("region"),
    timestamp: integer("timestamp").notNull(),
    createdAt: integer("created_at").default(Date.now())
})

// Tree Monitoring System Tables
export const iotSensorData = sqliteTable("iot_sensor_data", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    groveId: integer("grove_id").notNull().references(() => coffeeGroves.id),
    sensorId: text("sensor_id").notNull(),
    sensorType: text("sensor_type").notNull(), // 'soil_moisture', 'temperature', 'humidity', 'ph', 'light', 'rainfall'
    value: real("value").notNull(),
    unit: text("unit").notNull(), // '%', 'C', 'F', 'pH', 'lux', 'mm'
    locationLat: real("location_lat"),
    locationLng: real("location_lng"),
    timestamp: integer("timestamp").notNull(),
    createdAt: integer("created_at").default(Date.now())
})

export const treeHealthRecords = sqliteTable("tree_health_records", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    groveId: integer("grove_id").notNull().references(() => coffeeGroves.id),
    healthScore: integer("health_score").notNull(),
    assessmentDate: integer("assessment_date").notNull(),
    soilMoistureScore: integer("soil_moisture_score"),
    temperatureScore: integer("temperature_score"),
    humidityScore: integer("humidity_score"),
    phScore: integer("ph_score"),
    lightScore: integer("light_score"),
    rainfallScore: integer("rainfall_score"),
    riskFactors: text("risk_factors"), // JSON array
    recommendations: text("recommendations"), // JSON array
    yieldImpactProjection: real("yield_impact_projection"),
    createdAt: integer("created_at").default(Date.now())
})

export const environmentalAlerts = sqliteTable("environmental_alerts", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    groveId: integer("grove_id").notNull().references(() => coffeeGroves.id),
    alertType: text("alert_type").notNull(),
    severity: text("severity").notNull(),
    title: text("title").notNull(),
    message: text("message").notNull(),
    sensorDataId: integer("sensor_data_id").references(() => iotSensorData.id),
    healthRecordId: integer("health_record_id").references(() => treeHealthRecords.id),
    farmerNotified: integer("farmer_notified", { mode: 'boolean' }).default(false),
    investorNotified: integer("investor_notified", { mode: 'boolean' }).default(false),
    acknowledged: integer("acknowledged", { mode: 'boolean' }).default(false),
    resolved: integer("resolved", { mode: 'boolean' }).default(false),
    createdAt: integer("created_at").default(Date.now()),
    resolvedAt: integer("resolved_at")
})

export const maintenanceActivities = sqliteTable("maintenance_activities", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    groveId: integer("grove_id").notNull().references(() => coffeeGroves.id),
    farmerAddress: text("farmer_address").notNull(),
    activityType: text("activity_type").notNull(),
    description: text("description").notNull(),
    cost: real("cost"),
    materialsUsed: text("materials_used"), // JSON array
    areaTreated: real("area_treated"),
    weatherConditions: text("weather_conditions"),
    notes: text("notes"),
    activityDate: integer("activity_date").notNull(),
    createdAt: integer("created_at").default(Date.now())
})

export const sensorConfigurations = sqliteTable("sensor_configurations", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    groveId: integer("grove_id").notNull().references(() => coffeeGroves.id),
    sensorType: text("sensor_type").notNull(),
    optimalMin: real("optimal_min").notNull(),
    optimalMax: real("optimal_max").notNull(),
    warningMin: real("warning_min").notNull(),
    warningMax: real("warning_max").notNull(),
    criticalMin: real("critical_min").notNull(),
    criticalMax: real("critical_max").notNull(),
    unit: text("unit").notNull(),
    readingFrequency: integer("reading_frequency").notNull(),
    alertThresholdCount: integer("alert_threshold_count").default(3),
    createdAt: integer("created_at").default(Date.now()),
    updatedAt: integer("updated_at").default(Date.now())
})

// Investor Verification System Tables
export const investorVerifications = sqliteTable("investor_verifications", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    investorAddress: text("investor_address").unique().notNull(),
    verificationStatus: text("verification_status").default("unverified"),
    verificationType: text("verification_type"),
    documentsHash: text("documents_hash"),
    identityDocumentHash: text("identity_document_hash"),
    proofOfAddressHash: text("proof_of_address_hash"),
    financialStatementHash: text("financial_statement_hash"),
    accreditationProofHash: text("accreditation_proof_hash"),
    verifierAddress: text("verifier_address"),
    verificationDate: integer("verification_date"),
    expiryDate: integer("expiry_date"),
    rejectionReason: text("rejection_reason"),
    accessLevel: text("access_level").default("none"),
    createdAt: integer("created_at").default(Date.now()),
    updatedAt: integer("updated_at").default(Date.now())
})

export const investorVerificationHistory = sqliteTable("investor_verification_history", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    verificationId: integer("verification_id").notNull().references(() => investorVerifications.id),
    previousStatus: text("previous_status"),
    newStatus: text("new_status").notNull(),
    actionType: text("action_type").notNull(),
    verifierAddress: text("verifier_address"),
    reason: text("reason"),
    timestamp: integer("timestamp").default(Date.now())
})

export const investorProfiles = sqliteTable("investor_profiles", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    investorAddress: text("investor_address").unique().notNull(),
    name: text("name"),
    email: text("email"),
    phone: text("phone"),
    country: text("country"),
    investorType: text("investor_type"),
    riskTolerance: text("risk_tolerance"),
    investmentPreferences: text("investment_preferences"),
    createdAt: integer("created_at").default(Date.now()),
    updatedAt: integer("updated_at").default(Date.now())
})

export const userSettings = sqliteTable("user_settings", {
    account: text("account").unique().primaryKey().notNull(),
    skipFarmerVerification: integer("skip_farmer_verification", { mode: 'boolean' }).default(false),
    skipInvestorVerification: integer("skip_investor_verification", { mode: 'boolean' }).default(false),
    demoBypass: integer("demo_bypass", { mode: 'boolean' }).default(false),
    updatedAt: integer("updated_at").default(Date.now())
})