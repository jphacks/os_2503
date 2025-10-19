"use client";
import { cn } from "@/lib/utils";
import { Decal, OrbitControls, useGLTF, useTexture } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
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

interface EggViewerProps {
  crackUrls: string[];
  className?: string;
}

export default function EggViewer({ crackUrls, className }: EggViewerProps) {
  const [isHatched, setIsHatched] = useState(false);
  const [isHatching, setIsHatching] = useState(false);
  const [bloomIntensity, setBloomIntensity] = useState(NORMAL_BLOOM);
  const isReadyToHatch = crackUrls.length >= MAX_CRACKS;

  const handleEggClick = () => {
    if (isReadyToHatch) {
      setIsHatched(true);
    }
  };

  return (
    <div className={cn("relative h-full w-full", className)}>
      <Canvas camera={{ position: [0, 1, 3] }}>
        <color attach="background" args={["#f0f0f0"]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={0.7} />
        <OrbitControls
          enableZoom={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={(Math.PI * 2) / 3}
        />
        {isHatched ? (
          <AquatanModel />
        ) : (
          <EggModelWithDecals
            crackUrls={crackUrls}
            isReadyToHatch={isReadyToHatch}
            onClick={handleEggClick}
          />
        )}
        <BloomAnimation
          isHatching={isHatching}
          setBloomIntensity={setBloomIntensity}
        />
      </Canvas>
      {/* メッセージの表示 */}
      {isReadyToHatch && !isHatched && (
        <div className="absolute bottom-8 w-full text-center text-xl font-bold text-amber-600">
          タップして孵化させよう！
        </div>
      )}
    </div>
  );
}

function AquatanModel() {
  const { nodes, materials } = useGLTF(AQUATAN_MODEL_PATH);

  return (
    <primitive
      object={nodes.Aquatan}
      scale={1.0} // ここでモデル全体のスケールや位置を調整できる
      position={[0, 0, 0]}
    />
  );
}

function EggModelWithDecals({
  crackUrls,
  isReadyToHatch,
  onClick,
}: {
  crackUrls: string[];
  isReadyToHatch: boolean;
  onClick: () => void;
}) {
  const { nodes, materials } = useGLTF(EGG_MODEL_PATH);
  const textures = useTexture(crackUrls);
  const meshRef = useRef<THREE.Mesh>(null);

  // ヒビの数に応じて揺れるアニメーション
  const crackCount = textures.length;
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    if (isReadyToHatch) {
      meshRef.current!.rotation.z = 0.3 * Math.sin(time * Math.PI * 2);
    } else if (crackCount === 0 || time % 6 < 4) {
      return;
    } else if (crackCount < MAX_CRACKS / 2) {
      meshRef.current!.rotation.z = 0.1 * Math.sin(time * Math.PI * 1);
    } else {
      meshRef.current!.rotation.z = 0.2 * Math.sin(time * Math.PI * 1.5);
    }
  });

  return (
    <mesh
      ref={meshRef}
      geometry={(nodes.Egg as THREE.Mesh).geometry}
      material={materials.EggMaterial}
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

function CalcRotation(position: THREE.Vector3) {
  const dummy = new THREE.Object3D();
  dummy.position.copy(position);
  dummy.lookAt(new THREE.Vector3(0, 0, 0));
  return dummy.rotation;
}

const NORMAL_BLOOM = 0.5; // 通常時のブルーム強度
const MAX_BLOOM_PULSE = 5.0; // 孵化時に加算される最大の光
const ANIMATION_DURATION = 2.0; // 演出の総時間（秒）

function BloomAnimation({
  isHatching,
  setBloomIntensity,
}: {
  isHatching: boolean;
  setBloomIntensity: (intensity: number) => void;
}) {
  // アニメーションの経過時間を管理
  const animTimer = useRef(0);

  useFrame((state, delta) => {
    if (isHatching) {
      if (animTimer.current < ANIMATION_DURATION) {
        animTimer.current += delta;
      }
      const sinInput = (animTimer.current / ANIMATION_DURATION) * Math.PI;
      const pulse = Math.sin(sinInput);
      setBloomIntensity(NORMAL_BLOOM + pulse * MAX_BLOOM_PULSE);
    } else {
      setBloomIntensity(NORMAL_BLOOM);
      animTimer.current = 0;
    }
  });

  return null; // このコンポーネントは何も描画しない
}
