import { Router } from 'express';
import pool from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

/* ── helper: check membership (leader OR team member) ─────── */
async function isMember(projectId, userId) {
  const res = await pool.query(
    `SELECT 1 FROM projects WHERE id=$1 AND leader_id=$2
     UNION
     SELECT 1 FROM team_members WHERE project_id=$1 AND user_id=$2`,
    [projectId, userId]
  );
  return res.rows.length > 0;
}

/* ── GET /api/tasks?projectId= ────────────────────────────── */
router.get('/', requireAuth, async (req, res) => {
  try {
    const { projectId } = req.query;
    if (!projectId) return res.status(400).json({ error: 'projectId là bắt buộc.' });

    const member = await isMember(projectId, req.user.id);
    const isAdmin = ['Admin', 'Moderator'].includes(req.user.role);
    if (!member && !isAdmin) return res.status(403).json({ error: 'Bạn không phải thành viên của dự án này.' });

    const result = await pool.query(
      `SELECT t.*, u.full_name AS assignee_name, u.avatar AS assignee_avatar
       FROM tasks t
       LEFT JOIN users u ON u.id = t.assigned_to_id
       WHERE t.project_id = $1
       ORDER BY t.position ASC, t.created_at ASC`,
      [projectId]
    );

    const tasks = await Promise.all(result.rows.map(async (r) => {
      const commentsRes = await pool.query(
        `SELECT tc.*, u.full_name AS author_name, u.avatar AS author_avatar
         FROM task_comments tc
         LEFT JOIN users u ON u.id = tc.author_id
         WHERE tc.task_id = $1
         ORDER BY tc.created_at ASC`,
        [r.id]
      );
      return {
        id: String(r.id),
        projectId: String(r.project_id),
        title: r.title,
        description: r.description,
        priority: r.priority,
        status: r.status,
        assignedTo: r.assigned_to_id ? {
          id: String(r.assigned_to_id),
          fullName: r.assignee_name,
          avatar: r.assignee_avatar,
        } : null,
        dueDate: r.due_date,
        position: r.position,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        comments: commentsRes.rows.map((c) => ({
          id: String(c.id),
          authorId: String(c.author_id),
          authorName: c.author_name,
          authorAvatar: c.author_avatar,
          content: c.content,
          createdAt: c.created_at,
        })),
      };
    }));

    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Không thể tải danh sách task.' });
  }
});

