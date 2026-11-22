import { ogImageResult } from '../../server/ogImage.js';
import { toNetlify } from '../../server/http.js';

// GET /api/og-image?url=... -> { image }: a restaurant website's share photo.
export default toNetlify((params) => ogImageResult(params.get('url')), { cdnSeconds: 24 * 60 * 60 });

export const config = { path: '/api/og-image' };
