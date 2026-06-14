// =====================================================================
// E-mail sending (used for the registration confirmation link).
//
// important: the task explicitly says the confirmation e-mail must be
// sent ASYNCHRONOUSLY — i.e. the /register endpoint must respond to
// the client immediately ("Registration successful") without waiting
// for the e-mail to actually be delivered. See routes/auth.js, where
// sendConfirmationEmail(...) is called WITHOUT `await` and its promise
// is only `.catch()`-ed for logging.
//
// note: for testing purposes the task allows sending mail via a
// regular Gmail account using an "app password"
// (https://myaccount.google.com/apppasswords).
// =====================================================================

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

/**
 * sendConfirmationEmail
 * ---------------------------------------------------------------
 * Sends the "confirm your account" e-mail containing a link back to
 * the frontend's /confirm/:token route.
 *
 * note: returns the promise from transporter.sendMail so the caller
 * CAN await it if desired, but in the register handler we deliberately
 * don't, to keep the HTTP response fast (see comment above).
 * ---------------------------------------------------------------
 */
function sendConfirmationEmail(toEmail, token) {
  const confirmUrl = `${process.env.CLIENT_URL}/confirm/${token}`;

  return transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: toEmail,
    subject: 'Confirm your account',
    html: `
      <p>Thanks for registering!</p>
      <p>Please confirm your e-mail address by clicking the link below:</p>
      <p><a href="${confirmUrl}">${confirmUrl}</a></p>
      <p>If you didn't create this account, you can ignore this e-mail.</p>
    `,
  });
}

module.exports = { sendConfirmationEmail };
