export function formatNumber(num: number | undefined | null): string {
  // Handle undefined or null values
  if (num === undefined || num === null) {
    return "0"
  }

  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M"
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K"
  } else {
    return num.toString()
  }
}
