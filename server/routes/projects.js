import { Router } from 'express';
import pool from '../config/db.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = Router();

/* ── helpers ──────────────────────────────────────────────── */
function calcMatchScore(requiredSkills, userSkills) {
  if (!requiredSkills?.length || !userSkills?.length) return 0;
  const lower = userSkills.map((s) => s.skill_name.toLowerCase());
  const matched = requiredSkills.filter((s) => lower.includes(s.toLowerCase()));
  return Math.round((matched.length / requiredSkills.length) * 100);
}

async function enrichProject(row, userId) {
  const leaderRes = await pool.query(
    'SELECT full_name, avatar FROM users WHERE id=$1', [row.leader_id]
  );
  const leader = leaderRes.rows[0] || {};

  let matchScore = 0;
  let myApplication = null;
  let isTeamMember = false;

  if (userId) {
    const skillsRes = await pool.query('SELECT skill_name FROM user_skills WHERE user_id=$1', [userId]);
    matchScore = calcMatchScore(row.required_skills, skillsRes.rows);

    const appRes = await pool.query(
      'SELECT id, status, remark FROM applications WHERE project_id=$1 AND applicant_id=$2',
      [row.id, userId]
    );
    myApplication = appRes.rows[0] || null;

    const memberRes = await pool.query(
      'SELECT id FROM team_members WHERE project_id=$1 AND user_id=$2',
      [row.id, userId]
    );
    isTeamMember = memberRes.rows.length > 0;
  }

  return {
    id: String(row.id),
    name: row.name,
    description: row.description,
    category: row.category,
    requiredSkills: row.required_skills || [],
    deadline: row.deadline,
    teamSize: row.team_size,
    progress: row.progress,
    status: row.status,
    leaderId: String(row.leader_id),
    leaderName: leader.full_name || 'Unknown',
    leaderAvatar: leader.avatar,
    reviewStatus: row.review_status,
    hidden: row.hidden,
    featured: row.featured,
    teamFinalized: row.team_finalized,
    createdAt: row.created_at,
    matchScore,
    myApplication,
    isTeamMember,
    isLeader: userId ? String(row.leader_id) === String(userId) : false,
  };
}

