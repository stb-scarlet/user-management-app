// =====================================================================
// User management routes.
//
// note: every route here is protected by requireActiveUser — see
// index.js where it's applied to this whole router.
// =====================================================================

const router = require('express').Router();
const pool = require('../db');

// ---------------------------------------------------------------
// GET /api/users
//
// Returns all users, sorted by "last seen" (most recently active
// first). Users who never logged in (last_login IS NULL) are sorted
// to the end.
// ---------------------------------------------------------------
router.get('/', async (req, res) => {
  // note: `last_login IS NULL` evaluates to 0 for non-null values and
  // 1 for NULL, so ordering by it first pushes "never logged in" rows
  // to the bottom, then orders the rest by most-recent first.
  const [rows] = await pool.query(
    `SELECT id, name, email, status, last_login, created_at
     FROM users
     ORDER BY (last_login IS NULL), last_login DESC`
  );
  res.json(rows);
});

// ---------------------------------------------------------------
// PATCH /api/users/status
// body: { ids: number[], status: 'active' | 'blocked' }
//
// Used for both the "Block" and "Unblock" toolbar buttons.
//
// important: a user IS allowed to block or delete themselves (per
// spec). If that happens, requireActiveUser will reject their VERY
// NEXT request (e.g. reloading the list), which is when the frontend
// redirects them to /login — not instantly via some push mechanism.
// ---------------------------------------------------------------
router.patch('/status', async (req, res) => {
  const { ids, status } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'No users selected.' });
  }
  if (!['active', 'blocked'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status.' });
  }

  await pool.query('UPDATE users SET status = ? WHERE id IN (?)', [status, ids]);
  res.json({ message: status === 'blocked' ? 'User(s) blocked.' : 'User(s) unblocked.' });
});

// ---------------------------------------------------------------
// DELETE /api/users
// body: { ids: number[] }
//
// note: deleted users are REMOVED from the table entirely (not just
// flagged), so the same e-mail can be re-registered afterwards —
// the UNIQUE INDEX no longer sees a conflicting row.
// ---------------------------------------------------------------
router.delete('/', async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'No users selected.' });
  }

  await pool.query('DELETE FROM users WHERE id IN (?)', [ids]);
  res.json({ message: 'User(s) deleted.' });
});

// ---------------------------------------------------------------
// DELETE /api/users/unverified
//
// "Delete unverified" toolbar button — removes ALL users whose
// status is "unverified", regardless of the current checkbox
// selection.
// ---------------------------------------------------------------
router.delete('/unverified', async (req, res) => {
  const [result] = await pool.query(`DELETE FROM users WHERE status = 'unverified'`);
  res.json({ message: `${result.affectedRows} unverified user(s) deleted.` });
});

module.exports = router;
