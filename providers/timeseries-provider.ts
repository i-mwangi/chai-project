import { db } from "../db"
import { realwordAssetTimeseries } from "../db/schema"
import { generateId } from "../lib/utils"


async function getNextTimeSeriesData(asset: string){
    // TODO: intergrate with live data feed from secondary data provider

    return {
        open: 100, 
        close: 100,
        high: 100,
        low: 100,
        net: 5000,
        gross: 21000,
        timestamp: Date.now(),
        asset
    }
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

interface UpdateTimeSeriesOptions {
    asset: string
}

async function updateTimeSeriesData(options: UpdateTimeSeriesOptions) {
    const { asset } = options

    try {
        const data = await getNextTimeSeriesData(asset)

        console.log("Time series data updated for", asset, "with data", data)

        try {
            await db.insert(realwordAssetTimeseries).values({
                id: generateId(`price_${asset}`),
                ...data
            })

            await sleep(10_000)
        }
        catch (e)
        {
            console.log("Something went wrong updating offchain data", e)
        }

    }
    catch (e)
    {
        console.log("Something went wrong", e)
    }
}


async function timeSeriesProvider(){
    const assets = await db.query.assets.findMany()

    while(true) {
        for (const asset of assets){
            await updateTimeSeriesData({asset: asset.token})
        }
    }
}


timeSeriesProvider() 