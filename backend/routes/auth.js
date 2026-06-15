// =====================================================================
// Authentication routes: /register, /login, /confirm/:token
// =====================================================================

const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { getUniqIdValue } = require('../utils/getUniqIdValue');
const { sendConfirmationEmail } = require('../utils/mailer');

// ---------------------------------------------------------------
// POST /api/auth/register
//
// important: this is the ONLY place that creates a new user. Note
// that we do NOT run a "SELECT ... WHERE email = ?" check before the
// INSERT. Uniqueness is enforced purely by the UNIQUE INDEX on the
// `email` column (see schema.sql) — if a duplicate is inserted, MySQL
// itself rejects it with error code ER_DUP_ENTRY, which we catch below.
// ---------------------------------------------------------------
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  // note: per the spec, "any non-empty password" is valid — we only
  // check for presence, not strength.
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    // note: every new account starts as "unverified" and gets a random
    // confirmation token (see utils/getUniqIdValue.js).
    const confirmationToken = getUniqIdValue();

    const [result] = await pool.query(
      `INSERT INTO users (name, email, password, status, confirmation_token)
       VALUES (?, ?, ?, 'unverified', ?)`,
      [name, email, passwordHash, confirmationToken]
    );

    // important: send the confirmation e-mail ASYNCHRONOUSLY.
    // We deliberately do NOT await this — the user is registered
    // "right away" and gets an immediate success response, per spec.
    // Any e-mail-sending failure is only logged server-side and does
    // NOT fail the registration.
    sendConfirmationEmail(email, confirmationToken).catch((err) => {
      console.error('Failed to send confirmation e-mail:', err.message);
    });

    return res.status(201).json({
      message: 'Registration successful! Please check your e-mail to confirm your account.',
      userId: result.insertId,
    });
  } catch (err) {
    // important: THIS is the "place in the code that catches the
    // corresponding error" required by the task. The uniqueness
    // violation comes straight from the database's UNIQUE INDEX, not
    // from any pre-check in our code.
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'This e-mail is already registered.' });
    }
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});

// ---------------------------------------------------------------
// GET /api/auth/confirm/:token
//
// note: clicking the link in the confirmation e-mail hits this
// endpoint. If the account is "unverified", it becomes "active".
// If it's "blocked", it STAYS "blocked" (per spec) — confirmation
// does not un-block anyone.
// ---------------------------------------------------------------
router.get('/confirm/:token', async (req, res) => {
  const { token } = req.params;

  const [rows] = await pool.query(
    'SELECT id, status FROM users WHERE confirmation_token = ?',
    [token]
  );

  if (!rows.length) {
    return res.status(400).json({ error: 'Invalid or already-used confirmation link.' });
  }

  const user = rows[0];

  // nota bene: only "unverified" transitions to "active". A blocked
  // user clicking an old confirmation link must remain blocked.
  if (user.status === 'unverified') {
    await pool.query(
      `UPDATE users SET status = 'active', confirmation_token = NULL WHERE id = ?`,
      [user.id]
    );
    return res.json({ message: 'Your e-mail has been confirmed. You can now log in.' });
  }

  // Already active or blocked — just clear the token, nothing to change.
  await pool.query('UPDATE users SET confirmation_token = NULL WHERE id = ?', [user.id]);
  return res.json({ message: 'This account has already been confirmed.' });
});

// ---------------------------------------------------------------
// POST /api/auth/login
//
// note: per the spec, unverified users CAN log in and use the app.
// Only "blocked" status prevents login.
// ---------------------------------------------------------------
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

  if (!rows.length) {
    return res.status(401).json({ error: 'Invalid e-mail or password.' });
  }

  const user = rows[0];

  // important: blocked users can never log in, regardless of password.
  if (user.status === 'blocked') {
    return res.status(403).json({ error: 'Your account has been blocked.' });
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    return res.status(401).json({ error: 'Invalid e-mail or password.' });
  }

  // note: record the login time — this is the "Last seen" column the
  // user table is sorted by.
  await pool.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

  return res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, status: user.status },
  });
});

module.exports = router;
