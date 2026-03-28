import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Gemini Flash — cheapest vision model, ~$0.000075 per image call
const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY ||
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
  ''
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain');
  if (!domain) return NextResponse.json({ error: 'Domain required' }, { status: 400 });

  try {
    const url = domain.startsWith('http') ? domain : `https://${domain}`;
    const urlObj = new URL(url);
    const baseUrl = `${urlObj.protocol}//${urlObj.host}`;

    const html = await fetchHtml(url);
    const name = extractName(html, domain);
    const logoUrl = extractLogo(html, baseUrl, domain);

    // Step 1: Fast CSS scrape for candidates
    const cssUrls = extractCssUrls(html, baseUrl);
    const inlineCss = extractInlineStyles(html);
    const candidates = await scrapeCandidateColors(cssUrls, inlineCss, html);

    // Step 2: AI refinement — Gemini Flash Vision looks at the logo + candidates
    const colors = await refineColorsWithAI(logoUrl, candidates, name);

    return NextResponse.json({ name, logoUrl, colors, found: true });

  } catch (err: any) {
    return NextResponse.json({ error: 'Brand not found', found: false }, { status: 404 });
  }
}

// ─── FETCH ─────────────────────────────────────────────────────────────────────

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
    },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  if (!text.includes('<')) throw new Error('Not HTML');
  return text;
}

async function fetchText(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return '';
    return (await res.text()).slice(0, 300_000);
  } catch { return ''; }
}

// ─── NAME ──────────────────────────────────────────────────────────────────────

