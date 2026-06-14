import { Navbar, Container, Button } from 'react-bootstrap'
import { FaUserCircle } from 'react-icons/fa'

// note: standard navigation header showing the app name, current
// user's name, and a logout button — required by the spec.
export default function Header({ userName, onLogout }) {
  return (
    <Navbar bg="white" className="border-bottom shadow-sm" expand="md">
      <Container fluid="lg">
        <Navbar.Brand className="fw-bold">User Management</Navbar.Brand>
        <div className="d-flex align-items-center gap-3 ms-auto">
          <span className="text-muted d-flex align-items-center gap-2">
            <FaUserCircle /> {userName}
          </span>
          <Button variant="outline-secondary" size="sm" onClick={onLogout}>
            Sign out
          </Button>
        </div>
      </Container>
    </Navbar>
  )
}