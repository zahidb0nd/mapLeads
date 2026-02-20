// Vercel Serverless Function — proxies Geoapify Places API and Place Details API
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const apiKey = process.env.VITE_GEOAPIFY_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'Geoapify API key not configured' })

  const params = new URLSearchParams(req.query)
  params.set('apiKey', apiKey)

  // Determine which Geoapify endpoint to call.
  // Vercel rewrites strip the original path, so we use a query param
  // to distinguish: geoapify.js appends ?_endpoint=place-details for details.
  // Falls back to checking req.url for local dev compatibility.
  const isPlaceDetails = req.query._endpoint === 'place-details' || (req.url || '').includes('place-details')
  params.delete('_endpoint')
  const geoapifyEndpoint = isPlaceDetails
    ? 'https://api.geoapify.com/v2/place-details'
    : 'https://api.geoapify.com/v2/places'

  try {
    const response = await fetch(`${geoapifyEndpoint}?${params.toString()}`, {
      headers: { 'Accept': 'application/json' }
    })
    const data = await response.json()
    res.status(response.status).json(data)
  } catch (error) {
    console.error('Geoapify proxy error:', error)
    res.status(500).json({ error: error.message })
  }
}
