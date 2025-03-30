import "../loadIntoEnv"
import issuerContract from "../abi/Issuer.json"
import { issuerFireStore } from "../lib/stores"
import { eventReader } from "./utils"

const ISSUER_CONTRACT_ID = process.env.Issuer!

console.log("Issuer contract", ISSUER_CONTRACT_ID)

const LIMIT = 10

await eventReader({
    store: issuerFireStore,
    abi: issuerContract.abi,
    contract_id: ISSUER_CONTRACT_ID,
    limit: LIMIT
})