/* ── GET /api/projects ────────────────────────────────────── */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, status, search, featured } = req.query;
    const uid = req.user?.id;
    const isAdmin = req.user?.role === 'Admin' || req.user?.role === 'Moderator';

    let query = `SELECT * FROM projects WHERE 1=1`;
    const params = [];

    if (!isAdmin) {
      query += ` AND hidden = false AND review_status = 'Approved'`;
    }
    if (category && category !== 'All') { params.push(category); query += ` AND category = $${params.length}`; }
    if (status && status !== 'All') { params.push(status); query += ` AND status = $${params.length}`; }
    if (featured === 'true') { query += ` AND featured = true`; }
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (name ILIKE $${params.length} OR description ILIKE $${params.length})`;
    }
    query += ` ORDER BY featured DESC, created_at DESC`;

    const result = await pool.query(query, params);
    const projects = await Promise.all(result.rows.map((r) => enrichProject(r, uid)));
    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Không thể tải danh sách dự án.' });
  }
});

/* ── GET /api/projects/mine ───────────────────────────────── */
router.get('/mine', requireAuth, async (req, res) => {
  try {
    const uid = req.user.id;
    const result = await pool.query(
      `SELECT p.* FROM projects p
       LEFT JOIN team_members tm ON tm.project_id = p.id AND tm.user_id = $1
       WHERE p.leader_id = $1 OR tm.user_id = $1
       ORDER BY p.created_at DESC`,
      [uid]
    );
    const projects = await Promise.all(result.rows.map((r) => enrichProject(r, uid)));
    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Không thể tải dự án của bạn.' });
  }
});

/* ── GET /api/projects/:id ────────────────────────────────── */
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM projects WHERE id=$1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Không tìm thấy dự án.' });
    const project = await enrichProject(result.rows[0], req.user?.id);
    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

/* ── POST /api/projects ───────────────────────────────────── */
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, description, category, requiredSkills, deadline, teamSize } = req.body;
    if (!name || !description) return res.status(400).json({ error: 'Tên và mô tả dự án là bắt buộc.' });
    if (name.length < 5) return res.status(400).json({ error: 'Tên dự án phải ít nhất 5 ký tự.' });

    const result = await pool.query(
      `INSERT INTO projects (name, description, category, required_skills, deadline, team_size, leader_id, review_status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'Pending') RETURNING *`,
      [name, description, category || 'Web Application', requiredSkills || [], deadline || null, teamSize || 4, req.user.id]
    );

    // Auto-add leader as team member
    await pool.query(
      'INSERT INTO team_members (project_id, user_id, role_in_team) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING',
      [result.rows[0].id, req.user.id, 'Project Leader']
    );

    // Audit
    const ip = req.ip || '0.0.0.0';
    await pool.query(
      'INSERT INTO audit_logs (user_id, user_name, action, module, ip) VALUES ($1,$2,$3,$4,$5)',
      [req.user.id, req.user.fullName, `Created project: ${name}`, 'Project Hub', ip]
    ).catch(() => {});

    // Notify admin
    await pool.query(
      `INSERT INTO notifications (title, message, type)
       VALUES ('Dự án mới cần duyệt', $1, 'info')`,
      [`Dự án "${name}" bởi ${req.user.fullName} đang chờ duyệt.`]
    ).catch(() => {});

    const project = await enrichProject(result.rows[0], req.user.id);
    res.status(201).json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Tạo dự án thất bại.' });
  }
});

/* ── PUT /api/projects/:id ────────────────────────────────── */
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const proj = await pool.query('SELECT * FROM projects WHERE id=$1', [req.params.id]);
    if (!proj.rows[0]) return res.status(404).json({ error: 'Không tìm thấy dự án.' });
    const isAdmin = ['Admin', 'Moderator'].includes(req.user.role);
    const isLeader = String(proj.rows[0].leader_id) === String(req.user.id);
    if (!isLeader && !isAdmin) return res.status(403).json({ error: 'Không có quyền chỉnh sửa dự án này.' });

    const { name, description, category, requiredSkills, deadline, teamSize, progress, status, reviewStatus, hidden, featured } = req.body;
    const updated = await pool.query(
      `UPDATE projects SET
         name = COALESCE($1, name), description = COALESCE($2, description),
         category = COALESCE($3, category), required_skills = COALESCE($4, required_skills),
         deadline = COALESCE($5, deadline), team_size = COALESCE($6, team_size),
         progress = COALESCE($7, progress), status = COALESCE($8, status),
         review_status = COALESCE($9, review_status),
         hidden = COALESCE($10, hidden), featured = COALESCE($11, featured)
       WHERE id = $12 RETURNING *`,
      [name, description, category, requiredSkills, deadline, teamSize, progress, status, reviewStatus, hidden, featured, req.params.id]
    );

    const ip = req.ip || req.headers['x-forwarded-for'] || '0.0.0.0';
    await pool.query(
      'INSERT INTO audit_logs (user_id, user_name, action, module, ip) VALUES ($1,$2,$3,$4,$5)',
      [req.user.id, req.user.full_name || 'System', `Updated project: ${name || proj.rows[0].name}`, 'Project Hub', ip]
    ).catch(() => {});

    const project = await enrichProject(updated.rows[0], req.user.id);
    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Cập nhật dự án thất bại.' });
  }
});

/* ── DELETE /api/projects/:id ─────────────────────────────── */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const proj = await pool.query('SELECT leader_id FROM projects WHERE id=$1', [req.params.id]);
    if (!proj.rows[0]) return res.status(404).json({ error: 'Không tìm thấy dự án.' });
    const isAdmin = ['Admin', 'Super Admin'].includes(req.user.role);
    if (String(proj.rows[0].leader_id) !== String(req.user.id) && !isAdmin) {
      return res.status(403).json({ error: 'Không có quyền xóa dự án này.' });
    }
    await pool.query('DELETE FROM projects WHERE id=$1', [req.params.id]);

    const ip = req.ip || req.headers['x-forwarded-for'] || '0.0.0.0';
    await pool.query(
      'INSERT INTO audit_logs (user_id, user_name, action, module, ip) VALUES ($1,$2,$3,$4,$5)',
      [req.user.id, req.user.full_name || 'System', `Deleted project ID: ${req.params.id}`, 'Project Hub', ip]
    ).catch(() => {});

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Xóa dự án thất bại.' });
  }
});

/* ══════════════════ APPLICATIONS WORKFLOW ══════════════════ */

/* ── POST /api/projects/:id/apply ─────────────────────────── */
router.post('/:id/apply', requireAuth, async (req, res) => {
  try {
    const { remark } = req.body;
    const projId = req.params.id;
    const uid = req.user.id;

    const proj = await pool.query('SELECT * FROM projects WHERE id=$1', [projId]);
    if (!proj.rows[0]) return res.status(404).json({ error: 'Không tìm thấy dự án.' });
    if (proj.rows[0].team_finalized) return res.status(400).json({ error: 'Nhóm đã chốt, không thể ứng tuyển.' });
    if (String(proj.rows[0].leader_id) === String(uid)) return res.status(400).json({ error: 'Bạn là chủ dự án này.' });

    const result = await pool.query(
      `INSERT INTO applications (project_id, applicant_id, remark)
       VALUES ($1,$2,$3)
       ON CONFLICT (project_id, applicant_id) DO UPDATE SET remark=$3, updated_at=NOW()
       RETURNING *`,
      [projId, uid, remark || '']
    );

    // Notify project leader
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES ($1, 'Đơn ứng tuyển mới', $2, 'info')`,
      [proj.rows[0].leader_id, `${req.user.fullName} đã xin gia nhập dự án "${proj.rows[0].name}".`]
    ).catch(() => {});

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gửi đơn ứng tuyển thất bại.' });
  }
});

