"use client";
import { cn } from "@/lib/utils";
import {
  Decal,
  OrbitControls,
  Sparkles,
  useGLTF,
  useTexture,
} from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { Suspense, useCallback, useRef, useState } from "react";
import * as THREE from "three";

const EGG_MODEL_PATH = "/models/egg.glb";
const AQUATAN_MODEL_PATH = "/models/aquatan.glb";
const MAX_CRACKS = 6;
const CRACK_POSITIONS = Array.from(
  { length: MAX_CRACKS },
  (_, i) =>
    new THREE.Vector3(
      Math.sin((i / MAX_CRACKS) * Math.PI * 4) * 0.8,
      Math.sin((i / MAX_CRACKS) * Math.PI * 6) * 0.7,
      Math.cos((i / MAX_CRACKS) * Math.PI * 4) * 0.8,
    ),
);
const CRACK_ROTATIONS = CRACK_POSITIONS.map((pos) => CalcRotation(pos));
// === Animation用定数 ===
const INITIAL_BLOOM_INTENSITY = 0.0;
const TARGET_BLOOM_INTENSITY = 2.0;
const ANIMATION_DURATION = 2.0; // seconds
const HATCH_TIME = ANIMATION_DURATION * 0.5;
const TARGET_FLOATING_HEIGHT = 1;

interface EggViewerProps {
  crackUrls: string[];
  onEggBreak?: () => void; // 孵化時のコールバック
  className?: string;
}

export default function EggViewer({
  crackUrls,
  onEggBreak,
  className,
}: EggViewerProps) {
  const [isHatched, setIsHatched] = useState(false);
  return (
    <div className={cn("relative h-full w-full", className)}>
      <Canvas camera={{ position: [0, 0, 3] }}>
        <Scene
          crackUrls={crackUrls}
          onEggBreak={() => {
            setIsHatched(true);
            onEggBreak?.();
          }}
        />
      </Canvas>
      {/* メッセージの表示 */}
      {crackUrls.length >= MAX_CRACKS && !isHatched && (
        <div className="absolute bottom-8 w-full text-center text-xl font-bold text-amber-600">
          タップして孵化させよう！
        </div>
      )}
    </div>
  );
}

/**
 * Canvas内のシーンコンポーネント
 * @returns JSX.Element
 */
function Scene({
  crackUrls,
  onEggBreak,
}: {
  crackUrls: string[];
  onEggBreak?: () => void;
}) {
  const { isHatched, bloomIntensity, floatingHeight, startAnimation } =
    useHatchAnimation();
  return (
    <>
      <color attach="background" args={["#fffff0"]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.7} />
      <OrbitControls
        enableZoom={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={(Math.PI * 2) / 3}
      />
      <Suspense fallback={null}>
        {isHatched ? (
          <AquatanModel y={floatingHeight} />
        ) : (
          <EggModelWithDecals
            crackUrls={crackUrls}
            onClick={() => {
              startAnimation();
              if (crackUrls.length >= MAX_CRACKS) {
                onEggBreak?.();
              }
            }}
            y={floatingHeight}
          />
        )}
      </Suspense>
      <EffectComposer>
        <Bloom intensity={bloomIntensity} luminanceThreshold={0.7} mipmapBlur />
      </EffectComposer>
      {!isHatched && (
        <Sparkles count={30} scale={2} size={5} speed={0.1} color={"#fff5cc"} />
      )}
    </>
  );
}

function AquatanModel({ y = 0 }: { y?: number }) {
  const { nodes, materials } = useGLTF(AQUATAN_MODEL_PATH);

  return (
    <primitive
      object={nodes.Aquatan}
      scale={1.4} // ここでモデル全体のスケールや位置を調整できる
      position={[0, y, 0]}
    />
  );
}

function EggModelWithDecals({
  crackUrls,
  onClick,
  y = 0,
}: {
  crackUrls: string[];
  onClick: () => void;
  y?: number;
}) {
  const { nodes, materials } = useGLTF(EGG_MODEL_PATH);
  const textures = useTexture(crackUrls);
  const meshRef = useRef<THREE.Mesh>(null);

  // ヒビの数に応じて揺れるアニメーション
  const crackCount = textures.length;
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    if (crackCount === 0) {
      return;
    } else if (crackCount < MAX_CRACKS / 2 && time % 6 < 4) {
      meshRef.current!.rotation.z = 0.1 * Math.sin(time * Math.PI * 1);
    } else if (crackCount < MAX_CRACKS && time % 4 < 2) {
      meshRef.current!.rotation.z = 0.2 * Math.sin(time * Math.PI * 1.5);
    } else {
      meshRef.current!.rotation.z = 0.3 * Math.sin(time * Math.PI * 2);
    }
  });

  return (
    <mesh
      ref={meshRef}
      geometry={(nodes.Egg as THREE.Mesh).geometry}
      material={materials.EggMaterial}
      position={[0, y, 0]}
      onClick={onClick}
    >
      {textures.map((texture, index) => (
        <Decal
          key={texture.uuid}
          position={CRACK_POSITIONS[index]}
          rotation={CRACK_ROTATIONS[index]}
          map={texture}
          scale={0.7}
        >
          <meshStandardMaterial
            map={texture}
            polygonOffset
            polygonOffsetFactor={-10}
            transparent
          />
        </Decal>
      ))}
    </mesh>
  );
}

function useHatchAnimation() {
  const [isHatched, setIsHatched] = useState(false);
  const [bloomIntensity, setBloomIntensity] = useState(0);
  const [floatingHeight, setFloatingHeight] = useState(0);
  const isAnimatingRef = useRef(false);
  const animatingTimeRef = useRef(0);

  useFrame((state, delta) => {
    if (!isAnimatingRef.current) return;

    if (animatingTimeRef.current > ANIMATION_DURATION) {
      isAnimatingRef.current = false;
      animatingTimeRef.current = 0;
      setBloomIntensity(INITIAL_BLOOM_INTENSITY);
      return;
    }

    animatingTimeRef.current += delta;
    const nextBloomIntensity =
      INITIAL_BLOOM_INTENSITY +
      (TARGET_BLOOM_INTENSITY - INITIAL_BLOOM_INTENSITY) *
        Math.sin(Math.PI * (animatingTimeRef.current / ANIMATION_DURATION));
    const nextFloatingHeight =
      TARGET_FLOATING_HEIGHT *
      Math.sin((animatingTimeRef.current * Math.PI) / ANIMATION_DURATION) ** 2;

    if (!isHatched && animatingTimeRef.current >= HATCH_TIME) {
      setIsHatched(true);
    }
    setBloomIntensity(nextBloomIntensity);
    setFloatingHeight(nextFloatingHeight);
  });

  const startAnimation = useCallback(() => {
    if (isAnimatingRef.current) return;

    isAnimatingRef.current = true;
    animatingTimeRef.current = 0;
  }, []);

  return {
    isHatched,
    bloomIntensity,
    floatingHeight,
    startAnimation,
  };
}

/**
 * 位置ベクトルから回転を計算するヘルパー関数
 * @param position 位置ベクトル
 * @returns 回転ベクトル
 */
function CalcRotation(position: THREE.Vector3) {
  const dummy = new THREE.Object3D();
  dummy.position.copy(position);
  dummy.lookAt(new THREE.Vector3(0, 0, 0));
  return dummy.rotation;
}
