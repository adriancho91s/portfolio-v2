---
name: r3f-performance
description: Enforces the React Three Fiber performance budget for the portfolio hero scene. Invoke before writing or modifying any Three.js/R3F code.
allowed-tools: Read, Grep
---

## Budget (hard limits)

| Constraint | Limit |
|------------|-------|
| Total vertices in scene | < 2,000 |
| Draw calls | < 10 |
| Textures | 0 — use materials only |
| `dpr` cap | `[1, 1.5]` |
| Post-processing effects | Bloom only |

## Step 1 — Configure Canvas

Every `<Canvas>` in this project must use:
```tsx
<Canvas
  frameloop="demand"
  dpr={[1, 1.5]}
  camera={{ position: [0, 0, 5], fov: 45 }}
  gl={{ antialias: false, powerPreference: 'low-power', shadowMap: { enabled: false } }}
>
```

`frameloop="demand"` is **required** — renders only on scroll/mouse events, not every frame.

## Step 2 — Mobile guard (always first in HeroScene.tsx)

```tsx
const isDesktop = typeof window !== 'undefined'
  && window.matchMedia('(hover: hover) and (min-width: 768px)').matches
if (!isDesktop) return null  // CSS orb handles mobile
```

## Step 3 — Geometry allowed list

Use only: `IcosahedronGeometry`, `OctahedronGeometry`, `SphereGeometry`, `TorusGeometry`
Never: GLTF models, `BoxGeometry` with high segments, any texture maps

## Step 4 — Scroll morphing with useScroll

```tsx
import { useScroll } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function ScrollObject() {
  const scroll = useScroll()
  const meshRef = useRef()

  useFrame(() => {
    const t = scroll.offset  // 0 → 1 across full page scroll
    // Section map:
    // 0.00–0.15 → neural network (hero)
    // 0.15–0.35 → helix (timeline)
    // 0.35–0.55 → atom (skills)
    // 0.55–0.75 → crystal (projects)
    // 0.75–1.00 → dissolve (contact)
    meshRef.current.morphTargetInfluences[0] = THREE.MathUtils.lerp(
      meshRef.current.morphTargetInfluences[0],
      targetValue,
      0.1
    )
  })
}
```

## Step 5 — Bloom (only if glows needed)

```tsx
import { EffectComposer, Bloom } from '@react-three/postprocessing'

<EffectComposer>
  <Bloom luminanceThreshold={0.8} intensity={0.3} mipmapBlur />
</EffectComposer>
```

No other effects. Each effect is an additional render pass.

## Step 6 — Verify the island directive

The Canvas must be wrapped with `client:only="react"` in the parent `.astro` file (Three.js requires browser globals, SSR will crash).
