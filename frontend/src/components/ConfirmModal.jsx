import { Modal, Button } from 'react-bootstrap'

// note: the spec forbids browser-native alert()/confirm(). This is a
// regular Bootstrap modal used for the "Delete" confirmation instead.
// animation={false} -> no animations, per spec.
export default function ConfirmModal({ show, title, body, onConfirm, onCancel }) {
  return (
    <Modal show={show} onHide={onCancel} centered animation={false}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{body}</Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onCancel}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm}>Delete</Button>
      </Modal.Footer>
    </Modal>
  )
}