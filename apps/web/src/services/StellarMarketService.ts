import { Horizon, Asset } from '@stellar/stellar-sdk';

// Using Testnet for Nirium v2.5
const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const server = new Horizon.Server(HORIZON_URL);

// Pair Definition (XLM / USDC Testnet)
const XLM = Asset.native();
// USDC Issuer on Testnet
const USDC = new Asset('USDC', 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5');

export const StellarMarketService = {
    // 1. Get current spot price (Instantaneous)
    async getSpotPrice() {
        try {
            // Using 'trades' endpoint to see the latest real execution
            const trades = await server.trades()
                .forAssetPair(XLM, USDC)
                .limit(1)
                .order('desc')
                .call();

            if (trades.records.length > 0) {
                const trade = trades.records[0];
                // Price = Counter / Base (depending on trade direction)
                // API returns effective price. Verify numerators/denominators if necessary.
                // For simplicity, we use the price from the response.
                if (trade.price) {
                    return parseFloat(trade.price.n) / parseFloat(trade.price.d);
                }
            }
        } catch (e) {
            console.warn("Failed to fetch spot price, using fallback", e);
        }
        return 0.12; // Initial fallback (if no recent trades on testnet)
    },

    // 2. Get Order Book (Depth)
    async getOrderBookDepth() {
        try {
            const orderbook = await server.orderbook(XLM, USDC).limit(50).call();

            // Helper function to normalize data for the texture
            const processOrders = (orders: any[]) => {
                // Find max volume to normalize visually (0.0 to 1.0)
                const maxVol = Math.max(...orders.map(o => parseFloat(o.amount)), 1.0);

                return orders.map(order => ({
                    price: parseFloat(order.price),
                    // Using logarithms to smooth visual spikes from "whales"
                    // normalizedVolume will be the G (Green) value of your texture
                    volume: Math.log(parseFloat(order.amount) + 1) / Math.log(maxVol + 1)
                }));
            };

            return {
                bids: processOrders(orderbook.bids),
                asks: processOrders(orderbook.asks)
            };
        } catch (e) {
            console.warn("Failed to fetch orderbook, returning empty", e);
            return { bids: [], asks: [] };
        }
    }
};
