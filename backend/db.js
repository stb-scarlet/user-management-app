// =====================================================================
// MySQL connection pool.
//
// note: a connection pool (rather than a single connection) is used
// so that concurrent requests from multiple users don't block each
// other while waiting for a free database connection.
//
// important: on Vercel, each serverless invocation runs in its own
// isolated environment, but "warm" invocations reuse the same module
// instance — so this pool gets reused across requests on a warm
// instance, but MULTIPLE concurrent instances can each create their
// own pool. To avoid exhausting your MySQL provider's connection
// limit (often 5-10 on free tiers like Aiven/freedb), we keep
// connectionLimit LOW. Override via DB_CONNECTION_LIMIT if needed.
// =====================================================================

const mysql = require('mysql2/promise');

const useSsl = process.env.DB_SSL === 'true';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 2,
  // important: many free MySQL providers (e.g. Aiven) require a TLS
  // connection. `rejectUnauthorized: false` accepts their
  // self-signed/managed certs without requiring you to ship a CA file.
  ...(useSsl ? { ssl: { rejectUnauthorized: false } } : {}),
});

module.exports = pool;
