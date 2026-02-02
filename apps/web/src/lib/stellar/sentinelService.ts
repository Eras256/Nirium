import { scValToNative, nativeToScVal, Contract, Address, rpc, TransactionBuilder, Account, Networks, Operation } from '@stellar/stellar-sdk';

// Placeholder for Sentinel Contract ID (replace with actual deployment ID)
const SENTINEL_CONTRACT_ID = 'CB64D3G7SM2754OVGGQA7W6S2...SENTINEL';
const RPC_URL = 'https://soroban-testnet.stellar.org';

const server = new rpc.Server(RPC_URL);

// Helper to build a simulation transaction
const buildSimulationTx = (operation: any) => {
    // Use a random "dummy" source account for read-only simulations
    // The account doesn't need to exist for simulations that don't check auth
    // We use a zeroed public key or a random one valid for local construction
    const dummySource = new Account("GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF", "0");

    return new TransactionBuilder(dummySource, {
        fee: "100",
        networkPassphrase: Networks.TESTNET
    })
        .addOperation(operation)
        .setTimeout(30)
        .build();
};

/**
 * Get working capital from Sentinel contract
 */
export const getWorkingCapital = async (tokenAddress: string): Promise<number> => {
    try {
        const contract = new Contract(SENTINEL_CONTRACT_ID);

        // Prepare argument: Address of the token
        const args = [nativeToScVal(tokenAddress, { type: 'address' })];

        // Wrap call in a transaction
        const operation = contract.call('get_working_capital', ...args);
        const tx = buildSimulationTx(operation);

        // Simulate transaction to get view data (read-only)
        const result = await server.simulateTransaction(tx);

        if (rpc.Api.isSimulationSuccess(result)) {
            // First result is the return value of the function
            const returnValue = result.result!.retval;
            return Number(scValToNative(returnValue));
        }

        return 0;
    } catch (error) {
        console.error("Error fetching working capital:", error);
        return 0;
    }
};

/**
 * Check if the given address is the Admin of the Sentinel
 */
export const isSentinelAdmin = async (address: string): Promise<boolean> => {
    try {
        const contract = new Contract(SENTINEL_CONTRACT_ID);
        const args = [nativeToScVal(address, { type: 'address' })];

        const operation = contract.call('is_admin', ...args);
        const tx = buildSimulationTx(operation);

        const result = await server.simulateTransaction(tx);

        if (rpc.Api.isSimulationSuccess(result)) {
            const returnValue = result.result!.retval;
            return scValToNative(returnValue) as boolean;
        }
        return false;
    } catch (error) {
        console.error("Error checking admin status:", error);
        return false;
    }
};

/**
 * Get total amount swept to yield protocols
 */
export const getTotalSwept = async (): Promise<number> => {
    try {
        const contract = new Contract(SENTINEL_CONTRACT_ID);
        const operation = contract.call('get_total_swept');
        const tx = buildSimulationTx(operation);

        const result = await server.simulateTransaction(tx);

        if (rpc.Api.isSimulationSuccess(result)) {
            const returnValue = result.result!.retval;
            return Number(scValToNative(returnValue));
        }
        return 0;
    } catch (error) {
        console.error("Error fetching total swept:", error);
        return 0;
    }
};

export const CONTRACT_ADDRESSES = {
    SENTINEL: SENTINEL_CONTRACT_ID
};
