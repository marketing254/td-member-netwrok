"use client";
import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, RoundedBox, Sparkles, Text } from "@react-three/drei";
import * as THREE from "three";

/**
 * Content-related 3D scene for DMN.
 *
 * Visual layers, from back to front:
 *  1. Soft starfield of 220 distant dots — depth + ambience
 *  2. ~28 small membership "nodes" (smooth spheres, no faceted hex/pentagon look)
 *     connected by hairline gold edges — represents the practice-owner network
 *  3. Four large floating PLAQUES at orbit positions, each carrying the name
 *     of one of the four core features from the content guide:
 *       Expert Helpline · Partner Discounts · Content Library · Member Directory
 *     The plaques tilt gently with the cursor and orbit slowly around the center.
 *  4. A bright gold "you, when you join" node pulses at the heart of the network.
 *
 * Tuned for a DARK navy hero background — uses light/gold accents with warm gold
 * edges for high contrast against the deep navy backdrop.
 */
export default function NetworkScene() {
  return (
    <Canvas
      dpr={[1, 1.6]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 9.5], fov: 42 }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1 }}
    >
      <color attach="background" args={["#00000000"]} />
      <Suspense fallback={null}>
        <SceneContent />
      </Suspense>
    </Canvas>
  );
}

const FEATURE_PLAQUES = [
  { label: "Helpline", subtitle: "2 hr", angle: -0.35, radius: 4.4, depth: -0.6 },
  { label: "Vendors", subtitle: "$6K+/yr", angle: 1.2, radius: 5.2, depth: -1.2 },
  { label: "Library", subtitle: "Weekly", angle: 2.6, radius: 4.6, depth: -0.4 },
  { label: "Directory", subtitle: "500+", angle: 4.4, radius: 5.0, depth: -1.0 },
];

const NETWORK_NODE_COUNT = 28;

function buildNetwork() {
  let seed = 0xD3A11;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed % 10000) / 10000;
  };

  const nodes: { position: [number, number, number]; size: number }[] = [];
  for (let i = 0; i < NETWORK_NODE_COUNT; i++) {
    const phi = Math.acos(2 * rand() - 1);
    const theta = rand() * Math.PI * 2;
    const r = 2.4 + rand() * 1.6;
    nodes.push({
      position: [
        r * Math.sin(phi) * Math.cos(theta) * 1.15,
        r * Math.sin(phi) * Math.sin(theta) * 0.55,
        r * Math.cos(phi) * 0.85 - 1,
      ],
      size: 0.055 + rand() * 0.06,
    });
  }

  // Each node connects to its 2 nearest neighbors
  const edges: [number, number][] = [];
  const seen = new Set<string>();
  for (let i = 0; i < nodes.length; i++) {
    const dists: { j: number; d: number }[] = [];
    for (let j = 0; j < nodes.length; j++) {
      if (i === j) continue;
      const a = nodes[i].position;
      const b = nodes[j].position;
      dists.push({ j, d: Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) });
    }
    dists.sort((x, y) => x.d - y.d);
    for (let n = 0; n < 2 && n < dists.length; n++) {
      const j = dists[n].j;
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (!seen.has(key)) {
        seen.add(key);
        edges.push([i, j]);
      }
    }
  }
  return { nodes, edges };
}

