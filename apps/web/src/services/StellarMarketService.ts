import { Horizon, Asset } from '@stellar/stellar-sdk';

// Usamos Testnet para Nirium v2.1
const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const server = new Horizon.Server(HORIZON_URL);

// Definición del par (XLM / USDC Testnet)
const XLM = Asset.native();
// USDC Issuer on Testnet provided in logic
const USDC = new Asset('USDC', 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5');

export const StellarMarketService = {
    // 1. Obtener el precio spot actual (Instantáneo)
    async getSpotPrice() {
        try {
            // Usamos el endpoint de 'trades' para ver la última ejecución real
            const trades = await server.trades()
                .forAssetPair(XLM, USDC)
                .limit(1)
                .order('desc')
                .call();

            if (trades.records.length > 0) {
                const trade = trades.records[0];
                // Precio = Counter / Base (dependiendo de la dirección del trade)
                // La API devuelve el precio efectivo. Verificar numeradores/denominadores si es necesario.
                // Para simplificar, usamos el price de la respuesta
                return parseFloat(trade.price.n) / parseFloat(trade.price.d);
            }
        } catch (e) {
            console.warn("Failed to fetch spot price, using fallback", e);
        }
        return 0.12; // Fallback inicial (si no hay trades recientes en testnet)
    },

    // 2. Obtener el Libro de Órdenes (Profundidad)
    async getOrderBookDepth() {
        try {
            const orderbook = await server.orderbook(XLM, USDC).limit(50).call();

            // Función auxiliar para normalizar datos para la textura
            const processOrders = (orders: any[]) => {
                // Encontramos el volumen máximo para normalizar visualmente (0.0 a 1.0)
                const maxVol = Math.max(...orders.map(o => parseFloat(o.amount)), 1.0);

                return orders.map(order => ({
                    price: parseFloat(order.price),
                    // Usamos logaritmo para suavizar picos visuales de "ballenas"
                    // normalizedVolume será el valor G (Green) de tu textura
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