/* ── GET /api/projects/:id/applications ───────────────────── */
router.get('/:id/applications', requireAuth, async (req, res) => {
  try {
    const proj = await pool.query('SELECT leader_id FROM projects WHERE id=$1', [req.params.id]);
    if (!proj.rows[0]) return res.status(404).json({ error: 'Không tìm thấy dự án.' });
    const isAdmin = ['Admin', 'Moderator'].includes(req.user.role);
    if (String(proj.rows[0].leader_id) !== String(req.user.id) && !isAdmin) {
      return res.status(403).json({ error: 'Chỉ chủ dự án mới có thể xem đơn ứng tuyển.' });
    }

    const result = await pool.query(
      `SELECT a.*, u.full_name, u.avatar, u.student_id, u.faculty, u.major,
              u.reputation_score, u.biography
       FROM applications a
       JOIN users u ON u.id = a.applicant_id
       WHERE a.project_id = $1
       ORDER BY a.created_at DESC`,
      [req.params.id]
    );

    // Enrich with skills and match score
    const projectSkills = (await pool.query('SELECT required_skills FROM projects WHERE id=$1', [req.params.id])).rows[0]?.required_skills || [];
    const apps = await Promise.all(result.rows.map(async (app) => {
      const skillsRes = await pool.query('SELECT skill_name, skill_level FROM user_skills WHERE user_id=$1', [app.applicant_id]);
      const matchScore = calcMatchScore(projectSkills, skillsRes.rows);
      return {
        id: app.id,
        projectId: app.project_id,
        applicantId: app.applicant_id,
        remark: app.remark,
        status: app.status,
        createdAt: app.created_at,
        applicant: {
          id: app.applicant_id,
          fullName: app.full_name,
          avatar: app.avatar,
          studentId: app.student_id,
          faculty: app.faculty,
          major: app.major,
          reputationScore: app.reputation_score,
          biography: app.biography,
          skills: skillsRes.rows.map((s) => ({ name: s.skill_name, level: s.skill_level })),
          matchScore,
        },
      };
    }));

    res.json(apps);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Không thể tải danh sách đơn ứng tuyển.' });
  }
});

/* ── PUT /api/projects/:id/applications/:appId ────────────── */
router.put('/:id/applications/:appId', requireAuth, async (req, res) => {
  try {
    const { action } = req.body; // 'approve' | 'reject'
    if (!['approve', 'reject'].includes(action)) return res.status(400).json({ error: 'Action không hợp lệ.' });

    const proj = await pool.query('SELECT * FROM projects WHERE id=$1', [req.params.id]);
    if (!proj.rows[0]) return res.status(404).json({ error: 'Không tìm thấy dự án.' });
    if (String(proj.rows[0].leader_id) !== String(req.user.id)) return res.status(403).json({ error: 'Chỉ chủ dự án mới có thể xét đơn.' });
    if (proj.rows[0].team_finalized) return res.status(400).json({ error: 'Nhóm đã chốt, không thể thay đổi đơn.' });

    const newStatus = action === 'approve' ? 'Approved' : 'Rejected';
    const appRes = await pool.query(
      'UPDATE applications SET status=$1, updated_at=NOW() WHERE id=$2 AND project_id=$3 RETURNING *',
      [newStatus, req.params.appId, req.params.id]
    );
    if (!appRes.rows[0]) return res.status(404).json({ error: 'Không tìm thấy đơn ứng tuyển.' });

    // Notify applicant
    const app = appRes.rows[0];
    const msg = action === 'approve'
      ? `Đơn ứng tuyển vào dự án "${proj.rows[0].name}" của bạn đã được CHẤP NHẬN! 🎉`
      : `Đơn ứng tuyển vào dự án "${proj.rows[0].name}" của bạn chưa phù hợp lần này.`;
    await pool.query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES ($1,$2,$3,$4)',
      [app.applicant_id, action === 'approve' ? 'Đơn được chấp nhận 🎉' : 'Kết quả đơn ứng tuyển', msg, action === 'approve' ? 'success' : 'info']
    ).catch(() => {});

    res.json(appRes.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Xét đơn thất bại.' });
  }
});

