import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [users, setUsers] = useState([])
  const [selected, setSelected] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // If current user gets blocked → auto logout + redirect
  const handleAuthError = useCallback((err) => {
    if (err.response?.status === 403 || err.response?.data?.error === 'blocked') {
      logout()
      navigate('/login')
    }
  }, [logout, navigate])

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get('/users')
      setUsers(res.data)
    } catch (err) {
      handleAuthError(err)
    } finally {
      setLoading(false)
    }
  }, [handleAuthError])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Checkbox logic
  const allSelected = users.length > 0 && selected.size === users.length
  const someSelected = selected.size > 0

  const toggleAll = () => {
    if (allSelected) setSelected(new Set())
    else setSelected(new Set(users.map(u => u.id)))
  }

  const toggleOne = (id) => {
    const next = new Set(selected)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelected(next)
  }

  // Block selected users
  const handleBlock = async () => {
    if (!someSelected) return
    setActionLoading(true)
    try {
      await api.patch('/users/status', { ids: [...selected], status: 'blocked' })
      showToast('Users blocked successfully.')
      setSelected(new Set())
      await fetchUsers()
      // Check if current user blocked themselves → redirect
      if (selected.has(user.id)) {
        logout()
        navigate('/login')
      }
    } catch (err) {
      handleAuthError(err)
      showToast('Action failed.', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  // Unblock selected users
  const handleUnblock = async () => {
    if (!someSelected) return
    setActionLoading(true)
    try {
      await api.patch('/users/status', { ids: [...selected], status: 'active' })
      showToast('Users unblocked successfully.')
      setSelected(new Set())
      await fetchUsers()
    } catch (err) {
      handleAuthError(err)
      showToast('Action failed.', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  // Delete selected users
  const handleDelete = async () => {
    if (!someSelected) return
    if (!confirm(`Delete ${selected.size} user(s)? This cannot be undone.`)) return
    setActionLoading(true)
    try {
      await api.delete('/users', { data: { ids: [...selected] } })
      showToast('Users deleted.')
      setSelected(new Set())
      // If current user deleted themselves
      if (selected.has(user.id)) {
        logout()
        navigate('/login')
      } else {
        await fetchUsers()
      }
    } catch (err) {
      handleAuthError(err)
      showToast('Action failed.', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.logo}>⬡</span>
          <span className={styles.appName}>UserBoard</span>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.currentUser}>
            👤 {user?.name}
          </span>
          <button className={styles.btnLogout} onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </header>

      {/* Main */}
      <main className={styles.main}>
        <div className={styles.toolbar}>
          <h1 className={styles.pageTitle}>Users</h1>
          <div className={styles.actions}>
            <button
              className={styles.btnBlock}
              onClick={handleBlock}
              disabled={!someSelected || actionLoading}
              title="Block selected"
            >
              🔒 Block
            </button>
            <button
              className={styles.btnUnblock}
              onClick={handleUnblock}
              disabled={!someSelected || actionLoading}
              title="Unblock selected"
            >
              🔓 Unblock
            </button>
            <button
              className={styles.btnDelete}
              onClick={handleDelete}
              disabled={!someSelected || actionLoading}
              title="Delete selected"
            >
              🗑
            </button>
          </div>
        </div>

        {loading ? (
          <div className={styles.loading}>Loading users…</div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      className={styles.checkbox}
                    />
                  </th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Last login</th>
                  <th>Registered</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className={styles.empty}>No users found.</td>
                  </tr>
                )}
                {users.map(u => (
                  <tr
                    key={u.id}
                    className={`
                      ${selected.has(u.id) ? styles.rowSelected : ''}
                      ${u.id === user?.id ? styles.rowSelf : ''}
                    `}
                  >
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.has(u.id)}
                        onChange={() => toggleOne(u.id)}
                        className={styles.checkbox}
                      />
                    </td>
                    <td>
                      {u.name}
                      {u.id === user?.id && (
                        <span className={styles.youBadge}>you</span>
                      )}
                    </td>
                    <td className={styles.email}>{u.email}</td>
                    <td>
                      <span className={
                        u.status === 'active' ? styles.statusActive : styles.statusBlocked
                      }>
                        {u.status === 'active' ? '● Active' : '● Blocked'}
                      </span>
                    </td>
                    <td className={styles.muted}>{formatDate(u.last_login)}</td>
                    <td className={styles.muted}>{formatDate(u.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className={styles.count}>
          {users.length} user{users.length !== 1 ? 's' : ''} total
          {someSelected && ` · ${selected.size} selected`}
        </p>
      </main>

      {/* Toast notification */}
      {toast && (
        <div className={`${styles.toast} ${toast.type === 'error' ? styles.toastError : ''}`}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}
