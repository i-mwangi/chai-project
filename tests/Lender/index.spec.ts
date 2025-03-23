import "dotenv/config"
import { describe, test } from "node:test"
import { testStore } from "../../lib/test-store"
import { getClient, getEnv, getSecondUser, getTestUser } from "../../utils"
import { AccountAllowanceApproveTransaction, AccountId, ContractCallQuery, ContractExecuteTransaction, ContractFunctionParameters, ContractId, EvmAddress, Hbar, Long, TokenAllowance, TokenAssociateTransaction, TokenId } from "@hashgraph/sdk"
import { setupTestUserWithSAFToken } from "../Issuer/test-user-setup"

const client = getClient()
const admin = getEnv()
const user = getTestUser()
const secondTesteter = getSecondUser()
const tokenString = testStore.get("SAF_TOKEN_ADDRESS")
if (!tokenString) throw new Error("SAF Token Address not found");
const SAF_TOKEN_ID = TokenId.fromSolidityAddress(tokenString)
const SAF_TOKEN_ADDRESS = EvmAddress.fromString(tokenString)

const usdcTokenAddress = testStore.get("USDC_TOKEN_ADDRESS")
if (!usdcTokenAddress) throw new Error("USDC Token Address not found");
const USDC_TOKEN_ID = TokenId.fromSolidityAddress(usdcTokenAddress)

const contractIdString = testStore.get("Lender")
if (!contractIdString) throw new Error("Lender Contract ID not found");
const contractId = ContractId.fromString(contractIdString)

const issuerIdString = testStore.get("Issuer")
if (!issuerIdString) throw new Error("Issuer Contract ID not found");
const issuerId = ContractId.fromString(issuerIdString)

