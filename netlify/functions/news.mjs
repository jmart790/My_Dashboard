import { searchNews } from '../../server/news.js';
import { toNetlify } from '../../server/http.js';

// GET /api/news?q=Portland -> { articles }. Netlify's CDN keeps each place's answer 15
// minutes, shared by every visitor (the function also remembers it in memory), and a
// "quota used up" answer 10 minutes, so nobody keeps asking GNews while it can't answer.
export default toNetlify((params) => searchNews(params.get('q')), { cdnSeconds: 15 * 60, refusedCdnSeconds: 10 * 60 });

export const config = { path: '/api/news' };
