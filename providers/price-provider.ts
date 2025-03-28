import "dotenv/config"
import "../loadIntoEnv"
import { ContractExecuteTransaction, ContractFunctionParameters, EvmAddress, TokenId } from "@hashgraph/sdk"
import { getClient, getEnv } from "../utils"
import { testStore } from "../lib/test-store"
import { db } from "../db"
import { assets, prices } from "../db/schema"
import { generateId } from "../lib/utils"

const client = getClient()
const admin = getEnv()
const PRICE_CONTRACT_ID = process.env.PriceOracle!

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

function getNextPrice(asset: string){
    // TODO: do some custom logic here to get the next price in USDC - default will be 100 for now
    return 100
}

interface UpdateOptions {
    asset: string
}

export async function updatePrice(options: UpdateOptions){
    const { asset } = options
    
    
    try {
        const price = getNextPrice(asset)
        
        console.log("Updating price for", asset, "with price", price)

        const tx = await new ContractExecuteTransaction()
        .setContractId(PRICE_CONTRACT_ID)
        .setGas(1000000)
        .setFunction("updatePrice", 
            new ContractFunctionParameters()
            .addAddress( EvmAddress.fromString(asset))
            .addUint64(price)
        )
        .freezeWith(client)
        .sign(admin.PRIVATE_KEY)

        const response = await tx.execute(client)
        const receipt = await response.getReceipt(client)

        console.log("Price updated for", asset, "with price", price)


        try {   
            await db.insert(prices).values({
                id: generateId(`price_${asset}`),
                price,
                timestamp: Date.now(),
                token: asset
            })
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


async function priceProvider(){
    
    const assets = await db.query.assets.findMany()

    while(true) {
        for (const asset of assets){
            await updatePrice({asset: asset.token})

        }

        await sleep(3600_000)
    }
}

await priceProvider()