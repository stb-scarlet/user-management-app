const router = require('express').Router();
const jwt = require('jsonwebtoken');
const db = require('../db');

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
};

const checkBlocked = async (req, res, next) => {
    const [rows] = await db.query('SELECT status FROM users WHERE id = ?', [req.user.id]);
    if (!rows.length || rows[0].status === 'blocked') {
        return res.status(403).json({ error: 'blocked' });
    }
    next();
};

router.get('/', auth, checkBlocked, async (req, res) => {
    const [rows] = await db.query(
        'SELECT id, name, email, status, last_login, created_at FROM users'
    );
    res.json(rows);
});

router.patch('/status', auth, checkBlocked, async (req, res) => {
    const { ids, status } = req.body;
    await db.query('UPDATE users SET status = ? WHERE id IN (?)', [status, ids]);
    res.json({ message: 'Updated' });
});

router.delete('/', auth, checkBlocked, async (req, res) => {
    const { ids } = req.body;
    await db.query('DELETE FROM users WHERE id IN (?)', [ids]);
    res.json({ message: 'Deleted' });
});

module.exports = router;