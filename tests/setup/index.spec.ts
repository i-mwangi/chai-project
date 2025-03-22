import { describe, test} from "node:test"
import { testStore } from "../../lib/test-store"
import { ContractExecuteTransaction, ContractFunctionParameters, ContractId } from "@hashgraph/sdk"
import { getClient, getEnv, getTestUser } from "../../utils"

const client = getClient()
const user = getTestUser()
const admin = getEnv()

describe("Setup Lender and Issuer", async()=>{
    const ISSUER_CONTRACT_ID = testStore.get("Issuer")
    const RESERVE_CONTRACT_ID = testStore.get("Reserve")
    const LENDER_CONTRACT_ID = testStore.get("Lender")

    if(!ISSUER_CONTRACT_ID || !RESERVE_CONTRACT_ID || !LENDER_CONTRACT_ID) throw new Error("Contracts not deployed");

    const issuerContract = ContractId.fromString(ISSUER_CONTRACT_ID)
    const reserveContract = ContractId.fromString(RESERVE_CONTRACT_ID)
    const lenderContract = ContractId.fromString(LENDER_CONTRACT_ID)

    test("Issuer, Lender => Reserve", async ()=>{

        const tx = await new ContractExecuteTransaction()
        .setContractId(reserveContract)
        .setGas(1000000)
        .setFunction("addControllers",
            new ContractFunctionParameters()
            .addAddress(issuerContract.toSolidityAddress())
            .addAddress(lenderContract.toSolidityAddress())        
        )
        .freezeWith(client)
        .sign(admin.PRIVATE_KEY)

        const submittedTx = await tx.execute(client)
        const receipt = await submittedTx.getReceipt(client)

        console.log(`TX ID: ${submittedTx.transactionId}`)
        console.log(`Status: ${receipt.status}`)

        

    })


    test("Lender => Issuer", async ()=>{
        const tx = await new ContractExecuteTransaction()
        .setContractId(issuerContract)
        .setGas(1000000)
        .setFunction("setLender",
            new ContractFunctionParameters()
            .addAddress(lenderContract.toSolidityAddress())
        )
        .freezeWith(client)
        .sign(admin.PRIVATE_KEY)

        const submittedTx = await tx.execute(client)
        const receipt = await submittedTx.getReceipt(client)

        console.log(`TX ID: ${submittedTx.transactionId}`)
        console.log(`Status: ${receipt.status}`)
    })
})