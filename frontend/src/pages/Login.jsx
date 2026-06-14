import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Container, Card, Form, Button, Alert } from 'react-bootstrap'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // note: AuthContext redirects here with state.blocked === true when
  // the user's NEXT request after being blocked/deleted gets rejected.
  const wasBlocked = location.state?.blocked

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.email || !form.password) {
      return setError('Please fill in all fields.')
    }

    setLoading(true)
    try {
      const res = await api.post('/auth/login', form)
      login(res.data.user, res.data.token)
      navigate('/dashboard')
    } catch (err) {
      // important: "Your account has been blocked" is the only
      // status that prevents login — unverified users CAN sign in.
      setError(err.response?.data?.error || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <Card style={{ maxWidth: 420, width: '100%' }} className="shadow-sm">
        <Card.Body className="p-4">
          <h3 className="mb-1">Welcome back</h3>
          <p className="text-muted mb-4">Sign in to your account</p>

          {wasBlocked && (
            <Alert variant="warning">
              Your session has ended because your account was blocked (or removed).
            </Alert>
          )}
          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoFocus
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                name="password"
                type="password"
                placeholder="Your password"
                value={form.password}
                onChange={handleChange}
              />
            </Form.Group>

            <Button type="submit" variant="primary" className="w-100" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </Form>

          <p className="text-center text-muted mt-3 mb-0">
            No account yet? <Link to="/register">Register</Link>
          </p>
        </Card.Body>
      </Card>
    </Container>
  )
}