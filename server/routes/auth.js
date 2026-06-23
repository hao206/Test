import { Router } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/db.js';
import { requireAuth, signToken } from '../middleware/auth.js';

const router = Router();

/* ── helpers ─────────────────────────────────────────────── */
function buildUserProfile(row, skills = [], interests = []) {
  return {
    id: row.id,
    fullName: row.full_name,
    studentId: row.student_id,
    email: row.email,
    role: row.role,
    avatar: row.avatar,
    coverPhoto: row.cover_photo,
    faculty: row.faculty,
    major: row.major,
    academicYear: row.academic_year,
    biography: row.biography,
    careerGoals: row.career_goals,
    reputationScore: row.reputation_score,
    github: row.github,
    linkedin: row.linkedin,
    locked: row.locked,
    lastActiveAt: row.last_active_at,
    skills: skills.map((s) => ({ name: s.skill_name, level: s.skill_level })),
    interests: interests.map((i) => i.interest),
    completedProjects: [],
  };
}

async function getUserWithExtras(userId) {
  const [userRes, skillsRes, interestsRes] = await Promise.all([
    pool.query('SELECT * FROM users WHERE id = $1', [userId]),
    pool.query('SELECT skill_name, skill_level FROM user_skills WHERE user_id = $1', [userId]),
    pool.query('SELECT interest FROM user_interests WHERE user_id = $1', [userId]),
  ]);
  if (!userRes.rows[0]) return null;
  return buildUserProfile(userRes.rows[0], skillsRes.rows, interestsRes.rows);
}

/* ── POST /api/auth/register ─────────────────────────────── */
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, studentId, faculty, major, academicYear } = req.body;
    if (!email || !password || !fullName || !studentId) {
      return res.status(400).json({ error: 'Email, mật khẩu, họ tên và MSSV là bắt buộc.' });
    }
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail.endsWith('@gmail.com') && !cleanEmail.endsWith('@st.utt.edu.vn')) {
      return res.status(400).json({ error: 'Email phải có định dạng @gmail.com hoặc @st.utt.edu.vn' });
    }
    const pwRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!pwRegex.test(password)) {
      return res.status(400).json({ error: 'Mật khẩu quá yếu. Phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.' });
    }

    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR student_id = $2',
      [cleanEmail, studentId]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email hoặc MSSV đã tồn tại.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, student_id, role, faculty, major, academic_year)
       VALUES ($1,$2,$3,$4,'Student',$5,$6,$7) RETURNING id`,
      [cleanEmail, hash, fullName, studentId, faculty || null, major || null, academicYear || null]
    );
    const userId = result.rows[0].id;
    const profile = await getUserWithExtras(userId);
    const token = signToken({ id: userId, email: cleanEmail, full_name: fullName, role: 'Student', student_id: studentId });

    // Audit log
    const ip = req.ip || req.headers['x-forwarded-for'] || '0.0.0.0';
    await pool.query(
      'INSERT INTO audit_logs (user_id, user_name, action, module, ip) VALUES ($1,$2,$3,$4,$5)',
      [userId, fullName, 'New User Registration', 'Auth', ip]
    ).catch(() => {});

    res.status(201).json({ token, user: profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Đăng ký thất bại. Vui lòng thử lại.' });
  }
});

/* ── POST /api/auth/login ────────────────────────────────── */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email và mật khẩu là bắt buộc.' });

    const cleanEmail = email.trim().toLowerCase();
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [cleanEmail]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng.' });
    if (user.locked) return res.status(403).json({ error: 'Tài khoản đã bị khóa. Vui lòng liên hệ Admin.' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng.' });

    // Update last_active_at
    await pool.query('UPDATE users SET last_active_at = NOW() WHERE id = $1', [user.id]);

    const profile = await getUserWithExtras(user.id);
    const token = signToken(user);

    // Audit log
    const ip = req.ip || req.headers['x-forwarded-for'] || '0.0.0.0';
    await pool.query(
      'INSERT INTO audit_logs (user_id, user_name, action, module, ip) VALUES ($1,$2,$3,$4,$5)',
      [user.id, user.full_name, 'Login Successful', 'Auth', ip]
    ).catch(() => {});

    res.json({ token, user: profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Đăng nhập thất bại. Vui lòng thử lại.' });
  }
});

/* ── GET /api/auth/me ────────────────────────────────────── */
router.get('/me', requireAuth, async (req, res) => {
  try {
    const profile = await getUserWithExtras(req.user.id);
    if (!profile) return res.status(404).json({ error: 'Không tìm thấy tài khoản.' });
    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

/* ── PUT /api/auth/profile ───────────────────────────────── */
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const { fullName, faculty, major, academicYear, biography, careerGoals, github, linkedin, avatar, coverPhoto, skills, interests } = req.body;
    const uid = req.user.id;

    await pool.query(
      `UPDATE users SET full_name=COALESCE($1,full_name), faculty=COALESCE($2,faculty),
       major=COALESCE($3,major), academic_year=COALESCE($4,academic_year),
       biography=COALESCE($5,biography), career_goals=COALESCE($6,career_goals),
       github=COALESCE($7,github), linkedin=COALESCE($8,linkedin),
       avatar=COALESCE($9,avatar), cover_photo=COALESCE($10,cover_photo)
       WHERE id=$11`,
      [fullName, faculty, major, academicYear, biography, careerGoals, github, linkedin, avatar, coverPhoto, uid]
    );

    if (Array.isArray(skills)) {
      await pool.query('DELETE FROM user_skills WHERE user_id=$1', [uid]);
      for (const s of skills) {
        await pool.query(
          'INSERT INTO user_skills (user_id, skill_name, skill_level) VALUES ($1,$2,$3)',
          [uid, s.name, s.level]
        );
      }
    }
    if (Array.isArray(interests)) {
      await pool.query('DELETE FROM user_interests WHERE user_id=$1', [uid]);
      for (const i of interests) {
        await pool.query('INSERT INTO user_interests (user_id, interest) VALUES ($1,$2)', [uid, i]);
      }
    }

    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Cập nhật hồ sơ thất bại.' });
  }
});

/* ── POST /api/auth/xp ───────────────────────────────────── */
router.post('/xp', requireAuth, async (req, res) => {
  try {
    const { amount } = req.body;
    if (typeof amount !== 'number') return res.status(400).json({ error: 'Amount must be a number' });
    
    await pool.query(
      'UPDATE users SET reputation_score = reputation_score + $1 WHERE id = $2',
      [amount, req.user.id]
    );
    res.json({ success: true, added: amount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi cập nhật XP' });
  }
});

/* ── GET /api/auth/leaderboard ───────────────────────────── */
router.get('/leaderboard', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, full_name, avatar, reputation_score, student_id, faculty, major, role
       FROM users 
       WHERE role = 'Student' OR role = 'Project Leader' OR role = 'Contributor'
       ORDER BY reputation_score DESC LIMIT 5`
    );
    
    const leaders = result.rows.map(r => ({
      id: r.id,
      fullName: r.full_name,
      avatar: r.avatar,
      score: r.reputation_score,
      studentId: r.student_id,
      faculty: r.faculty,
      major: r.major,
      role: r.role
    }));
    
    res.json(leaders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi tải bảng xếp hạng' });
  }
});

export default router;
