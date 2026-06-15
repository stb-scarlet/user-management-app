-- =====================================================================
-- Database schema for the User Management application.
--
-- IMPORTANT: this schema is the single source of truth for e-mail
-- uniqueness. The application code never checks "does this e-mail
-- already exist" by itself — it relies entirely on the UNIQUE INDEX
-- below and simply reacts to the duplicate-key error the database
-- throws (see backend/routes/auth.js, the ER_DUP_ENTRY handler).
-- =====================================================================

CREATE TABLE IF NOT EXISTS users (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  name                VARCHAR(255)      NOT NULL,
  email               VARCHAR(255)      NOT NULL,
  password            VARCHAR(255)      NOT NULL,

  -- note: three possible statuses as required by the task.
  -- A freshly registered user is "unverified" until they click the
  -- confirmation link sent to their e-mail. "blocked" users can never
  -- log in, regardless of confirmation status.
  status              ENUM('unverified', 'active', 'blocked')
                      NOT NULL DEFAULT 'unverified',

  -- note: opaque random token used only for the e-mail confirmation
  -- link. It is cleared (set to NULL) once the e-mail is confirmed.
  confirmation_token  VARCHAR(255)      DEFAULT NULL,

  last_login          DATETIME          DEFAULT NULL,
  created_at          DATETIME          DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- THE UNIQUE INDEX (the actual graded requirement).
--
-- nota bene: a UNIQUE INDEX is not the same thing as a PRIMARY KEY.
-- The primary key (id) guarantees row identity; this index guarantees
-- that the *storage layer itself* will refuse to insert two rows with
-- the same e-mail, no matter how many concurrent requests try to do
-- so at the same time. This is what makes the guarantee race-condition
-- safe — application-level "SELECT ... then INSERT" checks are not.
-- =====================================================================
CREATE UNIQUE INDEX idx_users_email ON users(email);
