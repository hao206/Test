import { Router } from 'express';
import pool from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

/* ── POST /api/admin/audit-logs ───────────────────────────── */
// Allow frontend to push manual logs (can be called by any authenticated user for their own actions)
router.post('/audit-logs', requireAuth, async (req, res) => {
  try {
    const { action, module, userName } = req.body;
    const ip = req.ip || req.headers['x-forwarded-for'] || '0.0.0.0';
    await pool.query(
      'INSERT INTO audit_logs (user_id, user_name, action, module, ip) VALUES ($1,$2,$3,$4,$5)',
      [req.user.id, userName || req.user.fullName, action, module, ip]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to insert audit log' });
  }
});

// Middleware to ensure admin only for the rest
router.use(requireAuth, (req, res, next) => {
  if (req.user.role !== 'Admin' && req.user.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }
  next();
});

/* ── GET /api/admin/users ─────────────────────────────────── */
router.get('/users', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, full_name as "fullName", email, role, student_id as "studentId",
             locked, last_active_at as "lastActiveAt", created_at as "createdAt"
      FROM users
      ORDER BY created_at DESC
    `);
    const users = result.rows.map(u => ({
      id: String(u.id),
      fullName: u.fullName,
      email: u.email,
      studentId: u.studentId,
      role: u.role,
      status: u.locked ? 'Locked' : 'Active',
      lastActiveAt: u.lastActiveAt,
      activityHistory: [] // To keep frontend compatible
    }));
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

/* ── PUT /api/admin/users/:id/role ────────────────────────── */
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    await pool.query('UPDATE users SET role = $1 WHERE id = $2', [role, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

/* ── PUT /api/admin/users/:id/status ──────────────────────── */
router.put('/users/:id/status', async (req, res) => {
  try {
    const { locked } = req.body;
    await pool.query('UPDATE users SET locked = $1 WHERE id = $2', [locked, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

/* ── DELETE /api/admin/users/:id ──────────────────────────── */
router.delete('/users/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

/* ── GET /api/admin/audit-logs ────────────────────────────── */
router.get('/audit-logs', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, user_id, user_name as "userName", action, module, ip, created_at as "timestamp"
      FROM audit_logs
      ORDER BY created_at DESC
      LIMIT 500
    `);
    const logs = result.rows.map(r => ({
      id: String(r.id),
      timestamp: new Date(r.timestamp).toISOString().replace('T', ' ').substring(0, 19),
      user: r.userName || 'System',
      action: r.action,
      module: r.module,
      ip: r.ip
    }));
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

/* ── DELETE /api/admin/audit-logs ─────────────────────────── */
router.delete('/audit-logs', async (req, res) => {
  try {
    await pool.query('DELETE FROM audit_logs');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear audit logs' });
  }
});

export default router;
