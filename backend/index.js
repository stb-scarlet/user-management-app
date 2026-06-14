// =====================================================================
// Application entry point.
// =====================================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const requireActiveUser = require('./middleware/requireActiveUser');

const app = express();

// note: CLIENT_URL must point at the deployed frontend (e.g. your
// Vercel URL) so the browser's CORS check allows requests from it.
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

// Public routes — no auth required.
app.use('/api/auth', authRoutes);

// important: every route under /api/users passes through
// requireActiveUser FIRST. This is the single centralized
// "user exists and isn't blocked" check described in the spec.
app.use('/api/users', requireActiveUser, userRoutes);

app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
