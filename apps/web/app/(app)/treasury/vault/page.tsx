'use client';

// ───────────────────────────────────────────────────────────────
// Consola del Treasury Node — desplegar e inspeccionar una bóveda DeFindex.
//
// El flujo entero es non-custodial y se ve: el servidor arma un XDR SIN
// firmar, la wallet del usuario lo firma, y el servidor solo lo transmite.
// Ninguna llave de Nirium participa en el despliegue.
//
// El rebalanceo NO está aquí a propósito: lo llama el RebalanceManager, que
// es el agente con su propia llave. Ponerle un botón al usuario sugeriría
// que él lo dispara, y no es así.
// ───────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TransactionBuilder, Keypair, Networks } from '@stellar/stellar-sdk';
import { ShieldCheck, ExternalLink, Loader2, Search, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { useFreighter } from '@/hooks/useFreighter';
import { useNetwork } from '@/context/NetworkContext';
import { useLanguage } from '@/context/LanguageContext';

const PASSPHRASES: Record<string, string> = {
    testnet: 'Test SDF Network ; September 2015',
    mainnet: 'Public Global Stellar Network ; September 2015',
};

const shorten = (s: string, n = 6) => (s && s.length > n * 2 ? `${s.slice(0, n)}…${s.slice(-n)}` : s);

// El nodo sirve estos textos solo en inglés y la página los renderiza literal
// (el API es superficie de copy). Se traducen aquí contra la cadena exacta que
// devuelve; si el nodo cambia el texto, cae al inglés — que es correcto,
// aunque no esté traducido. Preferible a inventar una traducción que no
// corresponda a lo que el nodo realmente declara.
const NODE_ES: Record<string, string> = {
    'rebalance between the vault own strategies': 'reacomodar entre las estrategias de la propia bóveda',
    'withdraw funds': 'retirar fondos',
    'change roles': 'cambiar roles',
    'pause or rescue': 'pausar o rescatar',
    'upgrade the contract': 'actualizar el contrato',
    'rebalance() takes no destination address — `to` is hardcoded to the vault itself, so withdrawal is not expressible.':
        'rebalance() no acepta dirección de destino — el `to` está fijo a la propia bóveda, así que retirar no es expresable.',
    'The client is the Manager and can call set_rebalance_manager to drop us unilaterally.':
        'El cliente es el Manager y puede llamar set_rebalance_manager para botarnos unilateralmente.',
    'DeFindex audited by OtterSec (2025-03-18): 16 findings, all 13 vulnerabilities resolved.':
        'DeFindex auditado por OtterSec (18-03-2025): 16 hallazgos, las 13 vulnerabilidades resueltas.',
    'Blend V2, independently audited three times.': 'Blend V2, auditado de forma independiente tres veces.',
    'The external pool itself and the configuration of each deployed instance.':
        'El pool externo en sí y la configuración de cada instancia desplegada.',
};

/**
 * Comprueba localmente que la firma sirve ANTES de enviarla.
 *
 * `txBadAuth` llega desde la red sin decir cuál de las dos cosas falló: la
 * cuenta o la red. Verificando aquí se distingue — y si la firma valida
 * contra la OTRA red, la causa es el selector de Freighter, no la cuenta.
 * Barato: es una verificación ed25519 sobre un hash que ya tenemos.
 */
function diagnoseSignature(signedXdr: string, expected: string, signer: string):
    'ok' | 'wrong-network' | 'wrong-account' {
    const check = (passphrase: string) => {
        try {
            const tx = TransactionBuilder.fromXDR(signedXdr, passphrase) as any;
            const hash = tx.hash();
            const kp = Keypair.fromPublicKey(signer);
            return (tx.signatures || []).some((s: any) => {
                try { return kp.verify(hash, s.signature()); } catch { return false; }
            });
        } catch { return false; }
    };
    if (check(expected)) return 'ok';
    const other = expected === Networks.PUBLIC ? Networks.TESTNET : Networks.PUBLIC;
    return check(other) ? 'wrong-network' : 'wrong-account';
}
const explorerTx = (net: string, h: string) =>
    `https://stellar.expert/explorer/${net === 'mainnet' ? 'public' : 'testnet'}/tx/${h}`;
const explorerContract = (net: string, c: string) =>
    `https://stellar.expert/explorer/${net === 'mainnet' ? 'public' : 'testnet'}/contract/${c}`;

type Info = {
    network: string;
    role: { held: string; address?: string | null; can: string[]; cannot: string[]; why: string; revocable: string };
    defindex: { factory: string; strategies: Record<string, string> };
    security: { audit: string; underlying: string; notCovered: string };
    fees: { vaultFeeBps: number };
};

export default function TreasuryVaultConsole() {
    const { address, isConnected, connect, signTransaction, getAddress } = useFreighter();
    const { network } = useNetwork();
    const { language } = useLanguage();
    const lang = (en: string, es: string) =>
        language === 'es' ? es : en;

    // Traduce lo que sirve el nodo; si no lo reconoce devuelve el original.
    const t = (s: string) =>
        (language === 'es' ? NODE_ES[s] : undefined) ?? s;

    const [info, setInfo] = useState<Info | null>(null);
    const [busy, setBusy] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Despliegue
    const [strategy, setStrategy] = useState('');
    const [asset, setAsset] = useState('');
    const [name, setName] = useState('Nirium Treasury');
    const [symbol, setSymbol] = useState('NTRS');
    const [deployed, setDeployed] = useState<{ hash: string } | null>(null);
    // Quién sostendrá el rol de RebalanceManager. En testnet lo pone el nodo
    // (el agente); en mainnet todavía no hay firmante nuestro, así que lo tiene
    // que decidir quien despliega — y conviene que lo vea, no que lo adivine.
    const [rebalanceManager, setRebalanceManager] = useState('');
    // Reconocimiento de riesgo. Vive en el estado y NO se persiste: Payouts ya
    // exige aceptación explícita antes de mover dinero y esta consola era la
    // única superficie con fondos reales que no pedía nada. Por sesión y no en
    // localStorage a propósito — una casilla que alguien marcó hace meses no es
    // un reconocimiento, es un mueble.
    const [acknowledged, setAcknowledged] = useState(false);
    // En mainnet el dueño decide a quién nombra encargado; el nodo no lo
    // rellena. No es que no podamos —el firmante existe y corre— es que el
    // rebalanceo autónomo con dinero de terceros es invite-only mientras cierra
    // la revisión legal, y rellenar el campo prometería un servicio que hoy no
    // se presta.
    const nodeFillsRole = network !== 'mainnet';

    // Bóvedas desplegadas desde ESTE navegador. No es un índice on-chain: el
    // factory no permite listar por manager sin recorrer las ~200 existentes.
    // Es una libreta local para no perder la dirección al recargar — y se dice
    // que es local, para que nadie la confunda con la fuente de verdad.
    const [mine, setMine] = useState<{ id: string; label: string; network: string }[]>([]);
    const REMEMBERED = 'nirium_treasury_vaults';

    // El registro del servidor manda: te sigue entre computadoras. La libreta
    // local queda como respaldo para lo desplegado antes de que existiera la
    // tabla, y para cuando Supabase no responda.
    useEffect(() => {
        let cancelled = false;
        const local = (): { id: string; label: string; network: string }[] => {
            try {
                const saved = JSON.parse(localStorage.getItem(REMEMBERED) || '[]');
                return Array.isArray(saved) ? saved.filter((v: any) => v?.network === network) : [];
            } catch { return []; }
        };
        setMine(local());

        // SIN wallet conectada no se pide el registro: la tabla guarda las
        // bóvedas de TODOS los clientes de la red, y pedirla sin filtro
        // enseñaba las ajenas a cualquiera que abriera la página. El filtro
        // por manager lo aplica el servidor; mandarlo no es cosmética.
        if (!address) { return () => { cancelled = true; }; }

        fetch(`/api/treasury/vaults?network=${network}&manager=${encodeURIComponent(address)}`)
            .then((r) => r.json())
            .then((d) => {
                if (cancelled || !d?.ok) return;
                const remote = (d.vaults || []).map((v: any) => ({
                    id: v.vault, label: v.label || 'vault', network,
                }));
                // Unir sin duplicar: el servidor primero, lo local después.
                const seen = new Set(remote.map((v: any) => v.id));
                const merged = [...remote, ...local().filter((v) => !seen.has(v.id))];
                setMine(merged);
                // Cargar la más reciente al entrar: tener la lista y la pantalla
                // vacía deja el trabajo a medias después de cada recarga.
                if (merged[0]) {
                    setLookup(merged[0].id);
                    inspectVault(merged[0].id);
                }
            })
            .catch(() => { /* sin registro remoto seguimos con la libreta local */ });

        return () => { cancelled = true; };
    }, [network, address]);

    const remember = (id: string, label: string) => {
        try {
            const all = JSON.parse(localStorage.getItem(REMEMBERED) || '[]');
            const list = Array.isArray(all) ? all : [];
            if (list.some((v: any) => v?.id === id)) return;
            const next = [{ id, label, network }, ...list].slice(0, 20);
            localStorage.setItem(REMEMBERED, JSON.stringify(next));
            setMine(next.filter((v: any) => v.network === network));
        } catch { /* almacenamiento lleno o bloqueado: no vale romper el flujo */ }
    };

    // Inspección · depósito · rebalanceo
    const [lookup, setLookup] = useState('');
    const [vault, setVault] = useState<any>(null);
    const [amount, setAmount] = useState('1');
    const [receipt, setReceipt] = useState<{ hash: string; what: string } | null>(null);

    // Los montos viajan en stroops (7 decimales) como string: un i128 no
    // sobrevive a un number de JavaScript.
    const toStroops = (v: string) => {
        const n = Number(v);
        if (!isFinite(n) || n <= 0) return null;
        return BigInt(Math.round(n * 10_000_000)).toString();
    };
    const fromStroops = (v: string | number) => (Number(v) / 10_000_000).toLocaleString(undefined, { maximumFractionDigits: 7 });

    const funds = (vault?.totalManagedFunds || [])[0];
    const strategyOf = (f: any) => f?.strategy_allocations?.[0]?.strategy_address as string | undefined;

    const guardWallet = async () => {
        if (!isConnected || !address) { await connect(); return false; }
        const active = await getAddress();
        if (active && active !== address) {
            setError(lang(
                `Your wallet is on a different account than the connected one (${shorten(active)}).`,
                `Tu wallet está en una cuenta distinta a la conectada (${shorten(active)}).`));
            return false;
        }
        return true;
    };

    /**
     * Saca el dinero de la bóveda de vuelta a tu wallet.
     *
     * Faltaba, y era el hueco más grande: se podía depositar y no había forma
     * de recuperarlo desde aquí. El flujo que probamos —desplegar, depositar,
     * reacomodar— nunca lo necesita, y por eso no se notó; pero es lo primero
     * que pregunta quien pone dinero de verdad.
     *
     * Sin monto retira TODO. Pedir un número exacto de participaciones a siete
     * decimales es una trampa, y "sacar todo" es lo que se quiere casi siempre.
     */
    const withdraw = async () => {
        if (!vault?.vault) return;
        setError(null); setReceipt(null);
        if (!(await guardWallet()) || !address) return;
        try {
            setBusy('withdraw');
            const built = await fetch('/api/treasury/withdraw', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ walletAddress: address, vault: vault.vault, network }),
            }).then((r) => r.json());
            if (!built.ok) throw new Error(built.error || built.hint || 'build failed');

            const res = await signTransaction(built.xdr, { networkPassphrase: PASSPHRASES[network], address: address ?? undefined });
            const signedXdr = typeof res === 'string' ? res : (res as any).signedTxXdr;
            if (!signedXdr) throw new Error('wallet returned no signed transaction');

            const verdict = diagnoseSignature(signedXdr, PASSPHRASES[network], address!);
            if (verdict === 'wrong-network') {
                throw new Error(lang(`Your wallet signed for the other network. Switch Freighter to ${network}.`,
                                     `Tu wallet firmó para la otra red. Cambia Freighter a ${network}.`));
            }
            if (verdict === 'wrong-account') {
                throw new Error(lang('The signature does not belong to the connected account.',
                                     'La firma no corresponde a la cuenta conectada.'));
            }

            const sent = await fetch('/api/treasury/submit', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ walletAddress: address, signedXdr, network }),
            }).then((r) => r.json());
            if (!sent.ok) throw new Error(sent.error || 'submit failed');

            setReceipt({ hash: sent.hash, what: lang('Withdrawn to your wallet', 'Retirado a tu wallet') });
            await inspectVault(vault.vault);
        } catch (e: any) {
            setError(e?.message || String(e));
        } finally {
            setBusy(null);
        }
    };

    const deposit = async () => {
        if (!vault?.vault) return;
        const stroops = toStroops(amount);
        if (!stroops) { setError(lang('Enter a positive amount.', 'Escribe un monto positivo.')); return; }
        setError(null); setReceipt(null);
        if (!(await guardWallet()) || !address) return;
        try {
            setBusy('deposit');
            const built = await fetch('/api/treasury/deposit', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ walletAddress: address, vault: vault.vault, amounts: [stroops], invest: true, network }),
            }).then((r) => r.json());
            if (!built.ok) throw new Error(built.error || built.hint || 'build failed');

            const res = await signTransaction(built.xdr, { networkPassphrase: PASSPHRASES[network], address: address ?? undefined });
            const signedXdr = typeof res === 'string' ? res : (res as any).signedTxXdr;
            if (!signedXdr) throw new Error('wallet returned no signed transaction');

            const verdict = diagnoseSignature(signedXdr, PASSPHRASES[network], address!);
            if (verdict !== 'ok') {
                setError(verdict === 'wrong-network'
                    ? lang(`Your wallet signed for the other network. Switch Freighter to ${network}.`,
                           `Tu wallet firmó para la otra red. Cambia Freighter a ${network}.`)
                    : lang('The signature does not belong to the connected account.',
                           'La firma no corresponde a la cuenta conectada.'));
                return;
            }

            const sent = await fetch('/api/treasury/submit', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ walletAddress: address, signedXdr, network }),
            }).then((r) => r.json());
            if (!sent.ok) throw new Error(sent.error || 'submit failed');

            setReceipt({ hash: sent.hash, what: lang('Deposit', 'Depósito') });
            await inspect();
        } catch (e: any) {
            setError(e?.message || String(e));
        } finally { setBusy(null); }
    };

    // El agente firma este con SU llave — el usuario no firma nada aquí.
    const runRebalance = async (kind: 'Invest' | 'Unwind') => {
        const strategy = strategyOf(funds);
        if (!vault?.vault || !strategy) return;
        const stroops = toStroops(amount);
        if (!stroops) { setError(lang('Enter a positive amount.', 'Escribe un monto positivo.')); return; }
        setError(null); setReceipt(null);
        try {
            setBusy(kind);
            const r = await fetch('/api/treasury/rebalance', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    walletAddress: address, vault: vault.vault, network,
                    instructions: [{ kind, strategy, amount: stroops }],
                }),
            }).then((res) => res.json());
            if (!r.ok) throw new Error(r.hint ? `${r.error} — ${r.hint}` : (r.error || 'rebalance failed'));
            setReceipt({ hash: r.hash, what: kind === 'Invest' ? lang('Invested', 'Puesto a trabajar') : lang('Unwound', 'Retirado a la bóveda') });
            await inspect();
        } catch (e: any) {
            setError(e?.message || String(e));
        } finally { setBusy(null); }
    };

    // El activo lo declara la estrategia — preguntarlo evita el par desalineado
    // que el vault rechaza en su constructor con un error ilegible.
    useEffect(() => {
        if (!strategy) { setAsset(''); return; }
        let cancelled = false;
        setAsset('');
        fetch(`/api/treasury/strategy?strategy=${encodeURIComponent(strategy)}&network=${network}`)
            .then((r) => r.json())
            .then((d) => { if (!cancelled && d?.ok) setAsset(d.asset); })
            .catch(() => {});
        return () => { cancelled = true; };
    }, [strategy, network]);

    useEffect(() => {
        setInfo(null); setDeployed(null); setVault(null); setError(null);
        fetch(`/api/treasury/info?network=${network}`)
            .then((r) => r.json())
            .then((d) => {
                setInfo(d);
                const strats = Object.values(d?.defindex?.strategies || {}) as string[];
                setStrategy(strats[0] || '');
            })
            .catch(() => setError(lang('Could not reach the treasury node.', 'No se pudo contactar el nodo de tesorería.')));
    }, [network]);

    const deploy = async () => {
        if (!isConnected || !address) { await connect(); return; }
        setError(null); setDeployed(null);
        try {
            // La tx se arma con la cuenta CONECTADA como source. Si la wallet
            // cambió de cuenta activa después de conectar, firmaría con la otra
            // y la red la rechaza con txBadAuth — un error que no dice nada.
            // Mismo guard que usa payroll por la misma razón.
            const active = await getAddress();
            if (active && active !== address) {
                setError(lang(
                    `Your wallet is on a different account than the connected one. Connected: ${shorten(address)} · active in wallet: ${shorten(active)}. Switch back in the wallet, or reconnect.`,
                    `Tu wallet está en una cuenta distinta a la conectada. Conectada: ${shorten(address)} · activa en la wallet: ${shorten(active)}. Cámbiala en la wallet, o reconecta.`));
                return;
            }

            setBusy('build');
            const built = await fetch('/api/treasury/deploy', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    walletAddress: address, network, name, symbol,
                    assets: [{ address: asset, strategies: [{ address: strategy, name: 'blend-autocompound' }] }],
                    // Solo cuando el nodo no tiene firmante propio en esta red.
                    // En testnet va vacío para que el default del nodo (el agente)
                    // se aplique, que es el caso que queremos demostrar.
                    ...(rebalanceManager ? { rebalanceManager } : {}),
                }),
            }).then((r) => r.json());
            if (!built.ok) throw new Error(built.error || built.hint || 'build failed');

            setBusy('sign');
            // Anclado a la dirección conectada: sin esto la wallet puede firmar
            // con otra cuenta activa y la tx sale con tx_bad_auth.
            const res = await signTransaction(built.xdr, { networkPassphrase: PASSPHRASES[network], address });
            const signedXdr = typeof res === 'string' ? res : (res as any).signedTxXdr;
            if (!signedXdr) throw new Error('wallet returned no signed transaction');

            // Diagnóstico local antes de gastar un envío: la red devuelve
            // txBadAuth sin distinguir entre cuenta equivocada y red equivocada.
            const verdict = diagnoseSignature(signedXdr, PASSPHRASES[network], address);
            if (verdict === 'wrong-network') {
                setError(lang(
                    `Your wallet signed for the other network. The site is on ${network} — switch Freighter to ${network} and try again.`,
                    `Tu wallet firmó para la otra red. El sitio está en ${network} — cambia Freighter a ${network} y vuelve a intentar.`));
                return;
            }
            if (verdict === 'wrong-account') {
                setError(lang(
                    `The signature does not belong to ${shorten(address)}. Check which account is active in your wallet.`,
                    `La firma no corresponde a ${shorten(address)}. Revisa qué cuenta está activa en tu wallet.`));
                return;
            }

            setBusy('submit');
            const sent = await fetch('/api/treasury/submit', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ walletAddress: address, signedXdr, network }),
            }).then((r) => r.json());
            if (!sent.ok) throw new Error(sent.error || 'submit failed');

            setDeployed({ hash: sent.hash });

            // Cargarla sola: acabar de desplegar y tener que copiar la dirección
            // desde el explorador para poder depositar es mandar al usuario
            // fuera justo cuando debería seguir aquí.
            if (sent.contract) {
                remember(sent.contract, name.trim() || 'vault');
                setLookup(sent.contract);
                await inspectVault(sent.contract);
            }
        } catch (e: any) {
            setError(e?.message || String(e));
        } finally {
            setBusy(null);
        }
    };

    /**
     * Entrega el rol de RebalanceManager. Lo firma el Manager — o sea tú —
     * porque delegar un permiso sobre tu bóveda no lo puede hacer quien lo
     * recibe. Reusa el mismo camino de firma que el despliegue: XDR sin firmar
     * del servidor, verificación local de la firma, y envío que espera
     * confirmación antes de dar el hash por bueno.
     */
    const handOverRole = async (to: string) => {
        if (!isConnected) { connect(); return; }
        setError(null);
        try {
            setBusy('role');
            const guard = await getAddress();
            if (guard && guard !== address) {
                throw new Error(lang(
                    'Freighter switched accounts. Reconnect and try again.',
                    'Freighter cambió de cuenta. Reconecta e inténtalo otra vez.'));
            }
            const built = await fetch('/api/treasury/set-rebalance-manager', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ walletAddress: address, vault: lookup.trim(), rebalanceManager: to, network }),
            }).then((r) => r.json());
            if (!built.ok) throw new Error(built.error || built.hint || 'build failed');

            const res = await signTransaction(built.xdr, { networkPassphrase: PASSPHRASES[network], address: address ?? undefined });
            const signedXdr = typeof res === 'string' ? res : (res as any).signedTxXdr;
            if (!signedXdr) throw new Error('wallet returned no signed transaction');

            const verdict = diagnoseSignature(signedXdr, PASSPHRASES[network], address!);
            if (verdict === 'wrong-network') {
                throw new Error(lang(
                    'Your wallet signed for the other network. Switch Freighter and retry.',
                    'Tu wallet firmó para la otra red. Cambia Freighter e inténtalo otra vez.'));
            }
            if (verdict === 'wrong-account') throw new Error('the signature does not match the connected account');

            const sent = await fetch('/api/treasury/submit', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ walletAddress: address, signedXdr, network }),
            }).then((r) => r.json());
            if (!sent.ok) throw new Error(sent.error || 'submit failed');

            await inspectVault(lookup.trim());
        } catch (e: any) {
            setError(e?.message || String(e));
        } finally {
            setBusy(null);
        }
    };

    const inspectVault = async (id: string) => {
        setError(null); setVault(null);
        try {
            setBusy('lookup');
            const holder = address ? `&holder=${encodeURIComponent(address)}` : '';
            const d = await fetch(`/api/treasury/vault?vault=${encodeURIComponent(id.trim())}&network=${network}${holder}`).then((r) => r.json());
            if (!d.ok) throw new Error(d.error || 'lookup failed');
            setVault(d);
            // Una bóveda que ya se abrió una vez merece quedar en la libreta,
            // se haya desplegado aquí o no.
            remember(id.trim(), d?.roles?.manager === address ? 'yours' : 'vault');
        } catch (e: any) {
            setError(e?.message || String(e));
        } finally {
            setBusy(null);
        }
    };

    const inspect = () => inspectVault(lookup);

    // La carga automática ocurre al montar, cuando Freighter todavía no
    // reconectó — así que `holder` va vacío y el saldo no aparece. Al llegar
    // la dirección se relee, que es cuando la respuesta puede incluirlo.
    useEffect(() => {
        if (address && vault?.vault && vault.holderBalance === undefined) {
            inspectVault(vault.vault);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [address]);

    return (
        <main className="min-h-screen bg-black text-white antialiased">
            <div className="max-w-4xl mx-auto px-6 py-12 space-y-10">
                <header>
                    <div className="flex items-center gap-3 mb-3">
                        <ShieldCheck className="w-6 h-6 text-stellar-teal" />
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight uppercase">
                            {lang('Treasury Vault', 'Bóveda de Tesorería')}
                        </h1>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-black uppercase border ${
                            network === 'mainnet'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>{network}</span>
                    </div>
                    <p className="text-white/55 text-sm leading-relaxed max-w-2xl">
                        {lang(
                            'Deploy a DeFindex vault that you own. Nirium takes only the RebalanceManager role — it can move funds between the strategies inside your vault, and nothing else.',
                            'Despliega una bóveda de DeFindex que tú posees. Nirium toma únicamente el rol de RebalanceManager: puede mover fondos entre las estrategias de tu bóveda, y nada más.')}
                    </p>
                </header>

                {/* Lo que el rol NO puede hacer, servido por el propio nodo. */}
                {info?.role && (
                    <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 mb-4">
                            {lang('What the agent can and cannot do', 'Qué puede y qué no puede el agente')}
                        </h2>
                        <div className="grid sm:grid-cols-2 gap-4 text-xs">
                            <div className="space-y-2">
                                {info.role.can.map((c) => (
                                    <div key={c} className="flex gap-2 items-start text-white/70">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />{t(c)}
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-2">
                                {info.role.cannot.map((c) => (
                                    <div key={c} className="flex gap-2 items-start text-white/50">
                                        <XCircle className="w-3.5 h-3.5 text-white/25 shrink-0 mt-0.5" />{t(c)}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <p className="mt-4 pt-4 border-t border-white/5 text-[11px] text-white/40 leading-relaxed">
                            {t(info.role.why)} {t(info.role.revocable)}
                        </p>
                        <p className="mt-2 text-[11px] text-white/40 leading-relaxed">
                            {t(info.security.audit)} {t(info.security.underlying)}{' '}
                            <span className="text-amber-400/70">{lang('Not covered:', 'No cubierto:')} {t(info.security.notCovered)}</span>
                        </p>
                    </section>
                )}

                {/* Desplegar */}
                <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">
                        {lang('1 · Deploy your vault', '1 · Despliega tu bóveda')}
                    </h2>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <label className="block">
                            <span className="text-[10px] uppercase tracking-widest text-white/40">{lang('Name', 'Nombre')}</span>
                            <input value={name} onChange={(e) => setName(e.target.value)}
                                className="mt-1 w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-stellar-teal/40" />
                        </label>
                        <label className="block">
                            <span className="text-[10px] uppercase tracking-widest text-white/40">{lang('Symbol', 'Símbolo')}</span>
                            <input value={symbol} onChange={(e) => setSymbol(e.target.value)}
                                className="mt-1 w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-stellar-teal/40" />
                        </label>
                        <label className="block sm:col-span-2">
                            <span className="text-[10px] uppercase tracking-widest text-white/40">{lang('Strategy', 'Estrategia')}</span>
                            <select value={strategy} onChange={(e) => setStrategy(e.target.value)}
                                className="mt-1 w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-stellar-teal/40">
                                {Object.entries(info?.defindex?.strategies || {}).map(([k, v]) => (
                                    <option key={v} value={v} className="bg-[#0A0A0A]">{k} — {shorten(v as string, 8)}</option>
                                ))}
                            </select>
                        </label>
                        {/* Derivado, no editable: la estrategia declara su activo y el
                            vault rechaza el par desalineado con un error ilegible. */}
                        <div className="block sm:col-span-2">
                            <span className="text-[10px] uppercase tracking-widest text-white/40">
                                {lang('Asset — read from the strategy', 'Activo — leído de la estrategia')}
                            </span>
                            <div className="mt-1 w-full bg-black/30 border border-white/5 rounded-xl px-3 py-2 text-xs font-mono text-white/50 break-all">
                                {asset || lang('reading…', 'leyendo…')}
                            </div>
                        </div>
                    </div>

                    <p className="text-[11px] text-white/40 leading-relaxed">
                        {lang(
                            'You sign with your own wallet. You become the Manager, the Emergency Manager and the Fee Receiver — all three. The vault fee is set to 0.',
                            'Firmas con tu propia wallet. Tú quedas como Manager, Emergency Manager y Fee Receiver — los tres. La comisión de la bóveda queda en 0.')}
                    </p>

                    {/* En mainnet Nirium todavía no sostiene el rol: Box B no tiene
                        llave por diseño, y nombrar la del agente de testnet reusaría
                        una misma llave en las dos redes. Se dice y se deja desplegar
                        — la bóveda y el depósito son iguales, y el Manager puede
                        entregar el rol después con set_rebalance_manager. */}
                    {!nodeFillsRole && (
                        <div className="rounded-xl border border-amber-400/25 bg-amber-400/[0.05] p-4 space-y-3">
                            <p className="text-[11px] text-amber-400/90 leading-relaxed">
                                {lang(
                                    'This vault is yours end to end: name an address you control as RebalanceManager. Nirium\u2019s autonomous rebalancing on mainnet is invite-only while the legal review closes — when it opens, you hand the role over with set_rebalance_manager, and you can take it back the same way.',
                                    'Esta b\u00f3veda es tuya de punta a punta: pon una direcci\u00f3n tuya como RebalanceManager. El rebalanceo aut\u00f3nomo de Nirium en mainnet es invite-only mientras cierra la revisi\u00f3n legal — cuando abra, le entregas el rol con set_rebalance_manager, y te lo puedes quedar de vuelta igual.')}
                            </p>
                            <input
                                value={rebalanceManager}
                                onChange={(e) => setRebalanceManager(e.target.value.trim())}
                                placeholder="G… RebalanceManager"
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 font-mono text-[11px] text-white/80 outline-none focus:border-amber-400/40"
                            />
                            {/* El contrato exige que difieran: una bóveda donde el
                                mismo dueño manda y reacomoda es válida, pero deja de
                                demostrar la separación que sostiene todo el modelo. */}
                            {rebalanceManager && rebalanceManager === address && (
                                <p className="text-[11px] text-red-400">
                                    {lang(
                                        'This is the same address that will be Manager. The node requires them to differ — use a second address you control.',
                                        'Es la misma dirección que quedará como Manager. El nodo exige que sean distintas — usa una segunda dirección tuya.')}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
                        <p className="text-[11px] text-white/50 leading-relaxed">
                            {lang(
                                'Before you continue: the vault is a DeFindex contract — not Nirium’s — and the funds are yours from the first block; Nirium never holds them and cannot withdraw them. DeFindex, the protocol behind the vault, takes 20% of the yield generated; Nirium charges no percentage of your capital. Smart contracts carry risk even when audited. This is software, not financial advice, and it is not offered where local law restricts these services.',
                                'Antes de seguir: la bóveda es un contrato de DeFindex —no de Nirium— y los fondos son tuyos desde el primer bloque; Nirium nunca los sostiene y no puede retirarlos. DeFindex, el protocolo de la bóveda, se lleva 20% del rendimiento generado; Nirium no cobra ningún porcentaje de tu capital. Los contratos inteligentes tienen riesgo aunque estén auditados. Esto es software, no asesoría financiera, y no se ofrece donde la ley local restrinja estos servicios.')}
                        </p>
                        <label className="flex items-start gap-2.5 cursor-pointer">
                            <input type="checkbox" checked={acknowledged}
                                onChange={(e) => setAcknowledged(e.target.checked)}
                                className="mt-0.5 accent-stellar-teal" />
                            <span className="text-[11px] text-white/70">
                                {lang('I understand, and I am not in a jurisdiction where this is restricted.',
                                      'Entiendo, y no estoy en una jurisdicción donde esto esté restringido.')}
                            </span>
                        </label>
                    </div>

                    <button onClick={deploy} disabled={!acknowledged || !!busy || !strategy || !asset || (!nodeFillsRole && (!rebalanceManager || rebalanceManager === address))}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stellar-teal/10 border border-stellar-teal/30 text-stellar-teal text-sm font-bold hover:bg-stellar-teal/20 disabled:opacity-40 transition-colors">
                        {busy && ['build', 'sign', 'submit'].includes(busy) && <Loader2 className="w-4 h-4 animate-spin" />}
                        {!isConnected
                            ? lang('Connect wallet', 'Conectar wallet')
                            : busy === 'build' ? lang('Building…', 'Armando…')
                            : busy === 'sign' ? lang('Waiting for signature…', 'Esperando firma…')
                            : busy === 'submit' ? lang('Submitting…', 'Enviando…')
                            : lang('Deploy vault', 'Desplegar bóveda')}
                    </button>

                    {deployed && (
                        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs space-y-2">
                            <p className="text-emerald-400 font-bold">{lang('Confirmed on-chain.', 'Confirmada on-chain.')}</p>
                            <a href={explorerTx(network, deployed.hash)} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-stellar-teal font-mono hover:underline break-all">
                                {shorten(deployed.hash, 10)} <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                        </div>
                    )}
                </section>

                {/* Inspeccionar */}
                <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">
                        {lang('2 · Verify, deposit and rebalance', '2 · Verifica, deposita y rebalancea')}
                    </h2>
                    <div className="flex gap-2">
                        <input value={lookup} onChange={(e) => setLookup(e.target.value)} spellCheck={false}
                            placeholder="C..."
                            className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-stellar-teal/40" />
                        <button onClick={inspect} disabled={!!busy || !lookup.trim()}
                            className="px-4 py-2 rounded-xl border border-white/15 text-sm font-bold text-white/70 hover:text-white hover:bg-white/5 disabled:opacity-40 transition-colors">
                            {busy === 'lookup' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                        </button>
                    </div>

                    {mine.length > 0 && (
                        <div className="space-y-1.5">
                            <p className="text-[9px] uppercase tracking-widest text-white/35">
                                {lang('Your vaults', 'Tus bóvedas')}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {mine.map((v) => (
                                    <button key={v.id}
                                        onClick={() => { setLookup(v.id); inspectVault(v.id); }}
                                        disabled={!!busy}
                                        className={`px-2.5 py-1 rounded-lg border text-[10px] font-mono transition-colors disabled:opacity-40 ${
                                            lookup === v.id
                                                ? 'border-stellar-teal/40 bg-stellar-teal/10 text-stellar-teal'
                                                : 'border-white/10 text-white/50 hover:text-white/80 hover:bg-white/5'
                                        }`}>
                                        {shorten(v.id, 5)}
                                    </button>
                                ))}
                            </div>
                            <p className="text-[10px] text-white/30 leading-relaxed">
                                {lang(
                                    'A registry for convenience, not the source of truth — the roles that matter live in the contract. Vaults deployed here are recorded server-side and follow you across machines.',
                                    'Un registro por comodidad, no la fuente de verdad — los roles que importan viven en el contrato. Las bóvedas desplegadas aquí quedan registradas del lado del servidor y te siguen entre computadoras.')}
                            </p>
                        </div>
                    )}

                    {vault?.roles && (
                        <div className="rounded-xl border border-white/10 bg-black/40 p-4 font-mono text-[11px] space-y-2">
                            {Object.entries(vault.roles).map(([role, addr]) => (
                                <div key={role} className="flex justify-between gap-3">
                                    <span className="text-white/40">{role}</span>
                                    <span className="text-white/70 break-all">{shorten(addr as string, 6)}</span>
                                </div>
                            ))}
                            {/* La comprobación que sostiene el argumento entero. */}
                            {vault.niriumIsRebalanceManagerOnly !== null && (
                                <div className={`mt-3 pt-3 border-t border-white/5 flex gap-2 items-start ${
                                    vault.niriumIsRebalanceManagerOnly ? 'text-emerald-400' : 'text-amber-400'
                                }`}>
                                    {vault.niriumIsRebalanceManagerOnly
                                        ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                        : <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />}
                                    <span>
                                        {vault.niriumIsRebalanceManagerOnly
                                            ? lang('Nirium holds the rebalance role only. You are the Manager.',
                                                   'Nirium solo tiene el rol de rebalanceo. Tú eres el Manager.')
                                            : lang('This vault does not name Nirium as rebalance manager.',
                                                   'Esta bóveda no nombra a Nirium como rebalance manager.')}
                                    </span>
                                </div>
                            )}
                            {/* Entregar el rol es acción del Manager, y por eso el
                                botón solo existe cuando el que mira ES el Manager.
                                La misma puerta sirve para quitárnoslo: si el nodo
                                pudiera nombrarse a sí mismo, "puedes botarnos"
                                dejaría de ser cierto. */}
                            {info?.role?.address
                                && vault.roles.manager === address
                                && vault.roles.rebalanceManager !== info.role.address && (
                                <button
                                    onClick={() => handOverRole(info.role!.address!)}
                                    disabled={!!busy}
                                    className="mt-3 w-full px-3 py-2 rounded-lg border border-stellar-teal/30 bg-stellar-teal/10 text-stellar-teal text-[11px] font-bold hover:bg-stellar-teal/20 disabled:opacity-40 transition-colors"
                                >
                                    {busy === 'role'
                                        ? lang('Handing over…', 'Entregando…')
                                        : lang(`Hand the rebalance role to Nirium (${shorten(info.role.address, 5)})`,
                                               `Entregar el rol de rebalanceo a Nirium (${shorten(info.role.address, 5)})`)}
                                </button>
                            )}
                            <a href={explorerContract(network, lookup.trim())} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-stellar-teal hover:underline pt-2">
                                {lang('Open in explorer', 'Abrir en el explorador')} <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    )}

                    {/* Los dos cajones. El agente solo pasa dinero de uno al otro:
                        nunca fuera del mueble. Verlo lado a lado es la demostración. */}
                    {funds && (
                        <div className="grid grid-cols-2 gap-3">
                            {/* Clicables: depositar 1.0 deja 0.9999999 invertido por
                                redondeo de participaciones, así que escribir el monto
                                exacto a mano es una trampa. */}
                            <button onClick={() => setAmount(String(Number(funds.idle_amount) / 10_000_000))}
                                className="rounded-xl border border-white/10 bg-black/40 p-4 text-left hover:border-white/25 transition-colors">
                                <p className="text-[9px] uppercase tracking-widest text-white/40 mb-1">
                                    {lang('Idle in vault', 'Quieto en la bóveda')}
                                </p>
                                <p className="text-lg font-mono font-black text-white/80">{fromStroops(funds.idle_amount)}</p>
                            </button>
                            <button onClick={() => setAmount(String(Number(funds.invested_amount) / 10_000_000))}
                                className="rounded-xl border border-white/10 bg-black/40 p-4 text-left hover:border-stellar-teal/30 transition-colors">
                                <p className="text-[9px] uppercase tracking-widest text-white/40 mb-1">
                                    {lang('Working in strategy', 'Trabajando en la estrategia')}
                                </p>
                                <p className="text-lg font-mono font-black text-stellar-teal">{fromStroops(funds.invested_amount)}</p>
                            </button>
                        </div>
                    )}

                    {/* Visible siempre, aunque desactivado: esconder los controles
                        hasta cargar una bóveda hacía que no se supiera que existen. */}
                    {!vault?.ok && (
                        <p className="text-[11px] text-white/35 leading-relaxed pt-2 border-t border-white/5">
                            {lang(
                                'Paste a vault id in the box above to deposit and move funds between idle and the strategy. A vault you deploy in step 1 loads here on its own.',
                                'Pega el id de una bóveda en el cuadro de arriba para depositar y mover fondos entre lo quieto y la estrategia. Si despliegas una en el paso 1, se carga aquí sola.')}
                        </p>
                    )}

                    {vault?.ok && (
                        <div className="space-y-3 pt-2 border-t border-white/5">
                            <label className="block">
                                <span className="text-[10px] uppercase tracking-widest text-white/40">
                                    {lang('Amount', 'Monto')}
                                </span>
                                <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal"
                                    className="mt-1 w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:border-stellar-teal/40" />
                            </label>

                            {/* Decirlo ANTES de firmar. Sin saldo, el contrato
                                responde Error(#10) enterrado en 10 eventos. */}
                            {vault.holderBalance !== undefined && (
                                <div className={`rounded-xl border px-4 py-2.5 text-[11px] ${
                                    Number(vault.holderBalance) > 0
                                        ? 'border-white/10 bg-white/[0.02] text-white/50'
                                        : 'border-amber-400/25 bg-amber-400/5 text-amber-400/90'
                                }`}>
                                    {Number(vault.holderBalance) > 0
                                        ? lang(
                                            `Your balance of this vault asset: ${fromStroops(vault.holderBalance)}`,
                                            `Tu saldo del activo de esta bóveda: ${fromStroops(vault.holderBalance)}`)
                                        : lang(
                                            'You hold none of this vault asset, so a deposit will fail. Fund the wallet, or use a vault whose asset you already hold.',
                                            'No tienes nada del activo de esta bóveda, así que el depósito va a fallar. Fondea la wallet, o usa una bóveda cuyo activo sí tengas.')}
                                </div>
                            )}

                            <div className="flex flex-wrap gap-2">
                                <button onClick={deposit} disabled={!acknowledged || !!busy}
                                    className="px-4 py-2 rounded-xl bg-stellar-teal/10 border border-stellar-teal/30 text-stellar-teal text-xs font-bold hover:bg-stellar-teal/20 disabled:opacity-40 transition-colors inline-flex items-center gap-2">
                                    {busy === 'deposit' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                    {lang('Deposit (you sign)', 'Depositar (firmas tú)')}
                                </button>
                                <button onClick={withdraw} disabled={!!busy}
                                    className="px-4 py-2 rounded-xl border border-white/15 text-xs font-bold text-white/70 hover:text-white hover:bg-white/5 disabled:opacity-40 transition-colors inline-flex items-center gap-2">
                                    {busy === 'withdraw' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                    {lang('Withdraw everything (you sign)', 'Retirar todo (firmas tú)')}
                                </button>
                                {/* En mainnet NO hay botón de rebalanceo, y la ausencia es
                                    el punto. El firmante decide por su cuenta cada 10 min
                                    sobre las bóvedas que tiene autorizadas — si el usuario
                                    pudiera dispararlo, no sería autónomo. En testnet sí
                                    van, porque ahí el agente firma a demanda y esa ES la
                                    demostración. */}
                                {network !== 'mainnet' && (
                                    <>
                                        <button onClick={() => runRebalance('Invest')} disabled={!!busy || !strategyOf(funds)}
                                            className="px-4 py-2 rounded-xl border border-white/15 text-xs font-bold text-white/70 hover:text-white hover:bg-white/5 disabled:opacity-40 transition-colors inline-flex items-center gap-2">
                                            {busy === 'Invest' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                            {lang('Invest (agent signs)', 'Invertir (firma el agente)')}
                                        </button>
                                        <button onClick={() => runRebalance('Unwind')} disabled={!!busy || !strategyOf(funds)}
                                            className="px-4 py-2 rounded-xl border border-white/15 text-xs font-bold text-white/70 hover:text-white hover:bg-white/5 disabled:opacity-40 transition-colors inline-flex items-center gap-2">
                                            {busy === 'Unwind' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                            {lang('Unwind (agent signs)', 'Retirar a la bóveda (firma el agente)')}
                                        </button>
                                    </>
                                )}
                            </div>

                            {network === 'mainnet' && vault?.autonomousRebalancing !== 'not-managed-by-nirium' && (
                                <div className={`rounded-xl border p-4 text-[11px] leading-relaxed ${
                                    vault?.autonomousRebalancing === 'enabled'
                                        ? 'border-emerald-400/25 bg-emerald-400/[0.04] text-emerald-400/90'
                                        : 'border-amber-400/25 bg-amber-400/[0.05] text-amber-400/90'
                                }`}>
                                    {vault?.autonomousRebalancing === 'enabled'
                                        ? lang(
                                            'Autonomous rebalancing is on for this vault. Nirium’s signer decides on its own every 10 minutes — there is no button here because if you could trigger it, it would not be autonomous.',
                                            'El rebalanceo autónomo está encendido para esta bóveda. El firmante de Nirium decide por su cuenta cada 10 minutos — aquí no hay botón porque si pudieras dispararlo tú, no sería autónomo.')
                                        : lang(
                                            'This vault names Nirium as rebalance manager, but autonomous rebalancing is not enabled for it — being named is not the same as being enabled. On mainnet it is invite-only while the legal review closes, and enabling a vault takes a commit to the repository, with author and date.',
                                            'Esta bóveda nombra a Nirium como rebalance manager, pero el rebalanceo autónomo no está habilitado para ella — nombrarnos no es lo mismo que habilitarla. En mainnet es invite-only mientras cierra la revisión legal, y habilitar una bóveda requiere un commit al repositorio, con autor y fecha.')}
                                </div>
                            )}

                            <p className="text-[11px] text-white/40 leading-relaxed">
                                {lang(
                                    'Deposit moves your tokens into the vault. Invest and Unwind are signed by the agent with its own key — and neither can send anything outside the vault.',
                                    'Depositar mueve tus tokens a la bóveda. Invertir y Retirar los firma el agente con su propia llave — y ninguno puede mandar nada fuera de la bóveda.')}
                            </p>

                            {receipt && (
                                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs">
                                    <span className="text-emerald-400 font-bold">{receipt.what} · </span>
                                    <a href={explorerTx(network, receipt.hash)} target="_blank" rel="noopener noreferrer"
                                        className="text-stellar-teal font-mono hover:underline break-all">
                                        {shorten(receipt.hash, 10)} <ExternalLink className="w-3 h-3 inline" />
                                    </a>
                                </div>
                            )}
                        </div>
                    )}
                </section>

                {error && (
                    <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-xs text-red-300 break-words">
                        {error}
                    </div>
                )}

                <p className="text-[11px] text-white/30 leading-relaxed">
                    {lang(
                        'Rebalancing is not triggered from here. It is called by the RebalanceManager — the agent, with its own key — and it can only move funds between the strategies already inside your vault.',
                        'El rebalanceo no se dispara desde aquí. Lo llama el RebalanceManager — el agente, con su propia llave — y solo puede mover fondos entre las estrategias que ya están dentro de tu bóveda.')}{' '}
                    <Link href="/treasury" className="text-stellar-teal hover:underline">
                        {lang('How the node works', 'Cómo funciona el nodo')}
                    </Link>
                </p>
            </div>
        </main>
    );
}
