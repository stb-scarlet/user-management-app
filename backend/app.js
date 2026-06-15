// =====================================================================
// Express app definition (NO app.listen() here).
//
// note: this file is shared by two entry points:
//   - index.js      -> for local development (calls app.listen)
//   - api/index.js  -> for Vercel (exports the app as a serverless function)
//
// important: keeping app.listen() OUT of this file is required for
// Vercel — its serverless runtime calls the exported Express app
// directly per-request and manages the HTTP server itself.
// =====================================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const requireActiveUser = require('./middleware/requireActiveUser');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);

// important: every route under /api/users passes through
// requireActiveUser FIRST — the single centralized "user exists and
// isn't blocked" check described in the spec.
app.use('/api/users', requireActiveUser, userRoutes);

app.get('/api', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = app;
