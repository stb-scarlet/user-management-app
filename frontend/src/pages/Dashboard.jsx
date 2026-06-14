import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Container, Toast, ToastContainer } from 'react-bootstrap'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import Header from '../components/Header'
import Toolbar from '../components/Toolbar' 
import UsersTable from '../components/UsersTable'
import ConfirmModal from '../components/ConfirmModal'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [users, setUsers] = useState([])
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [sortKey, setSortKey] = useState('last_login')
  const [sortDir, setSortDir] = useState('desc')
  const [toast, setToast] = useState(null) // { message, variant }
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const showToast = (message, variant = 'success') => {
    setToast({ message, variant })
  }

  // ---------------------------------------------------------------
  // Fetch users.
  //
  // important: NOTE the 401/"blocked" case is NOT handled here
  // directly — it's caught globally by the axios response
  // interceptor (src/api/axios.js), which calls AuthContext's
  // onBlocked handler and redirects to /login. We only need to
  // handle the "happy path" here.
  // ---------------------------------------------------------------
  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get('/users')
      setUsers(res.data)
    } catch {
      // Errors (including "blocked") are handled by the interceptor.
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // ---------------------------------------------------------------
  // Filtering + sorting (client-side, on top of the backend's
  // default "last seen" ordering).
  // ---------------------------------------------------------------
  const visibleUsers = useMemo(() => {
    let list = users

    if (filter.trim()) {
      const f = filter.trim().toLowerCase()
      list = list.filter(
        (u) => u.name.toLowerCase().includes(f) || u.email.toLowerCase().includes(f)
      )
    }

    const sorted = [...list].sort((a, b) => {
      let av = a[sortKey]
      let bv = b[sortKey]

      // note: last_login can be null ("never logged in") — push those
      // to the end regardless of sort direction.
      if (sortKey === 'last_login') {
        if (av === null && bv === null) return 0
        if (av === null) return 1
        if (bv === null) return -1
        av = new Date(av).getTime()
        bv = new Date(bv).getTime()
      } else if (typeof av === 'string') {
        av = av.toLowerCase()
        bv = bv.toLowerCase()
      }

      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    return sorted
  }, [users, filter, sortKey, sortDir])

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  // ---------------------------------------------------------------
  // Selection helpers.
  // ---------------------------------------------------------------
  const allSelected = visibleUsers.length > 0 && visibleUsers.every((u) => selectedIds.has(u.id))

  const toggleAll = () => {
    const next = new Set(selectedIds)
    if (allSelected) {
      visibleUsers.forEach((u) => next.delete(u.id))
    } else {
      visibleUsers.forEach((u) => next.add(u.id))
    }
    setSelectedIds(next)
  }

  const toggleOne = (id) => {
    const next = new Set(selectedIds)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelectedIds(next)
  }

  const clearSelectionAndRefresh = async (selfWasAffected) => {
    setSelectedIds(new Set())
    if (selfWasAffected) {
      // important: an admin CAN block/delete themselves. When that
      // happens we don't need to wait for the next request to be
      // rejected — we can log out immediately for a clean UX. (The
      // requireActiveUser middleware would reject the next request
      // anyway, so this is consistent with the spec, just smoother.)
      logout()
      navigate('/login')
      return
    }
    await fetchUsers()
  }

  // ---------------------------------------------------------------
  // Toolbar actions.
  // ---------------------------------------------------------------
  const handleBlock = async () => {
    const ids = [...selectedIds]
    const selfIncluded = ids.includes(user.id)
    try {
      await api.patch('/users/status', { ids, status: 'blocked' })
      showToast('Selected user(s) blocked.')
      await clearSelectionAndRefresh(selfIncluded)
    } catch (err) {
      showToast(err.response?.data?.error || 'Action failed.', 'danger')
    }
  }

  const handleUnblock = async () => {
    const ids = [...selectedIds]
    try {
      await api.patch('/users/status', { ids, status: 'active' })
      showToast('Selected user(s) unblocked.')
      await clearSelectionAndRefresh(false)
    } catch (err) {
      showToast(err.response?.data?.error || 'Action failed.', 'danger')
    }
  }

  const handleDeleteConfirmed = async () => {
    const ids = [...selectedIds]
    const selfIncluded = ids.includes(user.id)
    setShowDeleteModal(false)
    try {
      await api.delete('/users', { data: { ids } })
      showToast('Selected user(s) deleted.')
      await clearSelectionAndRefresh(selfIncluded)
    } catch (err) {
      showToast(err.response?.data?.error || 'Action failed.', 'danger')
    }
  }

  const handleDeleteUnverified = async () => {
    try {
      const res = await api.delete('/users/unverified')
      showToast(res.data.message)
      await fetchUsers()
    } catch (err) {
      showToast(err.response?.data?.error || 'Action failed.', 'danger')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      <Header userName={user?.name} onLogout={handleLogout} />

      <Container fluid="lg" className="py-4">
        <h4 className="mb-3">Users</h4>

        <Toolbar
          selectedCount={selectedIds.size}
          onBlock={handleBlock}
          onUnblock={handleUnblock}
          onDelete={() => setShowDeleteModal(true)}
          onDeleteUnverified={handleDeleteUnverified}
          filter={filter}
          onFilterChange={setFilter}
        />

        {loading ? (
          <div className="text-center text-muted py-5">Loading users…</div>
        ) : (
          <UsersTable
            users={visibleUsers}
            selectedIds={selectedIds}
            onToggleOne={toggleOne}
            onToggleAll={toggleAll}
            allSelected={allSelected}
            currentUserId={user?.id}
            sortKey={sortKey}
            sortDir={sortDir}
            onSort={handleSort}
          />
        )}

        <p className="text-muted small mt-2">
          {visibleUsers.length} user{visibleUsers.length !== 1 ? 's' : ''}
          {selectedIds.size > 0 && ` · ${selectedIds.size} selected`}
        </p>
      </Container>

      <ConfirmModal
        show={showDeleteModal}
        title="Delete users"
        body={`Are you sure you want to delete ${selectedIds.size} user(s)? This cannot be undone.`}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setShowDeleteModal(false)}
      />

      {/* note: status messages — animation={false} per "no animations" */}
      <ToastContainer position="bottom-center" className="p-3">
        <Toast
          show={!!toast}
          onClose={() => setToast(null)}
          delay={3000}
          autohide
          animation={false}
          bg={toast?.variant === 'danger' ? 'danger' : 'success'}
        >
          <Toast.Body className="text-white">{toast?.message}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  )
}