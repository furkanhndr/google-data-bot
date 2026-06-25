'use client'

import { useEffect, useState } from 'react'

// Returns whether the given media query currently matches. SSR-safe: starts
// false and updates after mount, so it never mismatches the server render.
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}
