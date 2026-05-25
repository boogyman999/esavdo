const https = require('https');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { page = 1, category = '', region = '' } = req.query;

  const params = new URLSearchParams({
    page,
    per_page: 20,
    ...(category && { category }),
    ...(region && { region }),
  });

  const options = {
    hostname: 'e-auksion.uz',
    path: `/api/lots?${params}`,
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8',
      'Referer': 'https://e-auksion.uz/',
      'Origin': 'https://e-auksion.uz',
    }
  };

  try {
    const data = await new Promise((resolve, reject) => {
      const request = https.request(options, (response) => {
        let body = '';
        response.on('data', chunk => body += chunk);
        response.on('end', () => {
          try { resolve({ status: response.statusCode, body: JSON.parse(body) }); }
          catch { resolve({ status: response.statusCode, body }); }
        });
      });
      request.on('error', reject);
      request.setTimeout(10000, () => { request.destroy(); reject(new Error('Timeout')); });
      request.end();
    });

    res.status(data.status).json(data.body);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
