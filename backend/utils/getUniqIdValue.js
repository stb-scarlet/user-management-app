// =====================================================================
// Small shared utility functions.
// =====================================================================

const crypto = require('crypto');

/**
 * getUniqIdValue
 * ---------------------------------------------------------------
 * important: returns a cryptographically random, unguessable string.
 *
 * note: this is used as the e-mail CONFIRMATION TOKEN. It must be
 * unpredictable — if an attacker could guess or brute-force it, they
 * could "confirm" (and thus mark as active) accounts they don't own.
 *
 * nota bene: this is intentionally NOT related to the database's
 * AUTO_INCREMENT `id` column. The numeric id identifies a *row*;
 * this value is a one-time secret used only for the confirmation
 * link, e.g. https://app.example.com/confirm/<this value>.
 * ---------------------------------------------------------------
 */
function getUniqIdValue() {
  return crypto.randomBytes(32).toString('hex');
}

module.exports = { getUniqIdValue };
