import { Router } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

/* ── GET /api/users ──────────────────────────────────────── */
router.get('/', requireAuth, async (req, res) => {
  try {
    const { search, role } = req.query;
    let query = `
      SELECT u.id, u.full_name, u.email, u.student_id, u.role, u.avatar,
             u.faculty, u.major, u.academic_year, u.reputation_score,
             u.locked, u.last_active_at, u.created_at,
             u.biography, u.github, u.linkedin
      FROM users u WHERE 1=1`;
    const params = [];

    if (role && role !== 'All') { params.push(role); query += ` AND u.role=$${params.length}`; }
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (u.full_name ILIKE $${params.length} OR u.email ILIKE $${params.length} OR u.student_id ILIKE $${params.length})`;
    }
    query += ` ORDER BY u.reputation_score DESC, u.created_at DESC`;

    const result = await pool.query(query, params);

    const users = await Promise.all(result.rows.map(async (u) => {
      const [skills, interests] = await Promise.all([
        pool.query('SELECT skill_name, skill_level FROM user_skills WHERE user_id=$1', [u.id]),
        pool.query('SELECT interest FROM user_interests WHERE user_id=$1', [u.id]),
      ]);
      return {
        id: String(u.id), fullName: u.full_name, email: u.email, studentId: u.student_id,
        role: u.role, avatar: u.avatar, faculty: u.faculty, major: u.major,
        academicYear: u.academic_year, reputationScore: u.reputation_score,
        biography: u.biography, github: u.github, linkedin: u.linkedin,
        locked: u.locked, lastActiveAt: u.last_active_at, createdAt: u.created_at,
        skills: skills.rows.map((s) => ({ name: s.skill_name, level: s.skill_level })),
        interests: interests.rows.map((i) => i.interest),
      };
    }));

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Không thể tải danh sách người dùng.' });
  }
});

/* ── GET /api/users/:id ─────────────────────────────────── */
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id=$1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Không tìm thấy người dùng.' });
    const u = result.rows[0];

    const [skills, interests, projects] = await Promise.all([
      pool.query('SELECT skill_name, skill_level FROM user_skills WHERE user_id=$1', [u.id]),
      pool.query('SELECT interest FROM user_interests WHERE user_id=$1', [u.id]),
      pool.query(
        `SELECT p.id, p.name, p.status, p.category, p.progress FROM projects p
         LEFT JOIN team_members tm ON tm.project_id=p.id AND tm.user_id=$1
         WHERE p.leader_id=$1 OR tm.user_id=$1 ORDER BY p.created_at DESC LIMIT 10`,
        [u.id]
      ),
    ]);

    res.json({
      id: String(u.id), fullName: u.full_name, email: u.email, studentId: u.student_id,
      role: u.role, avatar: u.avatar, coverPhoto: u.cover_photo,
      faculty: u.faculty, major: u.major, academicYear: u.academic_year,
      biography: u.biography, careerGoals: u.career_goals,
      reputationScore: u.reputation_score, github: u.github, linkedin: u.linkedin,
      locked: u.locked, lastActiveAt: u.last_active_at, createdAt: u.created_at,
      skills: skills.rows.map((s) => ({ name: s.skill_name, level: s.skill_level })),
      interests: interests.rows.map((i) => i.interest),
      completedProjects: projects.rows.map((p) => ({
        id: String(p.id), name: p.name, status: p.status,
        category: p.category, progress: p.progress,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Không thể tải hồ sơ người dùng.' });
  }
});

/* ── PUT /api/users/:id/admin ───────────────────────────── */
// Admin-only: lock/unlock, change role
router.put('/:id/admin', requireAuth, requireRole('Admin'), async (req, res) => {
  try {
    const { locked, role } = req.body;
    const updated = await pool.query(
      `UPDATE users SET
         locked = COALESCE($1, locked),
         role = COALESCE($2, role)
       WHERE id=$3 RETURNING id, full_name, locked, role`,
      [locked, role, req.params.id]
    );
    if (!updated.rows[0]) return res.status(404).json({ error: 'Không tìm thấy người dùng.' });

    await pool.query(
      'INSERT INTO audit_logs (user_id, user_name, action, module, ip) VALUES ($1,$2,$3,$4,$5)',
      [req.user.id, req.user.fullName,
       `Admin action on user ${updated.rows[0].full_name}: locked=${locked}, role=${role}`,
       'User Management', req.ip || '0.0.0.0']
    ).catch(() => {});

    res.json(updated.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Cập nhật người dùng thất bại.' });
  }
});

/* ── PUT /api/users/:id/password ────────────────────────── */
router.put('/:id/password', requireAuth, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'Admin';
    if (String(req.user.id) !== String(req.params.id) && !isAdmin) {
      return res.status(403).json({ error: 'Không có quyền đổi mật khẩu tài khoản này.' });
    }
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) return res.status(400).json({ error: 'Mật khẩu mới phải ít nhất 6 ký tự.' });

    const userRes = await pool.query('SELECT password_hash FROM users WHERE id=$1', [req.params.id]);
    if (!isAdmin && currentPassword) {
      const match = await bcrypt.compare(currentPassword, userRes.rows[0].password_hash);
      if (!match) return res.status(401).json({ error: 'Mật khẩu hiện tại không đúng.' });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash=$1 WHERE id=$2', [hash, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Đổi mật khẩu thất bại.' });
  }
});

/* ── DELETE /api/users/:id ──────────────────────────────── */
router.delete('/:id', requireAuth, requireRole('Admin'), async (req, res) => {
  try {
    if (String(req.user.id) === String(req.params.id)) {
      return res.status(400).json({ error: 'Không thể tự xóa tài khoản của chính mình.' });
    }
    await pool.query('DELETE FROM users WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Xóa người dùng thất bại.' });
  }
});

/* ══════════════════ NOTIFICATIONS ══════════════════════════ */

/* ── GET /api/users/notifications/mine ──────────────────── */
router.get('/notifications/mine', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM notifications WHERE user_id=$1 OR user_id IS NULL
       ORDER BY created_at DESC LIMIT 50`,
      [req.user.id]
    );
    res.json(result.rows.map((n) => ({
      id: String(n.id), userId: n.user_id ? String(n.user_id) : null,
      title: n.title, message: n.message, type: n.type,
      read: n.read, createdAt: n.created_at,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Không thể tải thông báo.' });
  }
});

/* ── PUT /api/users/notifications/read-all ──────────────── */
router.put('/notifications/read-all', requireAuth, async (req, res) => {
  try {
    await pool.query(
      'UPDATE notifications SET read=true WHERE (user_id=$1 OR user_id IS NULL) AND read=false',
      [req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Đánh dấu đã đọc thất bại.' });
  }
});

/* ══════════════════ ADMIN ONLY ══════════════════════════════ */

/* ── GET /api/users/admin/audit-logs ────────────────────── */
router.get('/admin/audit-logs', requireAuth, requireRole('Admin', 'Moderator'), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 200'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Không thể tải audit logs.' });
  }
});

/* ── GET /api/users/admin/stats ─────────────────────────── */
router.get('/admin/stats', requireAuth, requireRole('Admin', 'Moderator'), async (req, res) => {
  try {
    const [users, projects, posts, tasks, pendingProjects, pendingApps] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query('SELECT COUNT(*) FROM projects'),
      pool.query('SELECT COUNT(*) FROM posts'),
      pool.query('SELECT COUNT(*) FROM tasks'),
      pool.query("SELECT COUNT(*) FROM projects WHERE review_status='Pending'"),
      pool.query("SELECT COUNT(*) FROM applications WHERE status='Pending'"),
    ]);

    res.json({
      totalUsers: parseInt(users.rows[0].count),
      totalProjects: parseInt(projects.rows[0].count),
      totalPosts: parseInt(posts.rows[0].count),
      totalTasks: parseInt(tasks.rows[0].count),
      pendingProjects: parseInt(pendingProjects.rows[0].count),
      pendingApplications: parseInt(pendingApps.rows[0].count),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Không thể tải thống kê.' });
  }
});

export default router;
