"use client";
import { Decal, OrbitControls, useGLTF, useTexture } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";

const EGG_MODEL_PATH = "/models/egg.glb";
const MAX_CRACKS = 10;
const CRACK_POSITIONS = Array.from(
  { length: MAX_CRACKS },
  (_, i) =>
    new THREE.Vector3(
      Math.sin((i / MAX_CRACKS) * Math.PI * 2),
      Math.cos((i / MAX_CRACKS) * Math.PI * 2),
      Math.sin((i / MAX_CRACKS) * Math.PI * 2 * 1.5),
    ),
);
const CRACK_ROTATIONS = CRACK_POSITIONS.map((pos) =>
  new THREE.Euler().setFromVector3(pos.clone().multiplyScalar(Math.PI / 2)),
);

interface EggViewerProps {
  crackUrls: string[];
  className?: string;
}

export default function EggViewer({ crackUrls, className }: EggViewerProps) {
  return (
    <Canvas className={className}>
      <color attach="background" args={["#f0f0f0"]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <OrbitControls enableZoom={true} />
      <EggModelWithDecals crackUrls={crackUrls} />
    </Canvas>
  );
}

function EggModelWithDecals({ crackUrls }: { crackUrls: string[] }) {
  const { nodes, materials } = useGLTF(EGG_MODEL_PATH);
  const textures = useTexture(crackUrls);

  return (
    <mesh
      geometry={(nodes.Egg as THREE.Mesh).geometry}
      material={materials.EggMaterial}
    >
      {textures.map((texture, index) => (
        <Decal
          key={texture.uuid}
          position={CRACK_POSITIONS[index]}
          rotation={CRACK_ROTATIONS[index]}
          map={texture}
          scale={0.5}
        />
      ))}
    </mesh>
  );
}
