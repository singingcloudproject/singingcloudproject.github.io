import { useEffect } from 'react'
const BASE = 'Singing Cloud Project'
export function useMeta(title, description) {
  useEffect(() => {
    document.title = title ? `${title} · ${BASE}` : `${BASE} · Websites, AI assistants & product ads`
    if (description) document.querySelector('meta[name="description"]')?.setAttribute('content', description)
  }, [title, description])
}
