/**
 * City Geocoding Test Script
 * 
 * This script tests the city geocoding implementation without requiring
 * the full React app to be running. It directly calls the Geoapify API
 * to verify the geocoding functionality.
 * 
 * Usage:
 * 1. Ensure .env file has VITE_GEOAPIFY_API_KEY set
 * 2. Run: node test-city-geocoding.js
 */

import 'dotenv/config'

const GEOAPIFY_API_KEY = process.env.VITE_GEOAPIFY_API_KEY

if (!GEOAPIFY_API_KEY) {
  console.error('❌ Error: VITE_GEOAPIFY_API_KEY not found in environment variables')
  console.error('Please add it to your .env file')
  process.exit(1)
}

// Test cases for city geocoding
const testCases = [
  { city: 'Austin, USA', shouldPass: true },
  { city: 'Mumbai, India', shouldPass: true },
  { city: 'London, UK', shouldPass: true },
  { city: 'Tokyo, Japan', shouldPass: true },
  { city: 'Paris, France', shouldPass: true },
  { city: 'Austin', shouldPass: true, note: 'Without country - may be ambiguous' },
  { city: 'Nonexistent City', shouldPass: false, note: 'Should fail gracefully' },
  { city: '', shouldPass: false, note: 'Empty input' }
]

/**
 * Geocode a city to get its bounding box
 */
async function geocodeCityToBbox(cityName) {
  try {
    const url = new URL('https://api.geoapify.com/v1/geocode/search')
    url.searchParams.append('text', cityName)
    url.searchParams.append('type', 'city')
    url.searchParams.append('limit', '1')
    url.searchParams.append('apiKey', GEOAPIFY_API_KEY)

    const response = await fetch(url.toString())

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()

    if (!data.features || data.features.length === 0) {
      throw new Error(`We couldn't find "${cityName}". Try adding the country e.g. 'Austin, USA' or 'Mumbai, India'`)
    }

    const feature = data.features[0]
    const bbox = feature.bbox

    if (!bbox || bbox.length !== 4) {
      throw new Error('Invalid bounding box received from geocoding service')
    }

    return {
      bbox,
      name: feature.properties.city || feature.properties.name,
      country: feature.properties.country,
      state: feature.properties.state,
      formatted: feature.properties.formatted,
      raw: feature
    }
  } catch (error) {
    throw error
  }
}

/**
 * Format bbox for display
 */
function formatBbox(bbox) {
  const [lonMin, latMin, lonMax, latMax] = bbox
  return `[${lonMin.toFixed(4)}, ${latMin.toFixed(4)}, ${lonMax.toFixed(4)}, ${latMax.toFixed(4)}]`
}

/**
 * Run all test cases
 */
async function runTests() {
  console.log('🧪 Starting City Geocoding Tests\n')
  console.log('='.repeat(80))
  
  let passed = 0
  let failed = 0

  for (const testCase of testCases) {
    const { city, shouldPass, note } = testCase
    
    console.log(`\n📍 Testing: "${city}"`)
    if (note) {
      console.log(`   Note: ${note}`)
    }

    try {
      const result = await geocodeCityToBbox(city)
      
      if (shouldPass) {
        console.log('   ✅ PASS')
        console.log(`   City: ${result.name}`)
        console.log(`   Country: ${result.country}`)
        if (result.state) console.log(`   State: ${result.state}`)
        console.log(`   Formatted: ${result.formatted}`)
        console.log(`   BBox: ${formatBbox(result.bbox)}`)
        
        // Calculate bbox dimensions
        const [lonMin, latMin, lonMax, latMax] = result.bbox
        const widthKm = ((lonMax - lonMin) * 111.32 * Math.cos(latMin * Math.PI / 180)).toFixed(2)
        const heightKm = ((latMax - latMin) * 111.32).toFixed(2)
        console.log(`   Dimensions: ~${widthKm} km (W) × ~${heightKm} km (H)`)
        
        passed++
      } else {
        console.log('   ❌ FAIL - Expected to fail but got result')
        console.log(`   Unexpected result: ${result.formatted}`)
        failed++
      }
    } catch (error) {
      if (!shouldPass) {
        console.log('   ✅ PASS - Failed as expected')
        console.log(`   Error: ${error.message}`)
        passed++
      } else {
        console.log('   ❌ FAIL')
        console.log(`   Error: ${error.message}`)
        failed++
      }
    }

    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200))
  }

  console.log('\n' + '='.repeat(80))
  console.log('\n📊 Test Results:')
  console.log(`   ✅ Passed: ${passed}/${testCases.length}`)
  console.log(`   ❌ Failed: ${failed}/${testCases.length}`)
  console.log(`   Success Rate: ${((passed / testCases.length) * 100).toFixed(1)}%`)
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed!')
  } else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.')
  }
}

// Run tests
runTests().catch(error => {
  console.error('❌ Test execution failed:', error)
  process.exit(1)
})
