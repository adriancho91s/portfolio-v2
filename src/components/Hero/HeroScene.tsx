'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

// ─── Constants ────────────────────────────────────────────────────────────────

const NODE_COUNT     = 68;
const MAX_CONNECTIONS = 100;

// Dark mode palette
const D_NODE  = new THREE.Color('#5E6AD2');
const D_EDGE  = new THREE.Color('#00D4FF');
const D_HALO  = new THREE.Color('#c8d2ff');

// Light mode palette — main indigo at low opacity: present but not heavy
const L_NODE  = new THREE.Color('#4f46e5'); // main accent indigo
const L_EDGE  = new THREE.Color('#818cf8'); // lighter indigo for edges
const L_HALO  = new THREE.Color('#c7d2fe'); // soft indigo halo

// ─── Deterministic RNG ────────────────────────────────────────────────────────

function makeRng(seed: number) {
  let s = seed;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) | 0;
    return (s >>> 0) / 0xffffffff;
  };
}

function randOnSphere(rng: () => number, rMin: number, rMax: number): THREE.Vector3 {
  const theta = rng() * Math.PI * 2;
  const phi   = Math.acos(2 * rng() - 1);
  const r     = rMin + rng() * (rMax - rMin);
  return new THREE.Vector3(
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.sin(phi) * Math.sin(theta),
    r * Math.cos(phi),
  );
}

// ─── Phase positions ──────────────────────────────────────────────────────────

/**
 * 4 phases (no dissolve — entity stays coherent throughout scroll):
 *  0 = neural net cluster   (hero)
 *  1 = DNA double helix     (timeline — career growth)
 *  2 = atomic orbits        (skills — domains orbiting a core)
 *  3 = icosahedron crystal  (projects — built, solid)
 */
function buildPhasePositions(): THREE.Vector3[][] {
  const rng0 = makeRng(42);

  // Phase 0 – neural network (two tighter clusters — like brain hemispheres)
  const p0 = Array.from({ length: NODE_COUNT }, (_, i) => {
    const cluster = i < NODE_COUNT * 0.55 ? -0.6 : 0.6; // left / right lobe
    const v = randOnSphere(rng0, 0.4, 1.7);
    v.x += cluster;
    return v;
  });

  // Phase 1 – DNA double helix
  const p1 = Array.from({ length: NODE_COUNT }, (_, i) => {
    const t      = (i / NODE_COUNT) * Math.PI * 5;
    const y      = (i / (NODE_COUNT - 1)) * 3.6 - 1.8;
    const strand = i % 2 === 0 ? 0 : Math.PI;
    return new THREE.Vector3(
      1.3 * Math.cos(t + strand),
      y,
      1.3 * Math.sin(t + strand),
    );
  });

  // Phase 2 – atomic orbits (3 rings)
  const p2: THREE.Vector3[] = [];
  const tilts = [0, Math.PI / 3, -Math.PI / 3];
  for (let i = 0; i < NODE_COUNT; i++) {
    const orbit = i % 3;
    const idx   = Math.floor(i / 3);
    const total = Math.ceil(NODE_COUNT / 3);
    const angle = (idx / total) * Math.PI * 2;
    const tilt  = tilts[orbit];
    const r     = 1.9;
    p2.push(new THREE.Vector3(
      r * Math.cos(angle),
      r * Math.sin(angle) * Math.cos(tilt),
      r * Math.sin(angle) * Math.sin(tilt),
    ));
  }

  // Phase 3 – icosahedron crystal (richer detail level)
  const icoGeo  = new THREE.IcosahedronGeometry(1.8, 2);
  const posAttr = icoGeo.getAttribute('position');
  const unique: THREE.Vector3[] = [];
  for (let i = 0; i < posAttr.count; i++) {
    const v = new THREE.Vector3().fromBufferAttribute(posAttr, i);
    if (!unique.some((u) => u.distanceTo(v) < 0.12)) unique.push(v);
  }
  icoGeo.dispose();
  const p3 = Array.from({ length: NODE_COUNT }, (_, i) => unique[i % unique.length].clone());

  return [p0, p1, p2, p3];
}

// ─── Connections ──────────────────────────────────────────────────────────────

function buildConnections(positions: THREE.Vector3[]): [number, number][] {
  const conns: [number, number][] = [];
  const maxDist = 1.1;
  for (let i = 0; i < positions.length && conns.length < MAX_CONNECTIONS; i++) {
    for (let j = i + 1; j < positions.length && conns.length < MAX_CONNECTIONS; j++) {
      if (positions[i].distanceTo(positions[j]) < maxDist) conns.push([i, j]);
    }
  }
  return conns;
}

