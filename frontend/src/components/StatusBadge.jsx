import { Badge } from 'react-bootstrap'

// note: maps the three possible user statuses to Bootstrap badge
// variants and display labels.
const STATUS_CONFIG = {
  active: { variant: 'success', label: 'Active' },
  blocked: { variant: 'danger', label: 'Blocked' },
  unverified: { variant: 'secondary', label: 'Unverified' },
}

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.unverified
  return <Badge bg={config.variant}>{config.label}</Badge>
}
