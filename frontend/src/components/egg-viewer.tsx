"use client";
import { cn } from "@/lib/utils";
import { Decal, OrbitControls, useGLTF, useTexture } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

const EGG_MODEL_PATH = "/models/egg.glb";
const MAX_CRACKS = 10;
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
  return (
    <div className={cn("h-full w-full", className)}>
      <Canvas camera={{ position: [0, 1, 2] }}>
        <color attach="background" args={["#f0f0f0"]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={0.7} />
        <OrbitControls
          enableZoom={true}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={(Math.PI * 2) / 3}
        />
        <EggModelWithDecals crackUrls={crackUrls} />
      </Canvas>
    </div>
  );
}

function EggModelWithDecals({ crackUrls }: { crackUrls: string[] }) {
  const { nodes, materials } = useGLTF(EGG_MODEL_PATH);
  const textures = useTexture(crackUrls);
  const meshRef = useRef<THREE.Mesh>(null);

  // ヒビの数に応じて揺れるアニメーション
  const crackCount = textures.length;
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    if (crackCount === 0 || time % 6 < 4) {
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
    >
      {textures.map((texture, index) => (
        <Decal
          key={texture.uuid}
          position={CRACK_POSITIONS[index]}
          rotation={CRACK_ROTATIONS[index]}
          map={texture}
          scale={0.7}
        />
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
