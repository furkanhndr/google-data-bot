// Builds the Google Maps search term from query + optional category + location,
// avoiding duplicate words (e.g. the query already contains the category).
export function buildSearchTerm(
  query: string,
  category: string | null | undefined,
  location: string,
): string {
  const parts = [query]
  if (category && !query.toLowerCase().includes(category.toLowerCase())) parts.push(category)
  parts.push(location)
  return parts.join(' ').trim()
}
