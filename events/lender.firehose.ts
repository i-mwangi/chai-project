import { testStore } from "../lib/test-store"
import lenderContract from "../abi/Lender.json"
import { lenderFireStore } from "../lib/stores"
import { eventReader } from "./utils"

const LENDER_CONTRACT_ID = testStore.get("Lender")
const LIMIT = 10

eventReader({
    store: lenderFireStore,
    abi: lenderContract.abi,
    contract_id: LENDER_CONTRACT_ID,
    limit: LIMIT
})

