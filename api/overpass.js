// Vercel Serverless Function — proxies Overpass API (OpenStreetMap)
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { query } = req.body || {}
  if (!query) return res.status(400).json({ error: 'Missing query in request body' })

  const endpoints = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
    'https://maps.mail.ru/osm/tools/overpass/api/interpreter'
  ]

  const body = `data=${encodeURIComponent(query)}`

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
        signal: AbortSignal.timeout(20000)
      })
      const text = await response.text()
      if (!text.startsWith('{')) continue
      return res.status(200).json(JSON.parse(text))
    } catch (err) {
      continue
    }
  }

  res.status(503).json({ error: 'All Overpass endpoints failed. Try again later.' })
}
