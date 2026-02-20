// Vercel Serverless Function — proxies Geoapify Places API
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const apiKey = process.env.VITE_GEOAPIFY_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'Geoapify API key not configured' })

  const params = new URLSearchParams(req.query)
  params.set('apiKey', apiKey)

  try {
    const response = await fetch(`https://api.geoapify.com/v2/places?${params.toString()}`, {
      headers: { 'Accept': 'application/json' }
    })
    const data = await response.json()
    res.status(response.status).json(data)
  } catch (error) {
    console.error('Geoapify proxy error:', error)
    res.status(500).json({ error: error.message })
  }
}
