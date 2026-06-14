// =====================================================================
// formatRelativeTime
//
// note: turns a timestamp into a human-readable "X minutes ago"
// style string for the "Last seen" column, matching the mockup.
// =====================================================================

export function formatRelativeTime(dateStr) {
  if (!dateStr) return 'Never'

  const date = new Date(dateStr)
  const diffMs = Date.now() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)

  if (diffSec < 60) return 'less than a minute ago'

  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`

  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour} hour${diffHour === 1 ? '' : 's'} ago`

  const diffDay = Math.floor(diffHour / 24)
  if (diffDay < 7) return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`

  const diffWeek = Math.floor(diffDay / 7)
  if (diffWeek < 5) return `${diffWeek} week${diffWeek === 1 ? '' : 's'} ago`

  // note: for anything older than ~a month, fall back to an absolute
  // date so the table stays meaningful for long-idle accounts.
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}