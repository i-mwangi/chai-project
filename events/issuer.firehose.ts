import { testStore } from "../lib/test-store"
import axios from "axios"
import issuerContract from "../abi/Issuer.json"
import ethers, {id, Interface, decodeBytes32String} from "ethers"
import { indexingStore, issuerFireStore } from "../lib/stores"
import { eventReader } from "./utils"

const ISSUER_CONTRACT_ID = testStore.get("Issuer")
const LIMIT = 10

eventReader({
    store: issuerFireStore,
    abi: issuerContract.abi,
    contract_id: ISSUER_CONTRACT_ID,
    limit: LIMIT
})

