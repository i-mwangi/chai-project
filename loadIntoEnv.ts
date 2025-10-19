import "dotenv/config"
const NETWORK = process.env.NETWORK ?? "localnet";

function getEnv(variableName: string, network?: string) {
    return network == "testnet" ? process.env[`${variableName}_TESTNET`] : process.env[variableName];
}

process.env.Issuer = getEnv("Issuer", NETWORK);
process.env.PriceOracle = getEnv("PriceOracle", NETWORK);
process.env.Lender = getEnv("Lender", NETWORK)