'use client';

/**
 * ShimmerCard — Evervault-inspired mouse-reactive shimmer.
 *
 * Inline `style` is used ONLY for:
 *   - framer-motion MotionValue (maskImage) — no Tailwind equivalent
 *   - Complex radial/linear gradient strings — no Tailwind utility
 * All colors use Tailwind @theme tokens (text-accent, bg-surface-elevated, etc.)
 */

import { useMotionTemplate, useMotionValue, motion, type MotionValue } from 'framer-motion';
import { cn } from '@lib/utils';

interface ShimmerOverlayProps {
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
}

export function ShimmerOverlay({ mouseX, mouseY }: ShimmerOverlayProps) {
  const maskImage = useMotionTemplate`radial-gradient(320px at ${mouseX}px ${mouseY}px, white, transparent)`;

  return (
    <div className="pointer-events-none absolute inset-0 rounded-[inherit] z-0">

      {/* Ambient top glow */}
      <div
        className="absolute inset-0 rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 0%, var(--accent-glow), transparent)',
        }}
      />

      {/* Mouse-reactive spotlight through radial mask */}
      <motion.div
        className="absolute inset-0 rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ maskImage, WebkitMaskImage: maskImage }}
      >
        <div
          className="absolute inset-0 rounded-[inherit] opacity-[0.18]"
          style={{
            background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
          }}
        />
      </motion.div>

      {/* Border glow through same mask */}
      <motion.div
        className="absolute inset-0 rounded-[inherit] opacity-0 group-hover:opacity-50 transition-opacity duration-500"
        style={{ maskImage, WebkitMaskImage: maskImage }}
      >
        <div className="absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-accent" />
      </motion.div>
    </div>
  );
}

interface ShimmerCardProps {
  children: React.ReactNode;
  className?: string;
}

export function ShimmerCard({ children, className }: ShimmerCardProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  }

  return (
    <div
      className={cn('group relative cursor-pointer', className)}
      onMouseMove={handleMouseMove}
    >
      <ShimmerOverlay mouseX={mouseX} mouseY={mouseY} />
      {children}
    </div>
  );
}
