import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain');

  if (!domain) {
    return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
  }

  try {
    const url = domain.startsWith('http') ? domain : `https://${domain}`;
    
    // 1. Fetch the HTML to extract brand clues safely from the server
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AirdomeBot/1.0; +http://airdome.com)'
      },
      // Next.js standard fetch doesn't support AbortSignal.timeout directly in all versions, 
      // but we can just let it timeout naturally or use a simple controller
    });
    
    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }

    const html = await response.text();
    
    // 2. Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    let title = titleMatch ? titleMatch[1].trim() : domain;
    // Clean up title (remove " - Home" etc)
    title = title.split('|')[0].split('-')[0].trim();
    
    // 3. Extract theme color
    const themeColorMatch = html.match(/<meta[^>]*name="theme-color"[^>]*content="([^"]+)"[^>]*>/i) || 
                            html.match(/<meta[^>]*content="([^"]+)"[^>]*name="theme-color"[^>]*>/i);
    let themeColor = themeColorMatch ? themeColorMatch[1] : null;
    
    // 4. Extract apple-touch-icon or shortcut icon
    let iconUrl = null;
    const iconMatch = html.match(/<link[^>]*rel="(?:apple-touch-icon|icon|shortcut icon)"[^>]*href="([^"]+)"[^>]*>/i);
    if (iconMatch) {
      let rawIcon = iconMatch[1];
      if (rawIcon.startsWith('//')) {
        iconUrl = 'https:' + rawIcon;
      } else if (rawIcon.startsWith('/')) {
        const urlObj = new URL(url);
        iconUrl = `${urlObj.protocol}//${urlObj.host}${rawIcon}`;
      } else if (!rawIcon.startsWith('http')) {
        const urlObj = new URL(url);
        iconUrl = `${urlObj.protocol}//${urlObj.host}/${rawIcon}`;
      } else {
        iconUrl = rawIcon;
      }
    }
    
    // Fallback to Google Favicon API if no icon found in HTML
    if (!iconUrl) {
      // The larger sizes are more likely to look like a brand logo rather than a tiny 16x16 icon
      iconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=256`;
    }
    
    // Generate some complementary colors based on the theme color or deterministically
    const defaultColors = themeColor 
        ? [themeColor, '#111111', '#F4F4F5'] 
        : getFallbackColors(domain);

    return NextResponse.json({
      name: title || domain,
      logoUrl: iconUrl,
      colors: defaultColors
    });
    
  } catch (error) {
    console.error('Error fetching brand domain:', error);
    // If we fail to fetch (e.g. blocking, timeout), fallback gracefully
    return NextResponse.json({
      name: domain.split('.')[0] || domain,
      logoUrl: `https://www.google.com/s2/favicons?domain=${domain}&sz=256`,
      colors: getFallbackColors(domain)
    });
  }
}

function getFallbackColors(str: string) {
  // Generate deterministic mock colors based on string characters
  // This ensures the same domain always gets the same palette!
  const hash = str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const palettes = [
    [ '#000000', '#F4F4F5', '#3B82F6' ],
    [ '#111111', '#FAFAFA', '#EF4444' ],
    [ '#222222', '#F3F4F6', '#10B981' ],
    [ '#000000', '#FFFFFF', '#8B5CF6' ],
    [ '#111111', '#F8FAFC', '#F59E0B' ],
    [ '#0A0A0A', '#E5E7EB', '#EC4899' ],
    [ '#171717', '#FFFFFF', '#06B6D4' ]
  ];
  return palettes[hash % palettes.length];
}
