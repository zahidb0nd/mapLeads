// Vercel Serverless Function — proxies Nominatim geocoding
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { q, limit = '1' } = req.query
  if (!q) return res.status(400).json({ error: 'Missing query parameter: q' })

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=${limit}&addressdetails=1`,
      { headers: { 'Accept-Language': 'en', 'User-Agent': 'MapLeads/1.0' } }
    )
    const data = await response.json()
    res.status(200).json(data)
  } catch (error) {
    console.error('Geocode proxy error:', error)
    res.status(500).json({ error: error.message })
  }
}
