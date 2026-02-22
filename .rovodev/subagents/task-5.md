---
name: task 5
description: it will work on task 5
tools: null
model: openai-responses-api:gpt-5.2-codex
load_memory: true
additional_memory_file: ''
skills: []
---
In MapLeads searchService.js, add a 
function getQualityScore(place):

let score = 0
if (name) score += 10
if (phone) score += 20
if (address_line1) score += 15
if (opening_hours) score += 10
if (categories?.length > 0) score += 5
if (lat && lon) score += 5
if (name.length < 3) score -= 20
if (!city) score -= 10

Return score.

After filtering in fetchAllBusinesses,
add qualityScore to each result:
  place.qualityScore = getQualityScore(place)

Then sort results by qualityScore descending.

No UI changes yet.