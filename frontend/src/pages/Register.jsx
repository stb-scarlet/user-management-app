import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Container, Card, Form, Button, Alert } from 'react-bootstrap'
import api from '../api/axios'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    if (!form.name || !form.email || !form.password) {
      return setError('Please fill in all fields.')
    }

    setLoading(true)
    try {
      const res = await api.post('/auth/register', form)
      // note: per spec, the user is registered "right away" and a
      // status message is shown — we do NOT auto-redirect to login,
      // since the confirmation e-mail is still being sent in the
      // background.
      setSuccessMsg(res.data.message)
      setForm({ name: '', email: '', password: '' })
    } catch (err) {
      // important: "This e-mail is already registered" comes straight
      // from the backend's ER_DUP_ENTRY handler, which itself comes
      // from the database's UNIQUE INDEX — not from a pre-check.
      setError(err.response?.data?.error || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <Card style={{ maxWidth: 420, width: '100%' }} className="shadow-sm">
        <Card.Body className="p-4">
          <h3 className="mb-1">Create account</h3>
          <p className="text-muted mb-4">Join the platform</p>

          {error && <Alert variant="danger">{error}</Alert>}
          {successMsg && <Alert variant="success">{successMsg}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Full name</Form.Label>
              <Form.Control
                name="name"
                type="text"
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
                autoFocus
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                name="password"
                type="password"
                placeholder="Any non-empty password"
                value={form.password}
                onChange={handleChange}
              />
            </Form.Group>

            <Button type="submit" variant="primary" className="w-100" disabled={loading}>
              {loading ? 'Creating account…' : 'Register'}
            </Button>
          </Form>

          <p className="text-center text-muted mt-3 mb-0">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </Card.Body>
      </Card>
    </Container>
  )
}