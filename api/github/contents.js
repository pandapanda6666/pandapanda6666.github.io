/**
 * Vercel Serverless Function: /api/github/contents
 * 用於讀取 GitHub 倉庫目錄結構，並與 GitHub 實時連動。
 * 支援 PAT 鑑權以突破每小時 60 次的匿名 API 速率限制。
 */

module.exports = async (req, res) => {
  // 設定 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, ngrok-skip-browser-warning');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { user = 'pandapanda6666', repo = 'pandapanda6666.github.io', path = '' } = req.query;

  const targetPath = String(path).replace(/^\/+/, '');
  const apiUrl = `https://api.github.com/repos/${encodeURIComponent(user)}/${encodeURIComponent(repo)}/contents/${targetPath ? encodeURIComponent(targetPath) : ''}`;

  const token = process.env.GITHUB_PAT || process.env.GITHUB_TOKEN;

  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'PandaPanda-Vercel-App'
  };

  if (token) {
    headers['Authorization'] = token.startsWith('github_pat_') ? `Bearer ${token}` : `token ${token}`;
  }

  try {
    const ghRes = await fetch(apiUrl, { headers });
    if (!ghRes.ok) {
      const errText = await ghRes.text();
      return res.status(ghRes.status).json({
        error: `GitHub API responded with status ${ghRes.status}`,
        details: errText
      });
    }

    const data = await ghRes.json();

    // 邊緣快取 10 分鐘 (s-maxage=600)，客戶端快取 1 分鐘
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=86400');
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      error: 'Failed to fetch GitHub contents',
      message: err.message
    });
  }
};
