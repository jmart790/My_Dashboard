import { searchNews } from '../../server/news.js';
import { toNetlify } from '../../server/http.js';

// GET /api/news?q=Portland -> { articles }. The CDN keeps each place's answer 15 minutes,
// so many visitors to the same town cost one GNews call.
export default toNetlify((params) => searchNews(params.get('q')), { cdnSeconds: 15 * 60 });

export const config = { path: '/api/news' };
