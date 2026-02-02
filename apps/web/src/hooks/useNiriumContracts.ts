import { NIRIUM_CONTRACTS } from '@/lib/contracts';
import { useFreighter } from './useFreighter';
import {
    rpc,
    Contract,
    TransactionBuilder,
    Networks,
    TimeoutInfinite,
    nativeToScVal,
    xdr
} from '@stellar/stellar-sdk';
import { signTransaction } from '@stellar/freighter-api';

const RPC_URL = process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org';

export function useNiriumContracts() {
    const { address } = useFreighter();
    const server = new rpc.Server(RPC_URL);

    const checkConnection = () => {
        if (!address) throw new Error("Wallet not connected");
    };

    /**
     * Generic Contract Invocation
     */
    const invokeContract = async (
        contractId: string,
        method: string,
        args: xdr.ScVal[] = []
    ) => {
        checkConnection();
        // rpc.Server.getAccount returns the correct Account object for TxBuilder
        const account = await server.getAccount(address!);

        const contract = new Contract(contractId);
        const op = contract.call(method, ...args);

        const tx = new TransactionBuilder(account, {
            fee: '100',
            networkPassphrase: Networks.TESTNET,
        })
            .addOperation(op)
            .setTimeout(TimeoutInfinite)
            .build();

        // 1. Simulate
        const sim = await server.simulateTransaction(tx);

        if (!rpc.Api.isSimulationSuccess(sim)) {
            console.error("Simulation failed:", sim);
            throw new Error(`Simulation failed for ${method}: ${sim.error || 'Unknown error'}`);
        }

        // 2. Assemble (Auto-updates fees and footprint)
        const builtTx = rpc.assembleTransaction(tx, sim).build();

        // 3. Sign with Freighter
        const signedRes = await signTransaction(builtTx.toXDR(), {
            networkPassphrase: Networks.TESTNET
        });

        if (!signedRes.signedTxXdr) throw new Error("User declined signature");

        // 4. Submit
        const sendRes = await server.sendTransaction(
            TransactionBuilder.fromXDR(signedRes.signedTxXdr, Networks.TESTNET)
        );

        if (sendRes.status === 'PENDING') {
            return sendRes.hash;
        } else if (sendRes.status === 'ERROR') {
            // Soroban RPC error details
            console.error("Tx Submit Error:", sendRes);
            throw new Error("Transaction submission failed");
        }

        return sendRes.hash;
    };

    /**
     * Identity Pool: Deposit
     */
    const depositToPool = async (amountXlm: number) => {
        const amountSc = nativeToScVal(BigInt(Math.floor(amountXlm * 1e7)), { type: 'i128' });

        return invokeContract(
            NIRIUM_CONTRACTS.IDENTITY_POOL,
            'deposit',
            [
                nativeToScVal(address, { type: 'address' }), // from
                amountSc // amount
            ]
        );
    };

    /**
     * Read-Only Contract Call (Simulation)
     */
    const queryContract = async (
        contractId: string,
        method: string,
        args: xdr.ScVal[] = []
    ) => {
        checkConnection();
        const account = await server.getAccount(address!);

        const contract = new Contract(contractId);
        const op = contract.call(method, ...args);

        const tx = new TransactionBuilder(account, {
            fee: '100',
            networkPassphrase: Networks.TESTNET,
        })
            .addOperation(op)
            .setTimeout(TimeoutInfinite)
            .build();

        const sim = await server.simulateTransaction(tx);

        if (!rpc.Api.isSimulationSuccess(sim) || !sim.result || !sim.result.retval) {
            console.error("Query simulation failed:", sim);
            throw new Error(`Query failed for ${method}`);
        }

        return sim.result.retval;
    };

    return {
        invokeContract,
        queryContract,
        depositToPool,
        contracts: NIRIUM_CONTRACTS
    };
}
