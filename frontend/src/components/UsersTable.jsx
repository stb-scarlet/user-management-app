import { Table, Form, Badge } from 'react-bootstrap'
import StatusBadge from './StatusBadge'
import { formatRelativeTime } from '../utils/formatRelativeTime'

// =====================================================================
// UsersTable
//
// note: leftmost column header has ONLY a checkbox (no label) which
// selects/deselects every row — exactly as specified. There are NO
// buttons inside data rows; all actions live in the Toolbar.
//
// important: clicking a column header toggles the sort — "Last seen"
// is the default (already sorted that way by the backend query, but
// we still sort client-side so the other columns are sortable too).
// =====================================================================

const COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'status', label: 'Status' },
  { key: 'last_login', label: 'Last seen' },
]

export default function UsersTable({
  users,
  selectedIds,
  onToggleOne,
  onToggleAll,
  allSelected,
  currentUserId,
  sortKey,
  sortDir,
  onSort,
}) {
  const renderSortIndicator = (key) => {
    if (sortKey !== key) return null
    return sortDir === 'asc' ? ' \u2191' : ' \u2193';
  }

  return (
    <Table hover responsive className="align-middle bg-white">
      <thead>
        <tr>
          <th style={{ width: 40 }}>
            <Form.Check
              type="checkbox"
              checked={allSelected}
              onChange={onToggleAll}
              // note: no label — the header checkbox selects/deselects all.
              aria-label="Select all users"
            />
          </th>
          {COLUMNS.map((col) => (
            <th key={col.key} className="sortable" onClick={() => onSort(col.key)}>
              {col.label}{renderSortIndicator(col.key)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {users.length === 0 && (
          <tr>
            <td colSpan={COLUMNS.length + 1} className="text-center text-muted py-5">
              No users found.
            </td>
          </tr>
        )}
        {users.map((u) => (
          <tr key={u.id}>
            <td>
              <Form.Check
                type="checkbox"
                checked={selectedIds.has(u.id)}
                onChange={() => onToggleOne(u.id)}
                aria-label={`Select ${u.name}`}
              />
            </td>
            <td>
              {u.name}
              {u.id === currentUserId && (
                <Badge bg="info" className="ms-2 current-user-badge">you</Badge>
              )}
            </td>
            <td className="text-muted">{u.email}</td>
            <td><StatusBadge status={u.status} /></td>
            <td className="text-muted">{formatRelativeTime(u.last_login)}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}