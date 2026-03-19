/**
 * Generate circular favicon PNGs from the avatar image.
 * Matches the navbar circle-chip style: circular crop, subtle border ring,
 * accent gradient glow.
 *
 * Usage: node scripts/generate-favicons.mjs
 */
import sharp from "sharp";
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const avatarPath = join(root, "public/images/avatar.png");

// Sizes to generate
const sizes = [
  { name: "favicon-512.png", size: 512 },
  { name: "favicon-32.png", size: 32 },
  { name: "apple-touch-icon.png", size: 180 },
];

async function generateFavicon(outputName, size) {
  const padding = Math.max(1, Math.round(size * 0.04)); // border thickness ~4%
  const innerSize = size - padding * 2;
  const radius = size / 2;
  const innerRadius = innerSize / 2;

  // Crop avatar to focus on the face (top portion), then resize to circle
  const avatar = await sharp(avatarPath)
    .resize(innerSize, innerSize, {
      fit: "cover",
      position: "top",
    })
    .composite([
      {
        // Circular mask for the avatar
        input: Buffer.from(
          `<svg width="${innerSize}" height="${innerSize}">
            <rect width="${innerSize}" height="${innerSize}" fill="black"/>
            <circle cx="${innerRadius}" cy="${innerRadius}" r="${innerRadius}" fill="white"/>
          </svg>`
        ),
        blend: "dest-in",
      },
    ])
    .png()
    .toBuffer();

  // Create the final image with border ring + gradient background
  const borderColor = "rgba(120, 180, 255, 0.35)"; // subtle blue-ish glow
  const bgDark = "#050506";

  const canvas = Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#60a5fa" stop-opacity="0.6"/>
          <stop offset="50%" stop-color="#a78bfa" stop-opacity="0.5"/>
          <stop offset="100%" stop-color="#f472b6" stop-opacity="0.6"/>
        </linearGradient>
      </defs>
      <!-- Background circle (dark) -->
      <circle cx="${radius}" cy="${radius}" r="${radius}" fill="${bgDark}"/>
      <!-- Gradient border ring -->
      <circle cx="${radius}" cy="${radius}" r="${radius - 0.5}" fill="none" stroke="url(#ring)" stroke-width="${padding * 1.5}"/>
    </svg>`
  );

  const result = await sharp(canvas)
    .composite([
      {
        input: avatar,
        left: padding,
        top: padding,
      },
    ])
    .png()
    .toBuffer();

  const outPath = join(root, "public", outputName);
  writeFileSync(outPath, result);
  console.log(`✓ ${outputName} (${size}×${size})`);
}

// Also create an SVG favicon that references the circular design
function generateSvgFavicon() {
  // SVG favicon with embedded circular avatar effect using initials as fallback
  // We use a clean circle + initials approach for the SVG since embedding
  // raster images in SVG favicons isn't universally supported
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <defs>
    <linearGradient id="ring" x1="0" y1="0" x2="128" y2="128" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#60a5fa"/>
      <stop offset="50%" stop-color="#a78bfa"/>
      <stop offset="100%" stop-color="#f472b6"/>
    </linearGradient>
    <linearGradient id="bg" x1="0" y1="0" x2="128" y2="128" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0a0a1a"/>
      <stop offset="100%" stop-color="#0f0f23"/>
    </linearGradient>
  </defs>
  <!-- Outer ring -->
  <circle cx="64" cy="64" r="62" fill="none" stroke="url(#ring)" stroke-width="4"/>
  <!-- Dark background -->
  <circle cx="64" cy="64" r="59" fill="url(#bg)"/>
  <!-- Initials -->
  <text x="64" y="72" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="48" fill="url(#ring)">A</text>
</svg>`;

  writeFileSync(join(root, "public/favicon.svg"), svg);
  console.log("✓ favicon.svg");
}

async function main() {
  console.log("Generating circular favicons...\n");

  for (const { name, size } of sizes) {
    await generateFavicon(name, size);
  }

  generateSvgFavicon();

  console.log("\nDone! All favicons generated.");
}

main().catch(console.error);
