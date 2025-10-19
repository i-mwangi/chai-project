import "dotenv/config"
const NETWORK = process.env.NETWORK ?? "localnet";

function getEnv(variableName: string, network?: string) {
    const value = network == "testnet" ? process.env[`${variableName}_TESTNET`] : process.env[variableName];
    if (!value) {
        // Vercel sets NODE_ENV to 'production' by default.
        // We only want to use the test store for local development.
        if (process.env.NODE_ENV === 'production') {
            return undefined;
        }
        const { testStore } = require("./lib/test-store");
        return testStore.get(variableName);
    }
    return value;
}

process.env.Issuer = getEnv("Issuer", NETWORK);
process.env.PriceOracle = getEnv("PriceOracle", NETWORK);
process.env.Lender = getEnv("Lender", NETWORK)