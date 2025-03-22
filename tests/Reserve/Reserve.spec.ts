import { describe, test } from "node:test"
import { testStore } from "../../lib/test-store"
import { getClient, getEnv } from "../../utils"
import { ContractExecuteTransaction, ContractFunctionParameters } from "@hashgraph/sdk"

const client  = getClient()
const admin = getEnv()


describe("Reserve", async ()=> {
    const contractId = testStore.get("Reserve")
    const tempUSDCAddress = testStore.get("USDC_TOKEN_ADDRESS")

    if(!contractId) throw new Error("Contract ID not found")
    if(!tempUSDCAddress) throw new Error("Temp USDC Address not found")
    

    test("Create Reserve", async ()=> {

        const createReserveTx = await new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(5_000_000)
        .setFunction("createReserve",
            new ContractFunctionParameters()
            .addAddress(tempUSDCAddress)
            .addAddress(admin.ADDRESS)
        )
        .freezeWith(client)
        .sign(admin.PRIVATE_KEY)

        const submittedTx = await createReserveTx.execute(client)
        
        const receipt = await submittedTx.getReceipt(client)

        console.log(`Tx Hash: ${createReserveTx.transactionId}`);

    })

})