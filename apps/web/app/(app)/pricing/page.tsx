/** Nirium Pricing — Transparent, public **/
'use client';

import Link from "next/link";
import {
    CheckCircle2, ArrowRight, Sparkles, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/context/LanguageContext";

type Feature = { en: string; es: string; zh: string };

const FEATURES_FREE: Feature[] = [
    { en: 'Testnet vault (2-of-3 Soroban)', es: 'Vault testnet (2-de-3 Soroban)', zh: '测试网保险库（2-of-3 Soroban）' },
    { en: 'Up to 10 test transactions/day',  es: 'Hasta 10 txs de prueba/día',     zh: '每天最多 10 笔测试交易' },
    { en: 'Audit trail (HMAC-SHA256)',        es: 'Audit trail (HMAC-SHA256)',       zh: '审计追踪（HMAC-SHA256）' },
    { en: 'SDK access (npm: nirium)',          es: 'Acceso SDK (npm: nirium)',          zh: 'SDK 访问（npm: nirium）' },
    { en: 'MCP server (Claude/Cursor)',       es: 'MCP server (Claude/Cursor)',       zh: 'MCP 服务器（Claude/Cursor）' },
];

const FEATURES_GROWTH: Feature[] = [
    { en: 'Everything in Free',                 es: 'Todo lo de Free',                    zh: '包含 Free 所有功能' },
    { en: 'Mainnet vault (once audited)',        es: 'Vault mainnet (post-auditoría)',      zh: '主网保险库（审计后）' },
    { en: 'Unlimited transactions',             es: 'Transacciones ilimitadas',            zh: '无限交易' },
    { en: 'CNBV compliance export',             es: 'Export compliance CNBV',              zh: 'CNBV 合规导出' },
    { en: 'IPFS anchoring (Pinata)',             es: 'Anclaje IPFS (Pinata)',               zh: 'IPFS 锚定（Pinata）' },
    { en: 'x402 + MPP agentic payments',        es: 'Pagos agénticos x402 + MPP',          zh: 'x402 + MPP 智能体支付' },
    { en: 'Cross-border USDC transfers',        es: 'Transfers cross-border USDC',         zh: '跨境 USDC 转账' },
    { en: 'CETES ↔ USDC signal generation',             es: 'Generación de señales CETES ↔ USDC',            zh: 'CETES ↔ USDC 信号生成' },
    { en: 'Visual Strategy Builder (drag & drop)', es: 'Strategy Builder visual (drag & drop)', zh: '可视化策略构建器（拖放）' },
    { en: 'Priority support (48h SLA)',            es: 'Soporte prioritario (48h SLA)',          zh: '优先支持（48h SLA）' },
    { en: 'Dedicated Slack channel',               es: 'Canal Slack dedicado',                  zh: '专属 Slack 频道' },
];

const FEATURES_ENTERPRISE: Feature[] = [
    { en: 'Everything in Growth',                           es: 'Todo lo de Growth',                              zh: '包含 Growth 所有功能' },
    { en: 'Volume API pricing',                              es: 'Precios por volumen de API',                      zh: '批量 API 定价' },
    { en: 'White-label option',                             es: 'Opción white-label',                              zh: '白标选项' },
    { en: 'Custom Soroban vault logic',                     es: 'Lógica de vault Soroban custom',                  zh: '自定义 Soroban 保险库逻辑' },
    { en: 'CNBV audit support',                             es: 'Soporte auditoría CNBV',                          zh: 'CNBV 审计支持' },
    { en: 'On-premise deployment option',                   es: 'Opción despliegue on-premise',                    zh: '本地部署选项' },
    { en: 'SLA 99.9% uptime',                               es: 'SLA 99.9% uptime',                                zh: 'SLA 99.9% 在线率' },
    { en: '24/7 dedicated support',                         es: 'Soporte dedicado 24/7',                           zh: '24/7 专属支持' },
    { en: 'Custom integrations (ERP, Core Banking)',        es: 'Integraciones custom (ERP, Core Banking)',         zh: '自定义集成（ERP、核心银行）' },
    { en: 'Joint go-to-market',                             es: 'Go-to-market conjunto',                           zh: '联合市场推广' },
];

type ComparisonRow = {
    feature: Feature;
    free:       string | Feature;
    growth:     string | Feature;
    enterprise: string | Feature;
};

const COMPARISON: ComparisonRow[] = [
    { feature: { en: 'Vault type',       es: 'Tipo de vault',          zh: '保险库类型'       }, free: 'Testnet', growth: 'Mainnet', enterprise: 'Custom' },
    { feature: { en: 'Transactions',     es: 'Transacciones',          zh: '交易数量'         }, free: '10/day', growth: { en: 'Unlimited', es: 'Ilimitadas', zh: '无限' }, enterprise: { en: 'Unlimited', es: 'Ilimitadas', zh: '无限' } },
    { feature: { en: 'Multisig',         es: 'Multisig',               zh: '多签'             }, free: '2-of-3', growth: '2-of-3', enterprise: { en: 'Configurable', es: 'Configurable', zh: '可配置' } },
    { feature: { en: 'CNBV export',      es: 'Export CNBV',            zh: 'CNBV 导出'        }, free: '✗', growth: '✓', enterprise: '✓' },
    { feature: { en: 'IPFS anchoring',   es: 'Anclaje IPFS',           zh: 'IPFS 锚定'        }, free: '✗', growth: '✓', enterprise: '✓' },
    { feature: { en: 'x402 / MPP',       es: 'x402 / MPP',             zh: 'x402 / MPP'       }, free: '✗', growth: '✓', enterprise: '✓' },
    { feature: { en: 'API pricing',      es: 'Precio API',             zh: 'API 定价'         }, free: { en: 'Free (testnet)', es: 'Gratis (testnet)', zh: '免费（测试网）' }, growth: { en: '$0.01–0.05/call', es: '$0.01–0.05/call', zh: '$0.01–0.05/次' }, enterprise: { en: 'Volume discount', es: 'Descuento por volumen', zh: '批量折扣' } },
    { feature: { en: 'Support',          es: 'Soporte',                zh: '支持'             }, free: '✗', growth: '48h SLA', enterprise: '24/7' },
];

export default function PricingPage() {
    const { language } = useLanguage();
    const lang = (en: string, es: string, zh: string) =>
        language === 'zh' ? zh : language === 'es' ? es : en;

    const f = (feat: Feature) => language === 'zh' ? feat.zh : language === 'es' ? feat.es : feat.en;
    const cellVal = (v: string | Feature) => typeof v === 'string' ? v : f(v);

    return (
        <main className="min-h-screen bg-black text-white antialiased">
{/* HERO */}
            <section className="relative pt-8 pb-16 sm:pt-8 sm:pb-20">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(45,235,232,0.06),transparent_60%)]" />
                <div className="relative max-w-5xl mx-auto px-6">
                    <div className="flex justify-center mb-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-stellar-teal/20 bg-stellar-teal/5 text-stellar-teal text-xs font-mono">
                            <Sparkles className="w-3 h-3" />
                            {lang('Transparent pricing', 'Precios transparentes', '透明定价')}
                        </div>
                    </div>

                    <h1 className="text-center text-4xl sm:text-6xl font-black leading-[1.05] tracking-tight">
                        {lang('No surprises.', 'Sin sorpresas.', '没有惊喜。')}
                        <br />
                        <span className="bg-gradient-to-r from-stellar-teal to-stellar-yellow bg-clip-text text-transparent">
                            {lang('No fine print.', 'Sin letra chica.', '没有隐藏条款。')}
                        </span>
                    </h1>
                    <p className="mt-6 text-center text-lg text-white/60 max-w-2xl mx-auto">
                        {lang(
                            'Start free on testnet. Pay only when you go to mainnet.',
                            'Empieza gratis en testnet. Paga solo cuando vayas a mainnet.',
                            '在测试网上免费开始。仅在上线主网时付费。'
                        )}
                    </p>
                </div>
            </section>

            {/* PLANS */}
            <section className="py-16 border-t border-white/5">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="grid md:grid-cols-3 gap-6">

                        {/* FREE */}
                        <div className="flex flex-col p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
                            <div className="mb-6">
                                <div className="text-xs font-mono uppercase tracking-widest text-white/40 mb-2">Sandbox</div>
                                <div className="text-4xl font-black mb-1">$0</div>
                                <p className="text-sm text-white/50">
                                    {lang('Free forever on testnet', 'Para siempre en testnet', '测试网永久免费')}
                                </p>
                            </div>
                            <ul className="space-y-2.5 flex-1 mb-8">
                                {FEATURES_FREE.map((feat) => (
                                    <li key={feat.en} className="flex items-start gap-2 text-sm text-white/70">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400/80 shrink-0 mt-0.5" />
                                        {f(feat)}
                                    </li>
                                ))}
                            </ul>
                            <Link href="/sandbox">
                                <Button variant="outline" className="w-full border-white/20 hover:bg-white/5">
                                    {lang('Start free', 'Empezar gratis', '免费开始')}
                                </Button>
                            </Link>
                        </div>

                        {/* GROWTH — highlighted */}
                        <div className="flex flex-col p-6 rounded-2xl border border-stellar-teal/30 bg-stellar-teal/[0.04] relative">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                <span className="px-3 py-1 bg-stellar-teal text-black text-[10px] font-black uppercase rounded-full tracking-widest">
                                    {lang('Most popular', 'Más popular', '最受欢迎')}
                                </span>
                            </div>
                            <div className="mb-6">
                                <div className="text-xs font-mono uppercase tracking-widest text-stellar-teal/60 mb-2">Growth</div>
                                <div className="text-4xl font-black mb-1">
                                    $299
                                    <span className="text-lg text-white/40 font-normal">/mo</span>
                                </div>
                                <p className="text-sm text-white/50">
                                    {lang('+ $0.01–0.05 per API call', '+ $0.01–0.05 por llamada API', '+ 每次 API 调用 $0.01–0.05')}
                                </p>
                                <p className="text-xs text-white/30 mt-1">
                                    {lang('Software license — no % of capital', 'Licencia de software — sin % del capital', '软件许可 — 无资本百分比')}
                                </p>
                            </div>
                            <ul className="space-y-2.5 flex-1 mb-8">
                                {FEATURES_GROWTH.map((feat) => (
                                    <li key={feat.en} className="flex items-start gap-2 text-sm text-white/70">
                                        <CheckCircle2 className="w-4 h-4 text-stellar-teal/80 shrink-0 mt-0.5" />
                                        {f(feat)}
                                    </li>
                                ))}
                            </ul>
                            <Link href="/sandbox">
                                <Button variant="premium" className="w-full">
                                    {lang('Try on testnet', 'Probar en testnet', '在测试网上试用')}
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </Link>
                        </div>

                        {/* ENTERPRISE */}
                        <div className="flex flex-col p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
                            <div className="mb-6">
                                <div className="text-xs font-mono uppercase tracking-widest text-white/40 mb-2">Enterprise</div>
                                <div className="text-4xl font-black mb-1">Custom</div>
                                <p className="text-sm text-white/50">
                                    {lang('For regulated fintechs, banks, and DAOs', 'Para fintechs reguladas, bancos y DAOs', '适用于受监管金融科技、银行和 DAO')}
                                </p>
                            </div>
                            <ul className="space-y-2.5 flex-1 mb-8">
                                {FEATURES_ENTERPRISE.map((feat) => (
                                    <li key={feat.en} className="flex items-start gap-2 text-sm text-white/70">
                                        <CheckCircle2 className="w-4 h-4 text-stellar-yellow/80 shrink-0 mt-0.5" />
                                        {f(feat)}
                                    </li>
                                ))}
                            </ul>
                            <a href="mailto:hola@nirium.xyz">
                                <Button variant="outline" className="w-full border-white/20 hover:bg-white/5">
                                    {lang('Talk to the team', 'Hablar con el equipo', '联系团队')}
                                </Button>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* FEE BREAKDOWN */}
            <section className="py-16 border-t border-white/5">
                <div className="max-w-3xl mx-auto px-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center">
                        {lang('Fee breakdown', 'Desglose de fees', '费用明细')}
                    </h2>
                    <p className="mt-3 text-center text-white/50 text-sm">
                        {lang('Who charges what? Full transparency.', '¿Cuánto cobra quién? Transparencia total.', '谁收什么费用？完全透明。')}
                    </p>

                    <div className="mt-10 space-y-4">
                        {[
                            {
                                label: lang('Nirium Software License', 'Licencia de Software Nirium', 'Nirium 软件许可'),
                                rows: [
                                    { who: lang('Platform fee (Growth)', 'Cuota plataforma (Growth)', '平台费 (Growth)'), fee: '$299/mo', note: lang('Flat monthly — no % of capital', 'Mensual fijo — sin % del capital', '固定月费 — 无资本百分比'), highlight: true, total: false },
                                    { who: lang('API calls (execution, market, signals)', 'Llamadas API (ejecución, mercado, señales)', 'API 调用（执行、市场、信号）'), fee: '$0.01–0.05', note: lang('Per call, pay-as-you-go', 'Por llamada, pago por uso', '按调用付费'), highlight: false, total: false },
                                    { who: lang('x402 premium endpoints', 'Endpoints premium x402', 'x402 高级端点'), fee: '$0.02–0.05', note: lang('USDC micropayment per request', 'Micropago USDC por request', 'USDC 微支付/请求'), highlight: false, total: false },
                                ],
                            },
                            {
                                label: lang('Regulated Partner Fees (not Nirium)', 'Fees del Partner Regulado (no Nirium)', '受监管合作方费用（非 Nirium）'),
                                rows: [
                                    { who: lang('Etherfuse (CETES execution)', 'Etherfuse (ejecución CETES)', 'Etherfuse（CETES 执行）'), fee: 'etherfuse.com', feeLink: 'https://etherfuse.com', note: lang('Charged by Etherfuse directly — Nirium does not receive or manage this fee', 'Cobrado por Etherfuse directamente — Nirium no recibe ni administra este fee', 'Etherfuse 直接收取 — Nirium 不收取或管理此费用'), highlight: false, total: false },
                                    { who: lang('Stellar network (gas)', 'Red Stellar (gas)', 'Stellar 网络（Gas）'), fee: '<$0.01', note: lang('Per transaction', 'Por transacción', '每笔交易'), highlight: false, total: false },
                                    { who: lang('Regulated operator commission', 'Comisión del operador regulado', '受监管运营商佣金'), fee: lang('Set by partner', 'Definida por partner', '由合作方设定'), note: lang('ITF/Casa de bolsa sets their own fee', 'ITF/Casa de bolsa define su propio fee', 'ITF/券商自定费率'), highlight: true, total: false },
                                ],
                            },
                        ].map((section) => (
                            <div key={section.label} className="rounded-xl border border-white/10 overflow-hidden">
                                <div className="px-4 py-3 bg-white/[0.03] border-b border-white/5">
                                    <span className="text-sm font-bold">{section.label}</span>
                                </div>
                                <table className="w-full">
                                    <tbody className="divide-y divide-white/5">
                                        {section.rows.map((row) => (
                                            <tr key={row.who} className={row.total ? 'bg-stellar-teal/5' : ''}>
                                                <td className={`px-4 py-2.5 text-sm ${row.total ? 'font-bold text-stellar-teal' : 'text-white/70'}`}>{row.who}</td>
                                                <td className={`px-4 py-2.5 text-sm font-mono ${row.total ? 'font-black text-stellar-teal' : row.highlight ? 'text-white' : 'text-white/60'}`}>
                                                    {(row as any).feeLink ? (
                                                        <a href={(row as any).feeLink} target="_blank" rel="noopener noreferrer" className="text-stellar-teal/70 hover:text-stellar-teal underline underline-offset-2 transition-colors">
                                                            {row.fee} ↗
                                                        </a>
                                                    ) : row.fee}
                                                </td>
                                                <td className="px-4 py-2.5 text-xs text-white/40 hidden sm:table-cell">{row.note}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FULL COMPARISON TABLE */}
            <section className="py-16 border-t border-white/5">
                <div className="max-w-4xl mx-auto px-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center">
                        {lang('Comparison table', 'Tabla comparativa', '对比表')}
                    </h2>

                    <div className="mt-8 overflow-hidden rounded-xl border border-white/10">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.02]">
                                    <th className="text-left px-4 py-3 text-xs text-white/40 uppercase tracking-wider font-mono">
                                        {lang('Feature', 'Característica', '功能')}
                                    </th>
                                    <th className="text-center px-4 py-3 text-xs text-white/40 uppercase tracking-wider font-mono">Free</th>
                                    <th className="text-center px-4 py-3 text-xs text-stellar-teal/60 uppercase tracking-wider font-mono">Growth</th>
                                    <th className="text-center px-4 py-3 text-xs text-white/40 uppercase tracking-wider font-mono">Enterprise</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {COMPARISON.map((row) => (
                                    <tr key={row.feature.en} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-4 py-3 text-white/70 text-xs">{f(row.feature)}</td>
                                        <td className="px-4 py-3 text-center text-xs text-white/60">{cellVal(row.free)}</td>
                                        <td className="px-4 py-3 text-center text-xs text-stellar-teal/80 font-medium">{cellVal(row.growth)}</td>
                                        <td className="px-4 py-3 text-center text-xs text-white/60">{cellVal(row.enterprise)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-16 border-t border-white/5">
                <div className="max-w-3xl mx-auto px-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center">FAQ</h2>

                    <div className="mt-10 space-y-4">
                        {[
                            {
                                q: lang('Why flat pricing instead of % of capital?', '¿Por qué precio fijo y no % del capital?', '为什么采用固定价格而不是资本百分比？'),
                                a: lang(
                                    'Nirium is a software company, not a fund manager. We sell technology licenses — like Bloomberg or Refinitiv. Financial commissions (% of AUM, swap fees) are charged by your Regulated Partner (ITF, casa de bolsa), not by us.',
                                    'Nirium es una empresa de software, no una administradora de fondos. Vendemos licencias de tecnología — como Bloomberg o Refinitiv. Las comisiones financieras (% del AUM, fees de swap) las cobra tu Partner Regulado (ITF, casa de bolsa), no nosotros.',
                                    'Nirium 是一家软件公司，不是基金管理公司。我们销售技术许可 — 就像 Bloomberg 或 Refinitiv。金融佣金（AUM 百分比、兑换费）由您的受监管合作方（ITF、券商）收取，不是我们。'
                                ),
                            },
                            {
                                q: lang('When does mainnet activate?', '¿Cuándo se activa mainnet?', '主网何时上线？'),
                                a: lang(
                                    'Mainnet is blocked pending an external Soroban contract audit. Funded by SCF Build Grant. ETA: Q3 2026.',
                                    'Mainnet está bloqueado por una auditoría externa del contrato Soroban. Está financiada por SCF Build Grant. ETA: Q3 2026.',
                                    '主网上线前需完成外部 Soroban 合约审计，由 SCF Build Grant 资助。预计 2026 年 Q3。'
                                ),
                            },
                            {
                                q: lang('Does Nirium custody my funds?', '¿Nirium custodia mis fondos?', 'Nirium 托管我的资金吗？'),
                                a: lang(
                                    "No. The vault is 100% non-custodial. Nirium cannot move your funds without your signatures. It's a technical impossibility at the contract level.",
                                    'No. El vault es 100% non-custodial. Nirium no puede mover tus fondos sin tus firmas. Es una imposibilidad técnica al nivel del contrato.',
                                    '不。保险库 100% 非托管。Nirium 没有您的签名无法转移资金。这是合约层面的技术性不可能。'
                                ),
                            },
                            {
                                q: lang('Who charges the financial commissions?', '¿Quién cobra las comisiones financieras?', '谁收取金融佣金？'),
                                a: lang(
                                    'Your Regulated Partner (ITF, casa de bolsa, or licensed fintech) sets and collects all financial fees. Etherfuse — an independent regulated operator — publishes its own fee schedule at etherfuse.com. Nirium only charges software license fees in fiat.',
                                    'Tu Partner Regulado (ITF, casa de bolsa o fintech licenciada) establece y cobra todos los fees financieros. Etherfuse — operador regulado independiente — publica su propio esquema de tarifas en etherfuse.com. Nirium solo cobra licencias de software en fiat.',
                                    '您的受监管合作方（ITF、券商或持牌金融科技）设定并收取所有金融费用。Etherfuse（独立受监管运营商）在 etherfuse.com 上公布其自有费率表。Nirium 仅以法币收取软件许可费。'
                                ),
                            },
                            {
                                q: lang('Are there volume discounts?', '¿Hay descuentos por volumen?', '有量大优惠吗？'),
                                a: lang(
                                    'Yes on Enterprise. For high API volume or multi-tenant deployments, pricing is negotiable. Contact hola@nirium.xyz.',
                                    'Sí en Enterprise. Para alto volumen de API o despliegues multi-tenant, los precios son negociables. Contacta a hola@nirium.xyz.',
                                    '企业版有。对于高 API 调用量或多租户部署，价格可协商。联系 hola@nirium.xyz。'
                                ),
                            },
                        ].map((faq) => (
                            <div key={faq.q} className="p-5 rounded-xl border border-white/10 bg-white/[0.02]">
                                <h3 className="text-sm font-bold mb-2">{faq.q}</h3>
                                <p className="text-sm text-white/60 leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* DISCLAIMER */}
            <section className="py-8 border-t border-white/5">
                <div className="max-w-3xl mx-auto px-6">
                    <div className="p-5 rounded-xl border border-amber-500/20 bg-amber-500/[0.03]">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                            <p className="text-sm text-white/70 leading-relaxed">
                                {language === 'zh' ? (
                                    <>Nirium 目前运行于 <strong>Stellar 测试网</strong>。主网价格仅供参考，正式上线前可能变更。CETES 利率（~5.57%）为 Banxico 参考利率，非 Nirium 承诺。非金融建议。</>
                                ) : language === 'es' ? (
                                    <>Nirium opera actualmente en <strong>Stellar Testnet</strong>. Los precios de mainnet son indicativos y pueden cambiar antes del lanzamiento oficial. La tasa CETES (~5.57%) es una tasa de referencia Banxico, no una garantía de Nirium. No es asesoría financiera.</>
                                ) : (
                                    <>Nirium currently operates on <strong>Stellar Testnet</strong>. Mainnet prices are indicative and may change before official launch. CETES rate (~5.57%) is a Banxico reference rate, not a Nirium guarantee. Not financial advice.</>
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 border-t border-white/5">
                <div className="max-w-3xl mx-auto px-6 text-center">
                    <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
                        {lang('Start today.', 'Empieza hoy.', '今天就开始。')}
                    </h2>
                    <p className="mt-4 text-white/60">
                        {lang('No card. No contract. Cancel anytime.', 'Sin tarjeta. Sin contrato. Cancela cuando quieras.', '无需绑卡。无需合同。随时取消。')}
                    </p>
                    <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
                        <Link href="/sandbox">
                            <Button size="lg" variant="premium">
                                {lang('Create free vault', 'Crear vault gratis', '免费创建保险库')}
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </Link>
                        <Link href="/developers">
                            <Button size="lg" variant="outline" className="border-white/20 hover:bg-white/5">
                                {lang('View docs', 'Ver documentación', '查看文档')}
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
