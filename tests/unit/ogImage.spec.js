// @vitest-environment node
import { extractOgImage, isPrivateAddress, isLikelyLogo, findOgImage } from '../../server/ogImage.js';

describe('extractOgImage', () => {
  const page = 'https://example.com/menu/';

  it('reads og:image in either attribute order', () => {
    expect(extractOgImage('<meta property="og:image" content="https://cdn.x/a.jpg">', page)).toBe('https://cdn.x/a.jpg');
    expect(extractOgImage('<meta content="https://cdn.x/b.jpg" property="og:image" />', page)).toBe('https://cdn.x/b.jpg');
  });

  it('falls back to twitter:image', () => {
    expect(extractOgImage('<meta name="twitter:image" content="https://cdn.x/t.jpg">', page)).toBe('https://cdn.x/t.jpg');
  });

  it('resolves relative URLs against the page and upgrades http to https', () => {
    expect(extractOgImage('<meta property="og:image" content="/img/hero.jpg">', page)).toBe('https://example.com/img/hero.jpg');
    expect(extractOgImage('<meta property="og:image" content="http://static.x/hero.jpg">', page)).toBe('https://static.x/hero.jpg');
  });

  it('decodes HTML entities in the URL', () => {
    expect(extractOgImage('<meta property="og:image" content="https://cdn.x/a.jpg?w=1&amp;h=2">', page)).toBe('https://cdn.x/a.jpg?w=1&h=2');
  });

  it('skips logos, badges, icons and screenshots', () => {
    for (const url of [
      'https://cdn.x/Logo_Inverted.png',
      'https://www.opentable.com/badge/ot/DC-2026.png',
      'https://x.com/wp-content/themes/cocoon/screenshot.jpg',
      'https://cdn.x/favicon.ico',
      'https://cdn.x/brand.svg',
      'https://a.singleplatform.com/sp/enriquetas-cafe/fb_post_image.png', // generic 'View menu' banner
    ]) {
      expect(extractOgImage(`<meta property="og:image" content="${url}">`, page)).toBeNull();
    }
  });

  it('returns null when there is no image', () => {
    expect(extractOgImage('<html><head><title>x</title></head></html>', page)).toBeNull();
  });
});

describe('isLikelyLogo', () => {
  it('does not flag ordinary food photos', () => {
    expect(isLikelyLogo('https://eatflyfuel.com/wp-content/uploads/2024/11/IMG_0715.jpg')).toBe(false);
  });
});

describe('isPrivateAddress', () => {
  it('flags loopback, private, link-local and mapped addresses', () => {
    for (const ip of ['127.0.0.1', '10.1.2.3', '172.16.0.1', '172.31.255.255', '192.168.1.1', '169.254.169.254', '0.0.0.0', '100.64.0.1', '::1', 'fd00::1', 'fe80::1', '::ffff:10.0.0.1', '::ffff:127.0.0.1']) {
      expect(isPrivateAddress(ip), ip).toBe(true);
    }
  });

  it('allows public addresses', () => {
    for (const ip of ['93.184.216.34', '172.32.0.1', '8.8.8.8', '2606:4700::6810:85e5']) {
      expect(isPrivateAddress(ip), ip).toBe(false);
    }
  });
});

describe('findOgImage', () => {
  const publicDns = async () => [{ address: '93.184.216.34', family: 4 }];
  const html = (body, headers = {}) =>
    new Response(body, { status: 200, headers: { 'content-type': 'text/html', ...headers } });

  it('fetches the page and returns its image', async () => {
    const fetchImpl = vi.fn(async () => html('<meta property="og:image" content="https://cdn.x/hero.jpg">'));
    expect(await findOgImage('https://r.example/', { fetchImpl, lookup: publicDns })).toBe('https://cdn.x/hero.jpg');
  });

  it('refuses non-http(s) URLs and odd ports without fetching', async () => {
    const fetchImpl = vi.fn();
    for (const url of ['file:///etc/passwd', 'ftp://x.com/', 'https://x.com:8443/', 'not a url']) {
      expect(await findOgImage(url, { fetchImpl, lookup: publicDns })).toBeNull();
    }
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('refuses hosts that resolve to private addresses', async () => {
    const fetchImpl = vi.fn();
    const lookup = async () => [{ address: '10.0.0.5', family: 4 }];
    expect(await findOgImage('https://intranet.example/', { fetchImpl, lookup })).toBeNull();
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('re-checks every redirect hop', async () => {
    const lookup = async (host) => [{ address: host === 'evil.example' ? '127.0.0.1' : '93.184.216.34', family: 4 }];
    const fetchImpl = vi.fn(async () => new Response(null, { status: 302, headers: { location: 'https://evil.example/' } }));
    expect(await findOgImage('https://r.example/', { fetchImpl, lookup })).toBeNull();
    expect(fetchImpl).toHaveBeenCalledTimes(1); // the private hop is never requested
  });

  it('follows a public redirect and resolves relative images against the final page', async () => {
    const fetchImpl = vi.fn(async (url) =>
      url === 'https://r.example/'
        ? new Response(null, { status: 301, headers: { location: 'https://www.r.example/home' } })
        : html('<meta property="og:image" content="/hero.jpg">')
    );
    expect(await findOgImage('https://r.example/', { fetchImpl, lookup: publicDns })).toBe('https://www.r.example/hero.jpg');
  });

  it('returns null for non-HTML responses and fetch errors', async () => {
    const pdf = vi.fn(async () => new Response('%PDF', { status: 200, headers: { 'content-type': 'application/pdf' } }));
    expect(await findOgImage('https://r.example/', { fetchImpl: pdf, lookup: publicDns })).toBeNull();
    const boom = vi.fn(async () => {
      throw new Error('ECONNRESET');
    });
    expect(await findOgImage('https://r.example/', { fetchImpl: boom, lookup: publicDns })).toBeNull();
  });
});
