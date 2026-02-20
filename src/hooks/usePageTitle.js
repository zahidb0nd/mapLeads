import { useEffect } from 'react'

export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} — MapLeads` : 'MapLeads - Find Local Businesses Without Websites'
    return () => {
      document.title = 'MapLeads - Find Local Businesses Without Websites'
    }
  }, [title])
}
