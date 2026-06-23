import { Router } from 'express';
import pool from '../config/db.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = Router();

/* ── GET /api/posts ───────────────────────────────────────── */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { topic, search, pinned } = req.query;
    const uid = req.user?.id;
    const isAdmin = ['Admin', 'Moderator'].includes(req.user?.role);

    let query = `SELECT p.*, u.full_name AS author_name, u.avatar AS author_avatar,
                        u.role AS author_role, u.reputation_score
                 FROM posts p LEFT JOIN users u ON u.id = p.author_id
                 WHERE p.hidden = false`;
    const params = [];

    if (!isAdmin) query += ` AND p.moderation_status = 'Approved'`;
    if (topic && topic !== 'All') { params.push(topic); query += ` AND p.topic = $${params.length}`; }
    if (pinned === 'true') query += ` AND p.pinned = true`;
    if (search) { params.push(`%${search}%`); query += ` AND p.content ILIKE $${params.length}`; }
    query += ` ORDER BY p.pinned DESC, p.created_at DESC LIMIT 100`;

    const result = await pool.query(query, params);

    const posts = await Promise.all(result.rows.map(async (r) => {
      const [likesRes, commentsRes, myLikeRes] = await Promise.all([
        pool.query('SELECT COUNT(*) FROM post_likes WHERE post_id=$1', [r.id]),
        pool.query(
          `SELECT pc.*, u.full_name AS author_name, u.avatar AS author_avatar
           FROM post_comments pc LEFT JOIN users u ON u.id=pc.author_id
           WHERE pc.post_id=$1 ORDER BY pc.created_at ASC`, [r.id]
        ),
        uid ? pool.query('SELECT 1 FROM post_likes WHERE post_id=$1 AND user_id=$2', [r.id, uid]) : { rows: [] },
      ]);

      return {
        id: String(r.id),
        authorId: String(r.author_id),
        authorName: r.author_name,
        authorAvatar: r.author_avatar,
        authorRole: r.author_role,
        content: r.content,
        topic: r.topic,
        pinned: r.pinned,
        locked: r.locked,
        moderationStatus: r.moderation_status,
        createdAt: r.created_at,
        likes: parseInt(likesRes.rows[0].count),
        likedByMe: myLikeRes.rows.length > 0,
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

    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Không thể tải danh sách bài viết.' });
  }
});

/* ── POST /api/posts ──────────────────────────────────────── */
router.post('/', requireAuth, async (req, res) => {
  try {
    const { content, topic } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Nội dung bài viết không được để trống.' });
    if (content.length > 3000) return res.status(400).json({ error: 'Bài viết không được vượt quá 3000 ký tự.' });

    const isAdmin = ['Admin', 'Moderator'].includes(req.user.role);
    const modStatus = isAdmin ? 'Approved' : 'Approved'; // auto-approve for now

    const result = await pool.query(
      `INSERT INTO posts (author_id, content, topic, moderation_status) VALUES ($1,$2,$3,$4) RETURNING id`,
      [req.user.id, content.trim(), topic || 'General', modStatus]
    );

    const post = await pool.query(
      `SELECT p.*, u.full_name AS author_name, u.avatar AS author_avatar, u.role AS author_role
       FROM posts p LEFT JOIN users u ON u.id=p.author_id WHERE p.id=$1`,
      [result.rows[0].id]
    );
    const r = post.rows[0];

    const ip = req.ip || req.headers['x-forwarded-for'] || '0.0.0.0';
    await pool.query(
      'INSERT INTO audit_logs (user_id, user_name, action, module, ip) VALUES ($1,$2,$3,$4,$5)',
      [req.user.id, req.user.full_name, `Created Forum Post`, 'Forum', ip]
    ).catch(() => {});

    res.status(201).json({
      id: String(r.id), authorId: String(r.author_id), authorName: r.author_name,
      authorAvatar: r.author_avatar, authorRole: r.author_role,
      content: r.content, topic: r.topic, pinned: false, locked: false,
      moderationStatus: r.moderation_status, createdAt: r.created_at,
      likes: 0, likedByMe: false, comments: [],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Đăng bài viết thất bại.' });
  }
});

/* ── DELETE /api/posts/:id ────────────────────────────────── */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const post = await pool.query('SELECT author_id FROM posts WHERE id=$1', [req.params.id]);
    if (!post.rows[0]) return res.status(404).json({ error: 'Không tìm thấy bài viết.' });

    const isAdmin = ['Admin', 'Moderator'].includes(req.user.role);
    if (String(post.rows[0].author_id) !== String(req.user.id) && !isAdmin) {
      return res.status(403).json({ error: 'Bạn không có quyền xóa bài viết này.' });
    }
    await pool.query('DELETE FROM posts WHERE id=$1', [req.params.id]);

    const ip = req.ip || req.headers['x-forwarded-for'] || '0.0.0.0';
    await pool.query(
      'INSERT INTO audit_logs (user_id, user_name, action, module, ip) VALUES ($1,$2,$3,$4,$5)',
      [req.user.id, req.user.full_name, `Deleted Post ${req.params.id}`, 'Forum', ip]
    ).catch(() => {});

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Xóa bài viết thất bại.' });
  }
});