/* ── POST /api/projects/:id/finalize ─────────────────────── */
// GIAI ĐOẠN CHUYỂN GIAO: Chốt nhóm → Kích hoạt Workspace Kanban
router.post('/:id/finalize', requireAuth, async (req, res) => {
  try {
    const projId = req.params.id;
    const proj = await pool.query('SELECT * FROM projects WHERE id=$1', [projId]);
    if (!proj.rows[0]) return res.status(404).json({ error: 'Không tìm thấy dự án.' });
    if (String(proj.rows[0].leader_id) !== String(req.user.id)) {
      return res.status(403).json({ error: 'Chỉ chủ dự án mới có thể chốt nhóm.' });
    }
    if (proj.rows[0].team_finalized) return res.status(400).json({ error: 'Nhóm đã được chốt trước đó.' });

    // Get all approved applicants
    const approved = await pool.query(
      'SELECT applicant_id FROM applications WHERE project_id=$1 AND status=\'Approved\'',
      [projId]
    );

    // Add approved members to team_members table
    for (const row of approved.rows) {
      await pool.query(
        'INSERT INTO team_members (project_id, user_id, role_in_team) VALUES ($1,$2,\'Member\') ON CONFLICT DO NOTHING',
        [projId, row.applicant_id]
      );
      // Notify each member
      await pool.query(
        `INSERT INTO notifications (user_id, title, message, type) VALUES ($1,$2,$3,'success')`,
        [row.applicant_id, 'Nhóm đã chốt! 🚀', `Bạn đã chính thức gia nhập dự án "${proj.rows[0].name}". Workspace Kanban đã sẵn sàng.`]
      ).catch(() => {});
    }

    // Mark project as finalized + change status to Active
    await pool.query(
      `UPDATE projects SET team_finalized=true, status='Active', review_status='Approved' WHERE id=$1`,
      [projId]
    );

    // Reject all remaining Pending applications
    await pool.query(
      "UPDATE applications SET status='Rejected', updated_at=NOW() WHERE project_id=$1 AND status='Pending'",
      [projId]
    );

    // Audit log
    await pool.query(
      'INSERT INTO audit_logs (user_id, user_name, action, module, ip) VALUES ($1,$2,$3,$4,$5)',
      [req.user.id, req.user.fullName, `Finalized team for: ${proj.rows[0].name}`, 'Project Hub', req.ip || '0.0.0.0']
    ).catch(() => {});

    const updatedProject = await pool.query('SELECT * FROM projects WHERE id=$1', [projId]);
    const project = await enrichProject(updatedProject.rows[0], req.user.id);
    res.json({ project, membersAdded: approved.rows.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Chốt nhóm thất bại. Vui lòng thử lại.' });
  }
});

/* ── GET /api/projects/:id/team ───────────────────────────── */
router.get('/:id/team', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT tm.*, u.full_name, u.avatar, u.student_id, u.email, u.faculty, u.major
       FROM team_members tm
       JOIN users u ON u.id = tm.user_id
       WHERE tm.project_id = $1
       ORDER BY tm.joined_at ASC`,
      [req.params.id]
    );
    const members = result.rows.map((r) => ({
      id: r.user_id,
      fullName: r.full_name,
      avatar: r.avatar,
      studentId: r.student_id,
      email: r.email,
      faculty: r.faculty,
      major: r.major,
      roleInTeam: r.role_in_team,
      joinedAt: r.joined_at,
    }));
    res.json(members);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Không thể tải danh sách thành viên.' });
  }
});

export default router;
