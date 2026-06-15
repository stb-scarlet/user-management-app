// =====================================================================
// Vercel serverless entry point.
//
// note: Vercel treats this file as a serverless function. Per Vercel's
// Express integration, we simply export the configured app — Vercel
// calls it directly per-request. NO app.listen() here.
// =====================================================================

const app = require('../app');

module.exports = app;
