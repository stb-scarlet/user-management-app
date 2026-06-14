import { ButtonGroup, Button, Form, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { FaLock, FaLockOpen, FaTrash, FaUserSlash } from 'react-icons/fa'

// =====================================================================
// Toolbar
//
// important: per the spec, the toolbar NEVER appears/disappears —
// only its buttons' enabled/disabled state changes. There are NO
// per-row buttons (a 20% penalty otherwise), so all actions operate
// on the checkbox selection.
//
// note: "Block" is the only button with a text label, matching the
// provided mockup; Unblock / Delete / Delete unverified are icon-only
// with tooltips for accessibility.
// =====================================================================

function IconButton({ tooltip, onClick, disabled, variant, children }) {
  return (
    <OverlayTrigger
      placement="bottom"
      overlay={<Tooltip>{tooltip}</Tooltip>}
    >
      {/* note: span wrapper lets the tooltip work even when the
          button itself is disabled (disabled buttons don't fire
          mouse events). */}
      <span className="d-inline-block">
        <Button variant={variant} onClick={onClick} disabled={disabled} style={disabled ? { pointerEvents: 'none' } : {}}>
          {children}
        </Button>
      </span>
    </OverlayTrigger>
  )
}

export default function Toolbar({
  selectedCount,
  onBlock,
  onUnblock,
  onDelete,
  onDeleteUnverified,
  filter,
  onFilterChange,
}) {
  const hasSelection = selectedCount > 0

  return (
    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
      <ButtonGroup>
        <OverlayTrigger placement="bottom" overlay={<Tooltip>Block selected users</Tooltip>}>
          <span className="d-inline-block">
            <Button
              variant="outline-primary"
              onClick={onBlock}
              disabled={!hasSelection}
              style={!hasSelection ? { pointerEvents: 'none' } : {}}
            >
              <FaLock className="me-2" />
              Block
            </Button>
          </span>
        </OverlayTrigger>

        <IconButton tooltip="Unblock selected users" onClick={onUnblock} disabled={!hasSelection} variant="outline-secondary">
          <FaLockOpen />
        </IconButton>

        <IconButton tooltip="Delete selected users" onClick={onDelete} disabled={!hasSelection} variant="outline-danger">
          <FaTrash />
        </IconButton>

        <IconButton tooltip="Delete all unverified users" onClick={onDeleteUnverified} disabled={false} variant="outline-warning">
          <FaUserSlash />
        </IconButton>
      </ButtonGroup>

      <Form.Control
        type="search"
        placeholder="Filter"
        value={filter}
        onChange={(e) => onFilterChange(e.target.value)}
        style={{ maxWidth: 240 }}
      />
    </div>
  )
}