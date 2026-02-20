import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDistance(meters) {
  if (meters < 1000) {
    return `${Math.round(meters)}m`
  }
  return `${(meters / 1000).toFixed(1)}km`
}

export function formatAddress(location) {
  if (!location) return 'N/A'
  
  const parts = [
    location.address,
    location.locality,
    location.region,
    location.postcode,
    location.country
  ].filter(Boolean)
  
  return parts.join(', ')
}

export function exportToCSV(data, filename = 'export.csv') {
  if (!data || data.length === 0) {
    console.error('No data to export')
    return
  }

  // Get headers from first object
  const headers = Object.keys(data[0])
  
  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        // Handle values with commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value ?? ''
      }).join(',')
    )
  ].join('\n')

  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export function exportToXLSX(data, filename = 'export.xlsx') {
  if (!data || data.length === 0) return

  const headers = Object.keys(data[0])

  // Build a simple XML-based Excel file (SpreadsheetML)
  const xmlRows = [
    `<Row>${headers.map(h => `<Cell><Data ss:Type="String">${h}</Data></Cell>`).join('')}</Row>`,
    ...data.map(row =>
      `<Row>${headers.map(h => {
        const val = row[h] ?? ''
        const type = typeof val === 'number' ? 'Number' : 'String'
        const escaped = String(val).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        return `<Cell><Data ss:Type="${type}">${escaped}</Data></Cell>`
      }).join('')}</Row>`
    )
  ].join('')

  const xml = `<?xml version="1.0"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Worksheet ss:Name="MapLeads">
    <Table>${xmlRows}</Table>
  </Worksheet>
</Workbook>`

  const blob = new Blob([xml], { type: 'application/vnd.ms-excel' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function generateEmailTemplate(business) {
  const name = business.name || 'your business'
  const category = business.categories?.[0]?.name || 'business'
  return `Subject: Help ${name} Get Found Online

Hi there,

I noticed that ${name} doesn't currently have a website, and I'd love to help change that!

In today's digital world, having an online presence is crucial for any ${category}. A professional website can help you:
• Attract new customers searching online
• Showcase your products/services 24/7
• Build credibility and trust
• Compete with larger businesses

I specialize in creating affordable, professional websites for local businesses like yours.

Would you be open to a quick 10-minute chat about how a website could help ${name} grow?

Looking forward to hearing from you!

Best regards,
[Your Name]
[Your Phone]
[Your Email]`
}
