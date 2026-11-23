import { useEffect } from 'react'
const BASE = 'Singing Cloud Studio'
export function useMeta(title, description) {
  useEffect(() => {
    document.title = title ? `${title} · ${BASE}` : `${BASE} · AI visuals, websites & content`
    if (description) document.querySelector('meta[name="description"]')?.setAttribute('content', description)
  }, [title, description])
}
