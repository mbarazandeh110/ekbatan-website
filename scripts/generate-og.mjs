import sharp from 'sharp';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const logoPath = resolve('public/Ekbatan_logo.png');
const outPath = resolve('public/og-default.png');

const svgBackground = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#050811"/>
      <stop offset="55%" stop-color="#0B1221"/>
      <stop offset="100%" stop-color="#082032"/>
    </linearGradient>
    <radialGradient id="glow" cx="80%" cy="20%" r="60%">
      <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="#06b6d4" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect x="44" y="44" width="1112" height="542" rx="28" fill="none" stroke="#1e293b" stroke-width="2"/>
  <rect x="88" y="96" width="290" height="38" rx="19" fill="#083344" stroke="#0e7490" stroke-width="1.5"/>
  <text x="233" y="120" text-anchor="middle" fill="#22d3ee" font-family="monospace" font-size="16" font-weight="700">MISSION-CRITICAL CLOUD</text>
  <text x="88" y="255" fill="#ffffff" font-family="sans-serif" font-size="68" font-weight="900">EKBATAN TECH</text>
  <text x="88" y="325" fill="#38bdf8" font-family="monospace" font-size="28" font-weight="600">Kubernetes • Ceph • Cilium eBPF • CDN • MLOps</text>
  <text x="88" y="395" fill="#94a3b8" font-family="sans-serif" font-size="26">Enterprise Platform Engineering &amp; Managed SRE (SLA 99.96%)</text>
  <line x1="88" y1="470" x2="1112" y2="470" stroke="#1e293b" stroke-width="1.5"/>
  <text x="88" y="525" fill="#e2e8f0" font-family="monospace" font-size="24" font-weight="700">https://ekbatan.tech</text>
  <text x="1112" y="525" text-anchor="end" fill="#10b981" font-family="monospace" font-size="20">HA &amp; DR • Bare-Metal Ready</text>
</svg>
`;

async function main() {
  const composites = [];
  if (existsSync(logoPath)) {
    const resizedLogo = await sharp(logoPath).resize(148, 148, { fit: 'contain' }).png().toBuffer();
    composites.push({ input: resizedLogo, top: 96, left: 960 });
  }

  await sharp(Buffer.from(svgBackground))
    .composite(composites)
    .png({ compressionLevel: 9 })
    .toFile(outPath);

  console.log(`✅ Generated Open Graph banner at ${outPath}`);
}

main().catch((err) => {
  console.error('❌ Failed to generate OG image:', err);
  process.exit(1);
});
