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
    { en: 'SDK access (@nirium/sdk)',         es: 'Acceso SDK (@nirium/sdk)',         zh: 'SDK 访问（@nirium/sdk）' },
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
    { en: 'CETES ↔ USDC auto-rebalance',               es: 'Auto-rebalanceo CETES ↔ USDC',                 zh: 'CETES ↔ USDC 自动再平衡' },
    { en: 'Visual Strategy Builder (drag & drop)', es: 'Strategy Builder visual (drag & drop)', zh: '可视化策略构建器（拖放）' },
    { en: 'Priority support (48h SLA)',            es: 'Soporte prioritario (48h SLA)',          zh: '优先支持（48h SLA）' },
    { en: 'Dedicated Slack channel',               es: 'Canal Slack dedicado',                  zh: '专属 Slack 频道' },
];

const FEATURES_ENTERPRISE: Feature[] = [
    { en: 'Everything in Growth',                           es: 'Todo lo de Growth',                              zh: '包含 Growth 所有功能' },
    { en: 'Custom fee negotiation',                         es: 'Negociación de fees personalizada',               zh: '自定义费率谈判' },
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
    { feature: { en: 'Transaction fee',  es: 'Fee por transacción',    zh: '交易费用'         }, free: { en: 'Free (testnet)', es: 'Gratis (testnet)', zh: '免费（测试网）' }, growth: '0.5% TVL + 0.6% swap', enterprise: { en: 'Negotiable', es: 'Negociable', zh: '可协商' } },
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
                                    $99
                                    <span className="text-lg text-white/40 font-normal">/mo</span>
                                </div>
                                <p className="text-sm text-white/50">
                                    {lang('+ 0.5% of TVL under management', '+ 0.5% del TVL bajo gestión', '+ 0.5% 锁定总量')}
                                </p>
                                <p className="text-xs text-white/30 mt-1">
                                    {lang('(+ 0.6% swap fee on CETES/USDC)', '(+ 0.6% fee en swaps CETES/USDC)', '（+ 0.6% CETES/USDC 兑换费）')}
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
                                label: lang('Swap operation (USDC → CETES)', 'Operación de swap (USDC → CETES)', '兑换操作（USDC → CETES）'),
                                rows: [
                                    { who: 'Etherfuse',                                               fee: '0.20%',  note: lang('All-in, includes FX MXN/USD — confirmed by Etherfuse', 'Todo incluido, incluye FX MXN/USD — confirmado por Etherfuse', '全含，含 FX — Etherfuse 确认'), highlight: false, total: false },
                                    { who: 'Nirium',                                                  fee: '0.60%',  note: lang('Software license fee', 'Licencia de software', '软件许可费'),       highlight: true,  total: false },
                                    { who: lang('Total to client', 'Total cliente', '客户总费用'),     fee: '~0.80%', note: lang('All-in', 'Todo incluido', '全含'),                                 highlight: false, total: true  },
                                ],
                            },
                            {
                                label: lang('Cross-border (USDC → USDC)', 'Cross-border (USDC → USDC)', '跨境（USDC → USDC）'),
                                rows: [
                                    { who: lang('Stellar (gas)', 'Stellar (gas)', 'Stellar（Gas）'), fee: '<$0.01', note: lang('Per transaction', 'Por transacción', '每笔交易'), highlight: false, total: false },
                                    { who: 'Nirium',                                                  fee: '0.50% AUM', note: lang('Monthly management fee', 'Fee mensual de gestión', '月度管理费'), highlight: true, total: false },
                                    { who: lang('Total cross-border', 'Total cross-border', '跨境总费用'), fee: '~0.50%', note: lang('vs 1.5% Bridge / 4.5% WU', 'vs 1.5% Bridge / 4.5% WU', '对比 Bridge 1.5% / WU 4.5%'), highlight: false, total: true },
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
                                                <td className={`px-4 py-2.5 text-sm font-mono ${row.total ? 'font-black text-stellar-teal' : row.highlight ? 'text-white' : 'text-white/60'}`}>{row.fee}</td>
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
                                q: lang('Is the 0.5% AUM fee monthly or annual?', '¿El 0.5% AUM es mensual o anual?', '0.5% AUM 费是月费还是年费？'),
                                a: lang(
                                    'Monthly, on total AUM under management at period start. For $500K AUM = $2,500/month.',
                                    'Mensual, sobre el AUM total bajo gestión al inicio del período. Para $500K AUM = $2,500/mes.',
                                    '月费，基于期初管理总资产。$500K AUM = $2,500/月。'
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
                                q: lang('Are Etherfuse fees included?', '¿Los fees de Etherfuse están incluidos?', 'Etherfuse 费用包含在内吗？'),
                                a: lang(
                                    'Yes. The 0.80% total includes Etherfuse (0.20% all-in — confirmed, covers FX MXN/USD) and Nirium software fee (0.60%). No hidden Stellar spread.',
                                    'Sí. El 0.80% total incluye Etherfuse (0.20% todo incluido — confirmado, cubre FX MXN/USD) y el fee de software Nirium (0.60%). Sin spread oculto de Stellar.',
                                    '是。0.80% 总费率包含 Etherfuse（0.20% 全含 — 已确认，含 MXN/USD 外汇）和 Nirium 软件费（0.60%）。无隐藏 Stellar 点差。'
                                ),
                            },
                            {
                                q: lang('Are there volume discounts?', '¿Hay descuentos por volumen?', '有量大优惠吗？'),
                                a: lang(
                                    'Yes on Enterprise. For over $5M AUM, the management fee is negotiable. Contact hola@nirium.xyz.',
                                    'Sí en Enterprise. Para más de $5M AUM, el fee de gestión puede negociarse. Contacta a hola@nirium.xyz.',
                                    '企业版有。AUM 超过 $500 万时，管理费可协商。联系 hola@nirium.xyz。'
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
                                    <>Nirium 目前运行于 <strong>Stellar 测试网</strong>。主网价格仅供参考，正式上线前可能变更。CETES 利率（~3.38%）为 Banxico 参考利率，非 Nirium 承诺。非金融建议。</>
                                ) : language === 'es' ? (
                                    <>Nirium opera actualmente en <strong>Stellar Testnet</strong>. Los precios de mainnet son indicativos y pueden cambiar antes del lanzamiento oficial. La tasa CETES (~3.38%) es una tasa de referencia Banxico, no una garantía de Nirium. No es asesoría financiera.</>
                                ) : (
                                    <>Nirium currently operates on <strong>Stellar Testnet</strong>. Mainnet prices are indicative and may change before official launch. CETES rate (~3.38%) is a Banxico reference rate, not a Nirium guarantee. Not financial advice.</>
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
