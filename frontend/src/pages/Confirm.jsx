import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Container, Card, Alert, Spinner } from 'react-bootstrap'
import api from '../api/axios'

// =====================================================================
// Confirm page
//
// note: this is where the link in the confirmation e-mail points
// (CLIENT_URL + /confirm/:token, built in backend/utils/mailer.js).
// On mount, it calls the public GET /api/auth/confirm/:token endpoint,
// which flips "unverified" -> "active" (or leaves "blocked" alone).
// =====================================================================

export default function Confirm() {
  const { token } = useParams()
  const [status, setStatus] = useState('loading') // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('')

  useEffect(() => {
    let cancelled = false

    api.get(`/auth/confirm/${token}`)
      .then((res) => {
        if (cancelled) return
        setStatus('success')
        setMessage(res.data.message)
      })
      .catch((err) => {
        if (cancelled) return
        setStatus('error')
        setMessage(err.response?.data?.error || 'Something went wrong.')
      })

    return () => { cancelled = true }
  }, [token])

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <Card style={{ maxWidth: 420, width: '100%' }} className="shadow-sm">
        <Card.Body className="p-4 text-center">
          <h3 className="mb-3">Account confirmation</h3>

          {status === 'loading' && (
            <div className="d-flex flex-column align-items-center gap-3">
              <Spinner animation="border" />
              <span className="text-muted">Confirming your account…</span>
            </div>
          )}

          {status === 'success' && <Alert variant="success">{message}</Alert>}
          {status === 'error' && <Alert variant="danger">{message}</Alert>}

          {status !== 'loading' && (
            <Link to="/login">Go to login</Link>
          )}
        </Card.Body>
      </Card>
    </Container>
  )
}