describe("Lending Protocol", () => {


    test("Setup Accounts", async () => {
        await setupTestUserWithSAFToken(secondTesteter)
    })

    test("Create Lender Pool", async () => {

        const tx = await new ContractExecuteTransaction()
            .setContractId(contractId)
            .setFunction("addLenderPool",
                new ContractFunctionParameters()
                    .addAddress(SAF_TOKEN_ADDRESS)
                    .addString("Lending Safaricom")
                    .addString("lSAF")
            )
            .setGas(3000000)
            .setPayableAmount(new Hbar(20))
            .freezeWith(client)
            .sign(admin.PRIVATE_KEY)

        const submittedTx = await tx.execute(client)
        const receipt = await submittedTx.getReceipt(client)

        console.log(`Tx Hash: ${tx.transactionId}`)
        console.log(`Receipt: ${receipt.status}`)

    })

    test("Get Lp Token Address", async () => {
        console.log("Contract ID::", contractIdString)
        const queryRes = await new ContractCallQuery({
            contractId: contractId,
            gas: 300000,
            senderAccountId: admin.ACCOUNT_ID
        })
            .setFunction("getLpTokenAddress", new ContractFunctionParameters().addAddress(SAF_TOKEN_ADDRESS))
            .execute(client)

        const lpTokenAddress = queryRes.getAddress()

        console.log(`LP Token Address: ${lpTokenAddress}`)
        testStore.set(`LP_TOKEN_ADDRESS`, lpTokenAddress)

        const reserveQuery = await new ContractCallQuery({
            contractId: contractId,
            gas: 300000,
            senderAccountId: admin.ACCOUNT_ID
        })
            .setFunction("getReserveAddress", new ContractFunctionParameters().addAddress(SAF_TOKEN_ADDRESS))
            .execute(client)

        const reserveAddress = reserveQuery.getAddress()

        console.log(`Reserve Address: ${reserveAddress}`)

        testStore.set(`RESERVE_ADDRESS`, reserveAddress)

    })

    test("Grant KYC to reserve", async () => {
        const reserveAddress = testStore.get(`RESERVE_ADDRESS`)
        if (!reserveAddress) throw new Error("Reserve Address not found");
        const reserveId = AccountId.fromString(reserveAddress)

        const tx = await new ContractExecuteTransaction()
            .setContractId(issuerId)
            .setFunction("grantKYC",
                new ContractFunctionParameters()
                    .addString("Safaricom")
                    .addAddress(reserveId.toSolidityAddress())
            )
            .setGas(3000000)
            .freezeWith(client)
            .sign(admin.PRIVATE_KEY)

        const submittedTx = await tx.execute(client)

        const receipt = await submittedTx.getReceipt(client)

        console.log(`Tx Hash: ${tx.transactionId}`)
        console.log(`Receipt: ${receipt.status}`)
    })

    // TODO: associate lp tokens and approve lending
    test("Associate LP Tokens", async () => {

        const lpTokenAddress = testStore.get(`LP_TOKEN_ADDRESS`)
        if (!lpTokenAddress) throw new Error("LP Token Address not found");
        const LP_TOKEN_ID = TokenId.fromSolidityAddress(lpTokenAddress)


        client.setOperator(secondTesteter.ACCOUNT_ID, secondTesteter.PRIVATE_KEY)

        const tx = await new TokenAssociateTransaction()
            .setTokenIds([LP_TOKEN_ID])
            .setAccountId(secondTesteter.ACCOUNT_ID)
            .freezeWith(client)
            .sign(secondTesteter.PRIVATE_KEY)

        const submittedTx = await tx.execute(client)
        const receipt = await submittedTx.getReceipt(client)

        console.log(`Tx Hash: ${tx.transactionId}`)
        console.log(`Receipt: ${receipt.status}`)

        client.setOperator(admin.ACCOUNT_ID, admin.PRIVATE_KEY)
    })

    test("Approve Lending", async () => {
        client.setOperator(secondTesteter.ACCOUNT_ID, secondTesteter.PRIVATE_KEY)

        const tx = await new AccountAllowanceApproveTransaction({
            tokenApprovals: [
                new TokenAllowance({
                    tokenId: USDC_TOKEN_ID,
                    ownerAccountId: secondTesteter.ACCOUNT_ID,
                    amount: Long.fromNumber(1000 * 1_000_000),
                    spenderAccountId: AccountId.fromString(contractIdString)
                })
            ]
        })
            .freezeWith(client)
            .sign(secondTesteter.PRIVATE_KEY)

        const submittedTx = await tx.execute(client)
        const receipt = await submittedTx.getReceipt(client)

        console.log(`Tx Hash: ${tx.transactionId}`)
        console.log(`Receipt: ${receipt.status}`)

    })

    test("Provide Liquidity", async () => {
        client.setOperator(secondTesteter.ACCOUNT_ID, secondTesteter.PRIVATE_KEY)

        const tx = await new ContractExecuteTransaction()
            .setContractId(contractId)
            .setFunction("provideLiquidity",
                new ContractFunctionParameters()
                    .addAddress(SAF_TOKEN_ADDRESS)
                    .addUint64(1000 * 1_000_000)
            )
            .setGas(3000000)
            .freezeWith(client)
            .sign(secondTesteter.PRIVATE_KEY)

        const submittedTx = await tx.execute(client)
        const receipt = await submittedTx.getReceipt(client)

        console.log(`Tx Hash: ${tx.transactionId}`)
        console.log(`Receipt: ${receipt.status}`)

        client.setOperator(admin.ACCOUNT_ID, admin.PRIVATE_KEY)
    })

    test("Give contract allowance to spend SAF", async () => {
        client.setOperator(user.ACCOUNT_ID, user.PRIVATE_KEY)
        const tx = await new AccountAllowanceApproveTransaction({
            tokenApprovals: [
                new TokenAllowance({
                    tokenId: SAF_TOKEN_ID,
                    ownerAccountId: user.ACCOUNT_ID,
                    amount: Long.fromNumber(13),
                    spenderAccountId: AccountId.fromString(contractIdString)
                })
            ]
        })
            .freezeWith(client)
            .sign(secondTesteter.PRIVATE_KEY)

        const submittedTx = await tx.execute(client)
        const receipt = await submittedTx.getReceipt(client)

        console.log(`Tx Hash: ${tx.transactionId}`)
        console.log(`Receipt: ${receipt.status}`)
        client.setOperator(admin.ACCOUNT_ID, admin.PRIVATE_KEY)
    })

    test("Take Out Loan", async () => {
        client.setOperator(user.ACCOUNT_ID, user.PRIVATE_KEY)

        const tx = await new ContractExecuteTransaction()
            .setContractId(contractId)
            .setFunction("takeOutLoan",
                new ContractFunctionParameters()
                    .addAddress(SAF_TOKEN_ADDRESS)
                    .addUint64(100 * 1_000_000)
            )
            .setGas(3000000)
            .freezeWith(client)
            .sign(user.PRIVATE_KEY)

        const submittedTx = await tx.execute(client)
        const receipt = await submittedTx.getReceipt(client)

        console.log(`Tx Hash: ${tx.transactionId}`)
        console.log(`Receipt: ${receipt.status}`)

        client.setOperator(admin.ACCOUNT_ID, admin.PRIVATE_KEY)
    })

    test("Add Allowance", async () => {
        client.setOperator(user.ACCOUNT_ID, user.PRIVATE_KEY)

        const tx = await new AccountAllowanceApproveTransaction({
            tokenApprovals: [
                new TokenAllowance({
                    tokenId: USDC_TOKEN_ID,
                    ownerAccountId: user.ACCOUNT_ID,
                    amount: Long.fromNumber(110 * 1_000_000),
                    spenderAccountId: AccountId.fromString(contractIdString)
                })
            ]
        })
            .freezeWith(client)
            .sign(user.PRIVATE_KEY)

        const submittedTx = await tx.execute(client)
        const receipt = await submittedTx.getReceipt(client)

        console.log(`Tx Hash: ${tx.transactionId}`)
        console.log(`Receipt: ${receipt.status}`)

        client.setOperator(admin.ACCOUNT_ID, admin.PRIVATE_KEY)
    })


    test("Repay Loan", async () => {
        client.setOperator(user.ACCOUNT_ID, user.PRIVATE_KEY)

        const tx = await new ContractExecuteTransaction()
            .setContractId(contractId)
            .setFunction("repayOutstandingLoan",
                new ContractFunctionParameters()
                    .addAddress(SAF_TOKEN_ADDRESS)
            )
            .setGas(3000000)
            .freezeWith(client)
            .sign(user.PRIVATE_KEY)

        const submittedTx = await tx.execute(client)
        const receipt = await submittedTx.getReceipt(client)

        console.log(`Tx Hash: ${tx.transactionId}`)
        console.log(`Receipt: ${receipt.status}`)

        client.setOperator(admin.ACCOUNT_ID, admin.PRIVATE_KEY)
    })





    // TODO: test liquidate loan - functionality not implemented yet
    // TODO: rewards distribution - functionality not implemented yet
})