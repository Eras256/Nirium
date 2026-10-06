/** RailOrbit — replaces the old TreasuryCanvas (a glowing/distorted 3D sphere
 * with bloom post-processing, apps/web/components/3d/TreasuryOrb.tsx) with a
 * flat, brand-consistent visual: a single thin ring, 3 gold nodes orbiting it
 * (the same payment/audit/execution rails the icon's 3 dots represent), and
 * the real vector mark at the center. No WebGL — plain CSS animation, so it's
 * lighter than the Three.js scene it replaces.
 *
 * Deliberately has no pill labels of its own — the two real ones (USDC,
 * CETES rate) already live in page.tsx as siblings positioned over this same
 * container; adding more here would duplicate/collide with them.
 */
'use client';

const NODE_DELAYS = ['0s', '-6s', '-12s'];

export function RailOrbit() {
    return (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            <div className="absolute w-1.5 h-1.5 rounded-full bg-white/40" style={{ top: '12%', left: '8%' }} />
            <div className="absolute w-1 h-1 rounded-full bg-white/30" style={{ top: '20%', right: '14%' }} />
            <div className="absolute w-1 h-1 rounded-full bg-white/30" style={{ bottom: '16%', left: '18%' }} />
            <div className="absolute w-1.5 h-1.5 rounded-full bg-white/40" style={{ bottom: '10%', right: '10%' }} />

            <div className="relative aspect-square w-[78%] max-w-[420px]">
                <div className="absolute inset-0 rounded-full border border-[#D4AF37]/35" />

                {NODE_DELAYS.map((delay, i) => (
                    <div
                        key={i}
                        className="absolute inset-0 rail-orbit-spin"
                        style={{ animationDelay: delay }}
                    >
                        <span
                            className="absolute w-3.5 h-3.5 rounded-full -ml-[7px] -mt-[7px]"
                            style={{
                                top: 0,
                                left: '50%',
                                background: 'radial-gradient(circle at 35% 30%, #F5D57A, #D4AF37 60%, #8B6F2E)',
                                boxShadow: '0 0 18px rgba(212,175,55,0.6)',
                            }}
                        />
                    </div>
                ))}

                <div className="absolute inset-0 flex items-center justify-center">
                    <img src="/brand/icon.svg" alt="" className="w-[34%] h-[34%]" />
                </div>
            </div>

            <style>{`
                @keyframes rail-orbit-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .rail-orbit-spin { animation: rail-orbit-spin 18s linear infinite; }
                @media (prefers-reduced-motion: reduce) {
                    .rail-orbit-spin { animation: none; }
                }
            `}</style>
        </div>
    );
}