// ─── NeuralScene ──────────────────────────────────────────────────────────────

interface NeuralSceneProps {
  phases: THREE.Vector3[][];
  connections: [number, number][];
  theme: 'dark' | 'light';
}

function NeuralScene({ phases, connections, theme }: NeuralSceneProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const meshRef  = useRef<THREE.InstancedMesh>(null!);
  const linesRef = useRef<THREE.LineSegments>(null!);

  const scrollRef = useRef(0);
  const mouseRef  = useRef({ x: 0, y: 0 });
  const curPos    = useRef(phases[0].map((v) => v.clone()));

  const isLight = theme === 'light';

  const nodeMat = useMemo(
    () => new THREE.MeshBasicMaterial({
      color: D_NODE,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
    [],
  );

  const lineMat = useMemo(
    () => new THREE.LineBasicMaterial({
      color: D_EDGE,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
    [],
  );

  // Switch material colors + blending when theme changes
  useEffect(() => {
    if (isLight) {
      nodeMat.color.copy(L_NODE);
      nodeMat.blending = THREE.NormalBlending;
      lineMat.color.copy(L_EDGE);
      lineMat.blending = THREE.NormalBlending;
    } else {
      nodeMat.color.copy(D_NODE);
      nodeMat.blending = THREE.AdditiveBlending;
      lineMat.color.copy(D_EDGE);
      lineMat.blending = THREE.AdditiveBlending;
    }
    nodeMat.needsUpdate = true;
    lineMat.needsUpdate = true;
  }, [isLight, nodeMat, lineMat]);

  const nodeGeo = useMemo(() => new THREE.SphereGeometry(1, 8, 8), []);

  const lineGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const buf = new Float32Array(connections.length * 2 * 3);
    geo.setAttribute('position', new THREE.BufferAttribute(buf, 3));
    return geo;
  }, [connections]);

  // Seed instanced transforms
  useEffect(() => {
    const dummy = new THREE.Object3D();
    for (let i = 0; i < NODE_COUNT; i++) {
      dummy.position.copy(phases[0][i]);
      dummy.scale.setScalar(0.055);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [phases]);

  // Scroll + mouse listeners
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scrollRef.current = max > 0 ? window.scrollY / max : 0;
    };
    const onMouse = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('mousemove', onMouse, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('mousemove', onMouse);
    };
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state, delta) => {
    if (!groupRef.current || !meshRef.current || !linesRef.current) return;

    const t    = Math.min(scrollRef.current, 1);
    const time = state.clock.elapsedTime;
    const mouse = mouseRef.current;

    // ── Phase selection (3 phases: neural → helix → atom → crystal) ──
    // 0.0–0.25 : neural   0.25–0.5 : → helix
    // 0.5–0.75 : → atom   0.75–1.0 : → crystal
    let fromIdx: number, toIdx: number, phaseT: number;
    if (t < 0.25) {
      fromIdx = 0; toIdx = 0; phaseT = 0;
    } else if (t < 0.5) {
      fromIdx = 0; toIdx = 1; phaseT = (t - 0.25) / 0.25;
    } else if (t < 0.75) {
      fromIdx = 1; toIdx = 2; phaseT = (t - 0.5)  / 0.25;
    } else {
      fromIdx = 2; toIdx = 3; phaseT = (t - 0.75) / 0.25;
    }
    const smoothT  = THREE.MathUtils.smoothstep(Math.min(phaseT, 1), 0, 1);
    const fromPhase = phases[fromIdx];
    const toPhase   = phases[toIdx];

    // ── Node positions ──
    for (let i = 0; i < NODE_COUNT; i++) {
      curPos.current[i].lerpVectors(fromPhase[i], toPhase[i], smoothT);
      dummy.position.copy(curPos.current[i]);
      const pulse = 0.048 + 0.014 * Math.sin(time * 2.0 + i * 0.65);
      dummy.scale.setScalar(pulse);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;

    // ── Edge positions ──
    const linePos = linesRef.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let c = 0; c < connections.length; c++) {
      const [a, b] = connections[c];
      linePos.setXYZ(c * 2,     curPos.current[a].x, curPos.current[a].y, curPos.current[a].z);
      linePos.setXYZ(c * 2 + 1, curPos.current[b].x, curPos.current[b].y, curPos.current[b].z);
    }
    linePos.needsUpdate = true;

    // ── Connection opacity (fade while transitioning, come back in crystal) ──
    const baseOpacity = isLight ? 0.18 : 0.35;
    const midOpacity  = isLight ? 0.05 : 0.1;
    const endOpacity  = isLight ? 0.14 : 0.3;
    if (t < 0.3) {
      lineMat.opacity = baseOpacity;
    } else if (t < 0.5) {
      lineMat.opacity = THREE.MathUtils.lerp(baseOpacity, midOpacity, (t - 0.3) / 0.2);
    } else if (t < 0.72) {
      lineMat.opacity = midOpacity;
    } else {
      lineMat.opacity = THREE.MathUtils.lerp(midOpacity, endOpacity, (t - 0.72) / 0.28);
    }

    // ── Node opacity ──
    nodeMat.opacity = isLight ? 0.28 : 1;

    // ── Companion positioning: docks to center-right, stays present ──
    const dockT    = t < 0.12
      ? 0
      : THREE.MathUtils.smoothstep(Math.min((t - 0.12) / 0.18, 1), 0, 1);
    const targetX  = THREE.MathUtils.lerp(0, 3.2, dockT);
    const targetY  = THREE.MathUtils.lerp(0, 0.1, dockT);
    const targetSc = THREE.MathUtils.lerp(1, 0.72, dockT);

    groupRef.current.position.x +=
      (targetX - groupRef.current.position.x) * Math.min(delta * 5, 1);
    groupRef.current.position.y +=
      (targetY - groupRef.current.position.y) * Math.min(delta * 5, 1);
    groupRef.current.scale.setScalar(
      groupRef.current.scale.x + (targetSc - groupRef.current.scale.x) * Math.min(delta * 5, 1),
    );

    // ── Rotation: mouse-reactive in hero, section-aware idle elsewhere ──
    if (t < 0.15) {
      groupRef.current.rotation.y +=
        (mouse.x * 0.4 - groupRef.current.rotation.y) * Math.min(delta * 3, 1);
      groupRef.current.rotation.x +=
        (-mouse.y * 0.25 - groupRef.current.rotation.x) * Math.min(delta * 3, 1);
    } else {
      const idleSpeed = THREE.MathUtils.lerp(0.14, 0.06, Math.min(t / 0.8, 1));
      groupRef.current.rotation.y += delta * idleSpeed;
      groupRef.current.rotation.x +=
        (Math.sin(time * 0.25) * 0.12 - groupRef.current.rotation.x) * Math.min(delta * 1.5, 1);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Nodes */}
      <instancedMesh ref={meshRef} args={[nodeGeo, nodeMat, NODE_COUNT]} />

      {/* Edges */}
      <lineSegments ref={linesRef} geometry={lineGeo} material={lineMat} />

      {/* Core — the "mind" of the entity */}
      <mesh>
        <sphereGeometry args={[0.22, 20, 20]} />
        <meshBasicMaterial
          color={isLight ? L_NODE : D_NODE}
          transparent
          opacity={isLight ? 0.35 : 0.85}
          blending={isLight ? THREE.NormalBlending : THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Outer glow halo */}
      <mesh>
        <sphereGeometry args={[0.38, 16, 16]} />
        <meshBasicMaterial
          color={isLight ? L_HALO : D_HALO}
          transparent
          opacity={isLight ? 0.22 : 0.12}
          blending={isLight ? THREE.NormalBlending : THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────

export function HeroScene() {
  const [ready, setReady] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(min-width: 1024px)').matches) return;
    setReady(true);

    // Read initial theme
    const getTheme = () =>
      (document.documentElement.getAttribute('data-theme') as 'dark' | 'light') || 'dark';
    setTheme(getTheme());

    // Observe theme attribute changes
    const observer = new MutationObserver(() => setTheme(getTheme()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    return () => observer.disconnect();
  }, []);

  const phases      = useMemo(() => buildPhasePositions(), []);
  const connections = useMemo(() => buildConnections(phases[0]), [phases]);

  if (!ready) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
      }}
    >
      <Canvas
        frameloop="always"
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 5.2], fov: 58 }}
        gl={{ antialias: true, alpha: true }}
      >
        <NeuralScene phases={phases} connections={connections} theme={theme} />
      </Canvas>
    </div>
  );
}

export default HeroScene;