function SceneContent() {
  const { mouse } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const pulseRef = useRef<THREE.Mesh>(null);

  const { nodes, edges } = useMemo(buildNetwork, []);

  const lineGeometry = useMemo(() => {
    const positions = new Float32Array(edges.length * 2 * 3);
    edges.forEach(([i, j], idx) => {
      positions.set(nodes[i].position, idx * 6);
      positions.set(nodes[j].position, idx * 6 + 3);
    });
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geom;
  }, [edges, nodes]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.04 + mouse.x * 0.16;
      groupRef.current.rotation.x = mouse.y * -0.08 + Math.sin(t * 0.2) * 0.025;
    }
    if (pulseRef.current) {
      const s = 1 + Math.sin(t * 2) * 0.18;
      pulseRef.current.scale.set(s, s, s);
      (pulseRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.35 + Math.sin(t * 2) * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.95} />
      <pointLight position={[6, 4, 6]} intensity={1.4} color="#F0C16E" />
      <pointLight position={[-5, -3, 4]} intensity={0.7} color="#5A8AC8" />

      {/* Background star dots */}
      <Sparkles count={220} scale={[18, 10, 12]} size={0.9} speed={0.1} opacity={0.25} color="#A07823" />

      {/* Network edges — warm gold hairlines */}
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial color="#C99A3A" transparent opacity={0.32} depthWrite={false} />
      </lineSegments>

      {/* Smooth member nodes */}
      {nodes.map((node, i) => (
        <mesh key={i} position={node.position}>
          <sphereGeometry args={[node.size, 24, 24]} />
          <meshStandardMaterial
            color="#0E2A3D"
            emissive="#1B4258"
            emissiveIntensity={0.3}
            roughness={0.35}
            metalness={0.4}
          />
        </mesh>
      ))}

      {/* "You, when you join" — bright pulse at the center */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.18, 28, 28]} />
        <meshStandardMaterial
          color="#F0C16E"
          emissive="#F0C16E"
          emissiveIntensity={1.2}
          roughness={0.2}
          metalness={0.5}
        />
      </mesh>
      <mesh ref={pulseRef} position={[0, 0, 0]}>
        <sphereGeometry args={[0.36, 28, 28]} />
        <meshBasicMaterial color="#F0C16E" transparent opacity={0.35} depthWrite={false} />
      </mesh>

      {/* Floating feature plaques — orbiting around the network, content-related */}
      {FEATURE_PLAQUES.map((p, i) => (
        <OrbitingPlaque key={p.label} {...p} index={i} />
      ))}
    </group>
  );
}

function OrbitingPlaque({
  label,
  subtitle,
  angle,
  radius,
  depth,
  index,
}: {
  label: string;
  subtitle: string;
  angle: number;
  radius: number;
  depth: number;
  index: number;
}) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (!ref.current) return;
    // Slow elliptical orbit + subtle bobbing
    const a = angle + t * 0.05;
    ref.current.position.x = Math.cos(a) * radius;
    ref.current.position.y = Math.sin(a) * radius * 0.4 + depth;
    ref.current.position.z = Math.sin(a) * 0.6 - 1;
    // Always face roughly the camera (subtle gentle rotation)
    ref.current.rotation.y = -a * 0.4 + Math.sin(t * 0.5 + index) * 0.06;
    ref.current.rotation.x = Math.sin(t * 0.4 + index) * 0.04;
  });

  return (
    <Float speed={1.2} rotationIntensity={0.12} floatIntensity={0.35}>
      <group ref={ref}>
        {/* Plaque card — compact pill, easier to read */}
        <RoundedBox args={[1.3, 0.5, 0.06]} radius={0.12} smoothness={6} castShadow>
          <meshStandardMaterial
            color="#FFFFFF"
            emissive="#FFF6E0"
            emissiveIntensity={0.18}
            roughness={0.4}
            metalness={0.15}
          />
        </RoundedBox>

        {/* Gold accent dot on the left */}
        <mesh position={[-0.5, 0, 0.04]}>
          <circleGeometry args={[0.05, 24]} />
          <meshBasicMaterial color="#D9A84B" />
        </mesh>

        {/* Plaque title */}
        <Text
          position={[0.05, 0.07, 0.04]}
          fontSize={0.14}
          color="#0A1A2F"
          anchorX="center"
          anchorY="middle"
          maxWidth={1.15}
          letterSpacing={-0.01}
          fontWeight="bold"
        >
          {label}
        </Text>

        {/* Plaque subtitle */}
        <Text
          position={[0.05, -0.12, 0.04]}
          fontSize={0.08}
          color="#A07823"
          anchorX="center"
          anchorY="middle"
          maxWidth={1.15}
          letterSpacing={0.06}
        >
          {subtitle.toUpperCase()}
        </Text>

        {/* Connecting line to the center "you" node */}
        <line>
          <bufferGeometry
            attach="geometry"
            attributes={{
              position: new THREE.BufferAttribute(
                new Float32Array([0, 0, 0, -radius, 0, 1]),
                3,
              ),
            }}
          />
          <lineBasicMaterial color="#D9A84B" transparent opacity={0.15} depthWrite={false} />
        </line>
      </group>
    </Float>
  );
}