/* ── PUT /api/posts/:id/moderate ─────────────────────────── */
router.put('/:id/moderate', requireAuth, async (req, res) => {
  try {
    if (!['Admin', 'Moderator'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Chỉ Admin/Moderator mới có quyền kiểm duyệt.' });
    }
    const { pinned, locked, hidden, moderationStatus } = req.body;
    const updated = await pool.query(
      `UPDATE posts SET
         pinned = COALESCE($1, pinned),
         locked = COALESCE($2, locked),
         hidden = COALESCE($3, hidden),
         moderation_status = COALESCE($4, moderation_status)
       WHERE id=$5 RETURNING id`,
      [pinned, locked, hidden, moderationStatus, req.params.id]
    );
    if (!updated.rows[0]) return res.status(404).json({ error: 'Không tìm thấy bài viết.' });
    res.json({ success: true, id: updated.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kiểm duyệt thất bại.' });
  }
});

/* ── POST /api/posts/:id/like ─────────────────────────────── */
router.post('/:id/like', requireAuth, async (req, res) => {
  try {
    const uid = req.user.id;
    const pid = req.params.id;

    const existing = await pool.query('SELECT 1 FROM post_likes WHERE post_id=$1 AND user_id=$2', [pid, uid]);
    if (existing.rows.length > 0) {
      await pool.query('DELETE FROM post_likes WHERE post_id=$1 AND user_id=$2', [pid, uid]);
    } else {
      await pool.query('INSERT INTO post_likes (post_id, user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [pid, uid]);
    }
    const countRes = await pool.query('SELECT COUNT(*) FROM post_likes WHERE post_id=$1', [pid]);
    res.json({ likes: parseInt(countRes.rows[0].count), likedByMe: existing.rows.length === 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Thao tác like thất bại.' });
  }
});

/* ── POST /api/posts/:id/comments ─────────────────────────── */
router.post('/:id/comments', requireAuth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Nội dung bình luận không được để trống.' });

    const post = await pool.query('SELECT locked FROM posts WHERE id=$1', [req.params.id]);
    if (!post.rows[0]) return res.status(404).json({ error: 'Không tìm thấy bài viết.' });
    if (post.rows[0].locked) return res.status(400).json({ error: 'Bài viết đã bị khóa bình luận.' });

    const result = await pool.query(
      'INSERT INTO post_comments (post_id, author_id, content) VALUES ($1,$2,$3) RETURNING *',
      [req.params.id, req.user.id, content.trim()]
    );
    const c = result.rows[0];

    const ip = req.ip || req.headers['x-forwarded-for'] || '0.0.0.0';
    await pool.query(
      'INSERT INTO audit_logs (user_id, user_name, action, module, ip) VALUES ($1,$2,$3,$4,$5)',
      [req.user.id, req.user.full_name, `Commented on Post ${req.params.id}`, 'Forum', ip]
    ).catch(() => {});

    res.status(201).json({
      id: String(c.id), authorId: String(c.author_id),
      authorName: req.user.fullName, authorAvatar: null,
      content: c.content, createdAt: c.created_at,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Bình luận thất bại.' });
  }
});

/* ── DELETE /api/posts/:id/comments/:cid ─────────────────── */
router.delete('/:id/comments/:cid', requireAuth, async (req, res) => {
  try {
    const comment = await pool.query('SELECT author_id FROM post_comments WHERE id=$1', [req.params.cid]);
    if (!comment.rows[0]) return res.status(404).json({ error: 'Không tìm thấy bình luận.' });

    const isAdmin = ['Admin', 'Moderator'].includes(req.user.role);
    if (String(comment.rows[0].author_id) !== String(req.user.id) && !isAdmin) {
      return res.status(403).json({ error: 'Không có quyền xóa bình luận này.' });
    }
    await pool.query('DELETE FROM post_comments WHERE id=$1', [req.params.cid]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Xóa bình luận thất bại.' });
  }
});

export default router;
