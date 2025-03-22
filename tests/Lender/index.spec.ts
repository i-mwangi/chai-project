import { describe, test } from "node:test"
import { testStore } from "../../lib/test-store"
import { getClient, getEnv, getTestUser } from "../../utils"
import { AccountAllowanceApproveTransaction, AccountId, ContractCallQuery, ContractExecuteTransaction, ContractFunctionParameters, ContractId, Hbar, Long, TokenAllowance, TokenAssociateTransaction, TokenId } from "@hashgraph/sdk"

const client = getClient()
const admin = getEnv()
const user = getTestUser()


describe("Lending Protocol", async ()=> {

    const storedId = testStore.get("Lender")
    if(!storedId) throw new Error("Lender Contract ID not found");
    const contractId = ContractId.fromString(storedId)

    describe('Take Out loan', () => { 
        test("Approve Spending SAF", async () => {
            client.setOperator(user.ACCOUNT_ID, user.PRIVATE_KEY)
            const tokenAddress = testStore.get("SAF_TOKEN_ADDRESS")
            if(!tokenAddress) throw new Error("Token Address not found");
    
            const tx = await new AccountAllowanceApproveTransaction({
                tokenApprovals: [
                    new TokenAllowance({
                        tokenId: TokenId.fromSolidityAddress(tokenAddress),
                        ownerAccountId: user.ACCOUNT_ID,
                        spenderAccountId: AccountId.fromString(storedId),
                        amount: Long.fromNumber(13)
                    })
                ]
            })
            .freezeWith(client)
            .sign(user.PRIVATE_KEY)
    
            const submittedTx = await tx.execute(client)
            const receipt = await submittedTx.getReceipt(client)
    
            console.log(`Tx Hash: ${tx.transactionId} Status: ${receipt.status}`)
            console.log(`Contract ID: ${receipt.contractId}`)
    
            client.setOperator(admin.ACCOUNT_ID, admin.PRIVATE_KEY)
    
        })
    
        test("Take out loan", async ()=> {
            client.setOperator(user.ACCOUNT_ID, user.PRIVATE_KEY)
    
            const tx = await new ContractExecuteTransaction()
            .setContractId(contractId)
            .setGas(5_000_000)
            .setFunction("takeOutLoan", 
                new ContractFunctionParameters()
                .addString("Safaricom")
                .addUint64(100)
            )
            .freezeWith(client)
            .sign(user.PRIVATE_KEY)
    
            const submittedTx = await tx.execute(client)
            const receipt = await submittedTx.getReceipt(client)
    
            console.log(`Tx Hash: ${tx.transactionId} Status: ${receipt.status}`)
            console.log(`Contract ID: ${receipt.contractId}`)
    
            client.setOperator(admin.ACCOUNT_ID, admin.PRIVATE_KEY)
        })

    })

    describe.skip("Pay back loan", ()=> {

        test("Approve Spending USDC", async () => {
            client.setOperator(user.ACCOUNT_ID, user.PRIVATE_KEY)
            const tempUSDCAddress = testStore.get("USDC_TOKEN_ADDRESS")
            const tempUSDCId = testStore.get("USDC_TOKEN_ID")
    
            if(!tempUSDCAddress || !tempUSDCId) throw new Error("Temp USDC Address not found");
    
            const tx = await new AccountAllowanceApproveTransaction({
                tokenApprovals: [
                    new TokenAllowance({
                        tokenId: TokenId.fromString(tempUSDCId),
                        ownerAccountId: user.ACCOUNT_ID,
                        spenderAccountId: AccountId.fromString(storedId),
                        amount: Long.fromNumber(100)
                    })
                ]
            })
            .freezeWith(client)
            .sign(user.PRIVATE_KEY)
    
            const submittedTx = await tx.execute(client)
            const receipt = await submittedTx.getReceipt(client)
    
            console.log(`Tx Hash: ${tx.transactionId} Status: ${receipt.status}`)
            console.log(`Contract ID: ${receipt.contractId}`)
    
            client.setOperator(admin.ACCOUNT_ID, admin.PRIVATE_KEY)
        })
    
    
        test.skip("Repay loan", async ()=> {
            client.setOperator(user.ACCOUNT_ID, user.PRIVATE_KEY)
    
            const tx = await new ContractExecuteTransaction()
            .setContractId(contractId)
            .setFunction("repayOutstandingLoan", 
                new ContractFunctionParameters()
                .addString("Safaricom")
            )
            .freezeWith(client)
            .sign(user.PRIVATE_KEY)
    
            const submittedTx = await tx.execute(client)
            const receipt = await submittedTx.getReceipt(client)
    
            console.log(`Tx Hash: ${tx.transactionId} Status: ${receipt.status}`)
            console.log(`Contract ID: ${receipt.contractId}`)
    
            client.setOperator(admin.ACCOUNT_ID, admin.PRIVATE_KEY)
        })
    })



    // TODO: test liquidate loan - functionality not implemented yet
})