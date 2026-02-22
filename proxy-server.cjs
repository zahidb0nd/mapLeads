require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

const GEOAPIFY_API_KEY = process.env.VITE_GEOAPIFY_API_KEY;

// Proxy endpoint for Geoapify Places search
app.get('/api/geoapify/places', async (req, res) => {
  const { filter, limit, categories, name, lang } = req.query;

  const params = new URLSearchParams({
    filter: filter || '',
    limit: limit || '50',
    lang: lang || 'en',
    apiKey: GEOAPIFY_API_KEY,
  });

  if (categories) params.append('categories', categories);
  if (name) params.append('name', name);

  try {
    const response = await fetch(`https://api.geoapify.com/v2/places?${params}`, {
      headers: { 'Accept': 'application/json' }
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Proxy endpoint for Geoapify Place Details
app.get('/api/geoapify/place-details', async (req, res) => {
  const { id } = req.query;

  const params = new URLSearchParams({
    id,
    apiKey: GEOAPIFY_API_KEY,
  });

  try {
    const response = await fetch(`https://api.geoapify.com/v2/place-details?${params}`, {
      headers: { 'Accept': 'application/json' }
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Proxy endpoint for Geoapify Geocoding (City to Bounding Box)
app.get('/api/geoapify/geocode', async (req, res) => {
  const { text, type, limit } = req.query;

  const params = new URLSearchParams({
    text: text || '',
    type: type || 'city',
    limit: limit || '1',
    apiKey: GEOAPIFY_API_KEY,
  });

  try {
    const response = await fetch(`https://api.geoapify.com/v1/geocode/search?${params}`, {
      headers: { 'Accept': 'application/json' }
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Geocoding proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Proxy endpoint for Overpass API (OpenStreetMap business search)
app.post('/api/overpass', async (req, res) => {
  const { query } = req.body;

  const endpoints = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
    'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Trying Overpass endpoint: ${endpoint}`);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`,
      });

      const text = await response.text();

      // Make sure we got JSON not XML
      if (!text.trim().startsWith('{')) {
        console.warn(`${endpoint} returned non-JSON, trying next...`);
        continue;
      }

      const data = JSON.parse(text);
      console.log(`✅ Overpass success from ${endpoint}, elements: ${data.elements?.length}`);
      return res.json(data);
    } catch (error) {
      console.warn(`${endpoint} failed: ${error.message}`);
    }
  }

  res.status(500).json({ error: 'All Overpass endpoints failed. Please try again.' });
});

// Proxy for Nominatim geocoding
app.get('/api/geocode', async (req, res) => {
  const { q } = req.query;
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`,
      { headers: { 'Accept-Language': 'en', 'User-Agent': 'MapLeads/1.0' } }
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Geocode error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Proxy server running on http://localhost:${PORT}`);
});