/* ── POST /api/tasks ──────────────────────────────────────── */
router.post('/', requireAuth, async (req, res) => {
  try {
    const { projectId, title, description, priority, status, assignedToId, dueDate } = req.body;
    if (!projectId || !title) return res.status(400).json({ error: 'projectId và tiêu đề task là bắt buộc.' });

    const member = await isMember(projectId, req.user.id);
    if (!member) return res.status(403).json({ error: 'Bạn không phải thành viên của dự án này.' });

    // Get max position in the target status column
    const posRes = await pool.query(
      'SELECT COALESCE(MAX(position),0)+1 AS next_pos FROM tasks WHERE project_id=$1 AND status=$2',
      [projectId, status || 'To Do']
    );

    const result = await pool.query(
      `INSERT INTO tasks (project_id, title, description, priority, status, assigned_to_id, due_date, position)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
      [projectId, title, description || null, priority || 'Medium',
       status || 'To Do', assignedToId || null, dueDate || null, posRes.rows[0].next_pos]
    );

    const task = await pool.query(
      `SELECT t.*, u.full_name AS assignee_name, u.avatar AS assignee_avatar
       FROM tasks t LEFT JOIN users u ON u.id=t.assigned_to_id WHERE t.id=$1`,
      [result.rows[0].id]
    );
    const r = task.rows[0];

    res.status(201).json({
      id: String(r.id), projectId: String(r.project_id), title: r.title,
      description: r.description, priority: r.priority, status: r.status,
      assignedTo: r.assigned_to_id ? { id: String(r.assigned_to_id), fullName: r.assignee_name, avatar: r.assignee_avatar } : null,
      dueDate: r.due_date, position: r.position, createdAt: r.created_at,
      updatedAt: r.updated_at, comments: [],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Tạo task thất bại.' });
  }
});

/* ── PUT /api/tasks/:id ───────────────────────────────────── */
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { title, description, priority, status, assignedToId, dueDate, position } = req.body;

    const existing = await pool.query('SELECT * FROM tasks WHERE id=$1', [req.params.id]);
    if (!existing.rows[0]) return res.status(404).json({ error: 'Không tìm thấy task.' });

    const member = await isMember(existing.rows[0].project_id, req.user.id);
    if (!member) return res.status(403).json({ error: 'Bạn không phải thành viên của dự án này.' });

    const updated = await pool.query(
      `UPDATE tasks SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        priority = COALESCE($3, priority),
        status = COALESCE($4, status),
        assigned_to_id = CASE WHEN $5::text = '__CLEAR__' THEN NULL ELSE COALESCE($5::integer, assigned_to_id) END,
        due_date = COALESCE($6, due_date),
        position = COALESCE($7, position),
        updated_at = NOW()
       WHERE id = $8 RETURNING *`,
      [title, description, priority, status,
       assignedToId === null ? '__CLEAR__' : assignedToId,
       dueDate, position, req.params.id]
    );

    const r = updated.rows[0];
    let assignee = null;
    if (r.assigned_to_id) {
      const u = await pool.query('SELECT full_name, avatar FROM users WHERE id=$1', [r.assigned_to_id]);
      if (u.rows[0]) assignee = { id: String(r.assigned_to_id), fullName: u.rows[0].full_name, avatar: u.rows[0].avatar };
    }

    const commentsRes = await pool.query(
      `SELECT tc.*, u.full_name AS author_name, u.avatar AS author_avatar
       FROM task_comments tc LEFT JOIN users u ON u.id=tc.author_id
       WHERE tc.task_id=$1 ORDER BY tc.created_at ASC`, [r.id]
    );

    res.json({
      id: String(r.id), projectId: String(r.project_id), title: r.title,
      description: r.description, priority: r.priority, status: r.status,
      assignedTo: assignee, dueDate: r.due_date, position: r.position,
      createdAt: r.created_at, updatedAt: r.updated_at,
      comments: commentsRes.rows.map((c) => ({
        id: String(c.id), authorId: String(c.author_id), authorName: c.author_name,
        authorAvatar: c.author_avatar, content: c.content, createdAt: c.created_at,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Cập nhật task thất bại.' });
  }
});

/* ── DELETE /api/tasks/:id ────────────────────────────────── */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const existing = await pool.query('SELECT * FROM tasks WHERE id=$1', [req.params.id]);
    if (!existing.rows[0]) return res.status(404).json({ error: 'Không tìm thấy task.' });

    const member = await isMember(existing.rows[0].project_id, req.user.id);
    if (!member) return res.status(403).json({ error: 'Bạn không phải thành viên của dự án này.' });

    await pool.query('DELETE FROM tasks WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Xóa task thất bại.' });
  }
});

/* ── POST /api/tasks/:id/comments ─────────────────────────── */
router.post('/:id/comments', requireAuth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Nội dung bình luận không được để trống.' });

    const task = await pool.query('SELECT project_id FROM tasks WHERE id=$1', [req.params.id]);
    if (!task.rows[0]) return res.status(404).json({ error: 'Không tìm thấy task.' });

    const member = await isMember(task.rows[0].project_id, req.user.id);
    if (!member) return res.status(403).json({ error: 'Bạn không phải thành viên của dự án này.' });

    const result = await pool.query(
      'INSERT INTO task_comments (task_id, author_id, content) VALUES ($1,$2,$3) RETURNING *',
      [req.params.id, req.user.id, content.trim()]
    );
    const c = result.rows[0];
    res.status(201).json({
      id: String(c.id), authorId: String(c.author_id),
      authorName: req.user.fullName, authorAvatar: null,
      content: c.content, createdAt: c.created_at,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Thêm bình luận thất bại.' });
  }
});

/* ── PUT /api/tasks/reorder ───────────────────────────────── */
// Bulk update positions after drag-and-drop
router.put('/bulk/reorder', requireAuth, async (req, res) => {
  try {
    const { updates } = req.body; // [{ id, status, position }]
    if (!Array.isArray(updates)) return res.status(400).json({ error: 'updates phải là mảng.' });

    for (const upd of updates) {
      await pool.query(
        'UPDATE tasks SET status=$1, position=$2, updated_at=NOW() WHERE id=$3',
        [upd.status, upd.position, upd.id]
      );
    }
    res.json({ success: true, updated: updates.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Reorder thất bại.' });
  }
});

export default router;
