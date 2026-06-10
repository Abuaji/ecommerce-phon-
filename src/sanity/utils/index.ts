// General Sanity utility functions will go here
export function formatSanityDate(dateString: string) {
  return new Date(dateString).toLocaleDateString();
}
