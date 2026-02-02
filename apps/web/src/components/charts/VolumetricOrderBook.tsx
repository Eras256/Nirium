'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { OrderBookScene } from '@/components/3d/charts/OrderBookScene';

export function VolumetricOrderBook({ height = 400 }: { height?: number }) {
    return (
        <div className="w-full relative rounded-xl overflow-hidden border border-white/10 bg-[#02040A]" style={{ height }}>
            {/* Header Overlay */}
            <div className="absolute top-0 left-0 w-full p-4 flex justify-between z-10 bg-gradient-to-b from-black/80 to-transparent">
                <div className="flex gap-4">
                    <div>
                        <div className="text-[10px] text-white/40 uppercase tracking-wider">Mid Price</div>
                        <div className="text-xl font-mono text-[#D4AF37]">$0.3500</div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-1 rounded border border-cyan-500/20">BIDS</span>
                    <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-1 rounded border border-red-500/20">ASKS</span>
                </div>
            </div>

            <Canvas>
                <PerspectiveCamera makeDefault position={[0, 6, 18]} fov={45} />
                <color attach="background" args={['#02040A']} />

                <OrderBookScene />

                <Environment preset="city" />
                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    maxPolarAngle={Math.PI / 2}
                    minPolarAngle={Math.PI / 4}
                />
            </Canvas>
        </div>
    );
}
