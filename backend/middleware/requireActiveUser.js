// =====================================================================
// requireActiveUser middleware
//
// important: THIS IS THE SINGLE PLACE in the entire codebase that
// checks "does the user still exist, and are they not blocked".
// Every protected route (everything except /auth/register,
// /auth/login and /auth/confirm/:token) goes through this middleware.
// Do NOT duplicate this check inside individual route handlers.
//
// note: per the task spec, a blocked/deleted user is NOT forcibly
// disconnected the instant they're blocked. They simply get rejected
// the NEXT time they make a request (reload the user list, click
// Block/Unblock, etc.) — which is exactly what happens here, because
// this middleware re-checks the database on every request.
// =====================================================================

const jwt = require('jsonwebtoken');
const pool = require('../db');

async function requireActiveUser(req, res, next) {
  // --- Step 1: verify the JWT itself -------------------------------
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'not_authenticated' });
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'not_authenticated' });
  }

  // --- Step 2: re-check the user's CURRENT state in the database ---
  // nota bene: we deliberately query the database on every request
  // instead of trusting the JWT payload, because the JWT can't know
  // if the user has been blocked or deleted *after* it was issued.
  const [rows] = await pool.query(
    'SELECT id, name, email, status FROM users WHERE id = ?',
    [payload.id]
  );

  if (!rows.length) {
    // User no longer exists (deleted) -> treat exactly like "blocked"
    return res.status(401).json({ error: 'blocked' });
  }

  const user = rows[0];
  if (user.status === 'blocked') {
    return res.status(401).json({ error: 'blocked' });
  }

  // important: note that "unverified" users ARE allowed through —
  // per the spec, unverified users can still log in and manage users.
  req.user = user;
  next();
}

module.exports = requireActiveUser;
