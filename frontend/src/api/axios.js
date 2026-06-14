// =====================================================================
// Shared axios instance.
//
// important: this is the ONE place that reacts to the backend's
// {error: 'blocked'} response (sent by requireActiveUser for any
// user that no longer exists or has been blocked). When that happens,
// we call a callback registered by AuthContext, which logs the user
// out and redirects to /login with a notification.
//
// note: this deliberately fires on the user's NEXT request, not
// instantly — matching the spec ("they must be redirected when they
// try to perform an action / reload the list", not pushed out live).
// =====================================================================

import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({ baseURL: API_BASE })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let onBlocked = () => {}

// note: called once by AuthProvider on mount, passing a function that
// logs out + navigates to /login with a "you were blocked" flag.
export function setOnBlocked(callback) {
  onBlocked = callback
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const serverError = error.response?.data?.error
    if (error.response?.status === 401 && serverError === 'blocked') {
      onBlocked()
    }
    return Promise.reject(error)
  }
)

export default api