function extractName(html: string, domain: string): string {
  const ogSite = html.match(/property=["']og:site_name["'][^>]*content=["']([^"']{2,60})["']/i)?.[1]
               || html.match(/content=["']([^"']{2,60})["'][^>]*property=["']og:site_name["']/i)?.[1];
  const title  = html.match(/<title[^>]*>([^<]{2,80})<\/title>/i)?.[1]?.trim();
  const name = (ogSite || title || domain).split('|')[0].split(' - ')[0].split(' – ')[0].trim();
  return name || domain.split('.')[0];
}

// ─── LOGO ──────────────────────────────────────────────────────────────────────

function resolve(src: string, base: string): string {
  if (!src) return '';
  if (src.startsWith('data:')) return src;
  if (src.startsWith('//')) return 'https:' + src;
  if (src.startsWith('http')) return src;
  if (src.startsWith('/')) return base + src;
  return base + '/' + src;
}

function extractLogo(html: string, base: string, domain: string): string {
  const navHtml = html.match(/<(?:header|nav)[\s\S]*?<\/(?:header|nav)>/i)?.[0] || '';

  if (navHtml) {
    const svgSrc = navHtml.match(/<img[^>]+src=["']([^"']*\.svg[^"']*)["']/i)?.[1];
    if (svgSrc) return resolve(svgSrc, base);
    for (const p of [
      /<img[^>]+src=["']([^"']+)["'][^>]*(?:class|alt|id)=["'][^"']*logo[^"']*["']/i,
      /<img[^>]*(?:class|alt|id)=["'][^"']*logo[^"']*["'][^>]*src=["']([^"']+)["']/i,
      /<img[^>]+src=["']([^"']*logo[^"']*)["']/i,
    ]) {
      const m = navHtml.match(p);
      if (m?.[1]) return resolve(m[1], base);
    }
  }

  const anyLogo = html.match(/<img[^>]+src=["']([^"']*logo[^"']*\.(?:svg|png|webp)[^"']*)["']/i)?.[1];
  if (anyLogo) return resolve(anyLogo, base);

  const og = html.match(/property=["']og:image["'][^>]*content=["']([^"']+)["']/i)?.[1]
           || html.match(/content=["']([^"']+)["'][^>]*property=["']og:image["']/i)?.[1];
  if (og) return resolve(og, base);

  const apple = html.match(/<link[^>]*rel=["']apple-touch-icon["'][^>]*href=["']([^"']+)["']/i)?.[1]
              || html.match(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["']apple-touch-icon["']/i)?.[1];
  if (apple) return resolve(apple, base);

  return `https://www.google.com/s2/favicons?domain=${domain}&sz=256`;
}

// ─── CSS CANDIDATES ────────────────────────────────────────────────────────────

function extractCssUrls(html: string, base: string): string[] {
  const urls: string[] = [];
  const re = /<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const href = resolve(m[1], base);
    if (href.startsWith('http')) urls.push(href);
  }
  return urls.slice(0, 4);
}

function extractInlineStyles(html: string): string {
  const blocks: string[] = [];
  const re = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let m;
  while ((m = re.exec(html)) !== null) blocks.push(m[1]);
  return blocks.join('\n');
}

async function scrapeCandidateColors(cssUrls: string[], inlineCss: string, html: string): Promise<string[]> {
  const externalCss = (await Promise.all(cssUrls.map(fetchText))).join('\n');
  const allCss = inlineCss + '\n' + externalCss;

  // Frequency map: count every hex color in the CSS
  const freq = new Map<string, number>();
  const hexRe = /#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g;
  let hm;
  while ((hm = hexRe.exec(allCss)) !== null) {
    const hex = normalizeHex('#' + hm[1]);
    if (!hex) continue;
    freq.set(hex, (freq.get(hex) || 0) + 1);
  }

  // Also parse rgb/hsl values
  const rgbRe = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g;
  let rm;
  while ((rm = rgbRe.exec(allCss)) !== null) {
    const hex = rgbToHex(parseInt(rm[1]), parseInt(rm[2]), parseInt(rm[3]));
    if (hex) freq.set(hex, (freq.get(hex) || 0) + 1);
  }

  const hslRe = /hsla?\(\s*([\d.]+)(?:deg)?\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%/g;
  let sm;
  while ((sm = hslRe.exec(allCss)) !== null) {
    const hex = hslToHex(parseFloat(sm[1]), parseFloat(sm[2]), parseFloat(sm[3]));
    if (hex) freq.set(hex, (freq.get(hex) || 0) + 1);
  }

  // Meta tags fallback
  const theme = html.match(/name=["']theme-color["'][^>]*content=["']([^"']+)["']/i)?.[1]
              || html.match(/content=["']([^"']+)["'][^>]*name=["']theme-color["']/i)?.[1];
  if (theme) { const c = parseAnyColor(theme); if (c) freq.set(c, (freq.get(c) || 0) + 5); }

  const tile = html.match(/name=["']msapplication-TileColor["'][^>]*content=["']([^"']+)["']/i)?.[1];
  if (tile)  { const c = parseAnyColor(tile);  if (c) freq.set(c, (freq.get(c) || 0) + 5); }

  // Sort by frequency, filter out boring neutrals
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([hex]) => hex)
    .filter(hex => !isNearNeutral(hex) && !isFrameworkDefault(hex))
    .slice(0, 20); // give AI up to 20 candidates to choose from
}

// ─── AI REFINEMENT ─────────────────────────────────────────────────────────────

async function refineColorsWithAI(logoUrl: string, candidates: string[], brandName: string): Promise<string[]> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const parts: any[] = [];

    // Try to fetch the logo image for vision analysis
    if (logoUrl && !logoUrl.includes('google.com/s2')) {
      try {
        const imgRes = await fetch(logoUrl, { signal: AbortSignal.timeout(4000) });
        if (imgRes.ok) {
          const contentType = imgRes.headers.get('content-type') || 'image/png';
          // Only include if it's an image type gemini supports
          if (contentType.startsWith('image/') && !contentType.includes('svg')) {
            const buffer = await imgRes.arrayBuffer();
            const base64 = Buffer.from(buffer).toString('base64');
            parts.push({
              inlineData: { data: base64, mimeType: contentType.split(';')[0] }
            });
          }
        }
      } catch { /* logo fetch failed, proceed with text only */ }
    }

    const candidateText = candidates.length > 0
      ? `CSS candidate colors found on site (sorted by frequency): ${candidates.join(', ')}`
      : 'No CSS colors extracted.';

    parts.push({
      text: `You are a brand color expert. I need the 3 primary brand colors for "${brandName}".

${candidateText}

${parts.length > 1 ? 'I have also provided the brand logo image above.' : ''}

Rules:
- Return ONLY a valid JSON array of exactly 3 hex color strings, e.g. ["#e03232","#1a1a2e","#f5f5f5"]
- Pick colors that are clearly brand colors (not generic web defaults like Bootstrap blue #007bff, generic gray, pure black #000000 or pure white #ffffff)
- If the logo image is provided, prioritize colors visible in the logo
- Prefer chromatic (non-gray) colors for the first 2 slots
- The 3rd color can be a neutral complement (off-white, light gray, or dark tone)
- If you cannot confidently determine brand colors, pick the best chromatic candidates from the CSS list
- Return NOTHING except the JSON array`
    });

    const result = await model.generateContent({ contents: [{ role: 'user', parts }] });
    const text = result.response.text().trim();

    // Parse the JSON array from response
    const match = text.match(/\[[\s\S]*\]/);
    if (match) {
      const parsed = JSON.parse(match[0]) as string[];
      const valid = parsed
        .filter((c): c is string => typeof c === 'string')
        .map(c => normalizeHex(c))
        .filter((c): c is string => c !== null);
      if (valid.length === 3) return valid;
      if (valid.length >= 1) {
        // Pad if needed
        while (valid.length < 3) valid.push(valid.length === 1 ? '#f5f5f5' : '#e8e4dc');
        return valid.slice(0, 3);
      }
    }
  } catch (err) {
    console.error('Gemini color refinement failed:', err);
  }

  // Fallback: return top 3 from CSS candidates or default palette
  if (candidates.length >= 3) return candidates.slice(0, 3);
  if (candidates.length === 1) return [candidates[0], '#f5f5f5', '#e8e4dc'];
  if (candidates.length === 2) return [candidates[0], candidates[1], '#f0ede8'];
  return ['#1a1a2e', '#e94560', '#f5f5f5'];
}

// ─── COLOR UTILS ───────────────────────────────────────────────────────────────

function normalizeHex(raw: string): string | null {
  if (!raw) return null;
  const hex3 = raw.match(/^#([0-9a-f]{3})$/i);
  if (hex3) {
    const h = hex3[1];
    return ('#' + h[0]+h[0] + h[1]+h[1] + h[2]+h[2]).toLowerCase();
  }
  const hex6 = raw.match(/^#([0-9a-f]{6})$/i);
  if (hex6) return ('#' + hex6[1]).toLowerCase();
  return null;
}

function rgbToHex(r: number, g: number, b: number): string | null {
  if ([r,g,b].some(v => v < 0 || v > 255)) return null;
  return '#' + [r,g,b].map(n => n.toString(16).padStart(2,'0')).join('');
}

function hslToHex(h: number, s: number, l: number): string | null {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return Math.round(255 * (l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1))).toString(16).padStart(2,'0');
  };
  return '#' + f(0) + f(8) + f(4);
}

function parseAnyColor(raw: string): string | null {
  const s = raw.trim();
  const hex = normalizeHex(s);
  if (hex) return hex;
  const rgb = s.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgb) return rgbToHex(parseInt(rgb[1]), parseInt(rgb[2]), parseInt(rgb[3]));
  return null;
}

/** True for colors that are near-black, near-white, or very desaturated */
function isNearNeutral(hex: string): boolean {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  const lightness = (max + min) / 510;
  const saturation = max === 0 ? 0 : (max - min) / max;
  return lightness < 0.07 || lightness > 0.94 || saturation < 0.07;
}

/** Common framework/browser default colors to filter out */
const FRAMEWORK_DEFAULTS = new Set([
  '#007bff','#0d6efd','#0dcaf0','#198754','#dc3545','#ffc107','#6c757d', // Bootstrap
  '#3b82f6','#10b981','#ef4444','#f59e0b','#6366f1','#8b5cf6',           // Tailwind
  '#1677ff','#52c41a','#ff4d4f',                                          // Ant Design
  '#2196f3','#4caf50','#f44336','#ff9800','#9c27b0',                      // Material UI
  '#ff0000','#00ff00','#0000ff','#ffff00','#ff00ff','#00ffff',            // pure primaries
]);

function isFrameworkDefault(hex: string): boolean {
  return FRAMEWORK_DEFAULTS.has(hex.toLowerCase());
}
