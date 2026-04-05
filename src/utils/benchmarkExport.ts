import type { BenchmarkResult } from '../types';

export function stamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

export function buildCsv(
  results: BenchmarkResult[],
  headers: { policy: string; hitRate: string; missRate: string; avgLatency: string; totalTime: string },
): string {
  const rows = [
    [headers.policy, headers.hitRate, headers.missRate, headers.avgLatency, headers.totalTime].join(','),
    ...results.map((r) =>
      [
        escapeCsv(r.policy),
        r.hitRate.toFixed(2),
        r.missRate.toFixed(2),
        r.avgLatencyUs.toFixed(2),
        r.totalTimeMs.toFixed(2),
      ].join(','),
    ),
  ];
  return rows.join('\r\n');
}

function escapeCsv(s: string): string {
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function downloadText(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Vector export: hit rate and latency bar charts in one SVG. */
export function buildBenchmarkSvg(
  results: BenchmarkResult[],
  title: string,
  labelHit: string,
  labelLat: string,
): string {
  const w = 800;
  const h = 380;
  const pad = 40;
  const innerW = w - pad * 2;
  const barMaxH = 100;
  const maxHit = Math.max(...results.map((r) => r.hitRate), 1);
  const maxLat = Math.max(...results.map((r) => r.avgLatencyUs), 0.01);
  const n = results.length;
  const slot = innerW / n;
  const barW = Math.min(slot - 12, 72);
  const colors = ['#6366f1', '#10b981', '#f59e0b'];

  const row = (
    baseY: number,
    label: string,
    getVal: (r: BenchmarkResult) => number,
    max: number,
    fmt: (v: number) => string,
  ) => {
    const parts: string[] = [
      `<text x="${pad}" y="${baseY - 8}" fill="#94a3b8" font-size="12" font-family="system-ui,sans-serif">${escapeXml(label)}</text>`,
    ];
    results.forEach((r, i) => {
      const v = getVal(r);
      const bh = (v / max) * barMaxH;
      const x = pad + i * slot + (slot - barW) / 2;
      const y = baseY + barMaxH - bh;
      const col = colors[i % colors.length];
      parts.push(
        `<rect x="${x}" y="${y}" width="${barW}" height="${bh}" fill="${col}" rx="4"/>`,
        `<text x="${x + barW / 2}" y="${baseY + barMaxH + 14}" text-anchor="middle" fill="#94a3b8" font-size="11" font-family="system-ui,sans-serif">${escapeXml(r.policy)}</text>`,
        `<text x="${x + barW / 2}" y="${baseY + barMaxH + 30}" text-anchor="middle" fill="#e2e8f0" font-size="12" font-family="ui-monospace,monospace">${escapeXml(fmt(v))}</text>`,
      );
    });
    return parts.join('');
  };

  const hitSvg = row(
    72,
    labelHit,
    (r) => r.hitRate,
    maxHit,
    (v) => `${v.toFixed(1)}%`,
  );
  const latSvg = row(
    220,
    labelLat,
    (r) => r.avgLatencyUs,
    maxLat,
    (v) => `${v.toFixed(2)} µs`,
  );

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <rect width="100%" height="100%" fill="#0f121a"/>
  <text x="${w / 2}" y="32" text-anchor="middle" fill="#f8fafc" font-size="16" font-weight="700" font-family="system-ui,sans-serif">${escapeXml(title)}</text>
  ${hitSvg}
  ${latSvg}
</svg>`;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export async function exportChartsPng(element: HTMLElement | null, filename: string): Promise<void> {
  if (!element) return;
  const { default: html2canvas } = await import('html2canvas');
  const bg = document.documentElement.getAttribute('data-theme') === 'light' ? '#ffffff' : '#0f121a';
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: bg,
    logging: false,
  });
  await new Promise<void>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        downloadBlob(filename, blob);
        resolve();
      } else reject(new Error('PNG blob failed'));
    }, 'image/png');
  });
}
