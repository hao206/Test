-- ============================================================
-- CampusForge — Full Database Schema
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id               SERIAL PRIMARY KEY,
  email            VARCHAR(255) UNIQUE NOT NULL,
  password_hash    VARCHAR(255) NOT NULL,
  full_name        VARCHAR(100) NOT NULL,
  student_id       VARCHAR(50)  UNIQUE NOT NULL,
  role             VARCHAR(30)  NOT NULL DEFAULT 'Student',
  avatar           TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  cover_photo      TEXT DEFAULT 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80',
  faculty          VARCHAR(100),
  major            VARCHAR(100),
  academic_year    VARCHAR(50),
  biography        TEXT,
  career_goals     TEXT,
  reputation_score INTEGER DEFAULT 0,
  github           VARCHAR(255),
  linkedin         VARCHAR(255),
  locked           BOOLEAN DEFAULT FALSE,
  last_active_at   TIMESTAMP DEFAULT NOW(),
  created_at       TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_skills (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_name  VARCHAR(100) NOT NULL,
  skill_level INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS user_interests (
  id       SERIAL PRIMARY KEY,
  user_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  interest VARCHAR(100) NOT NULL
);

-- ======================== PROJECTS ========================

CREATE TABLE IF NOT EXISTS projects (
  id               SERIAL PRIMARY KEY,
  name             VARCHAR(255) NOT NULL,
  description      TEXT,
  category         VARCHAR(100),
  required_skills  TEXT[]   DEFAULT '{}',
  deadline         DATE,
  team_size        INTEGER  DEFAULT 4,
  progress         INTEGER  DEFAULT 0,
  status           VARCHAR(30) DEFAULT 'Recruiting',
  leader_id        INTEGER  REFERENCES users(id) ON DELETE SET NULL,
  review_status    VARCHAR(20) DEFAULT 'Pending',
  hidden           BOOLEAN DEFAULT FALSE,
  featured         BOOLEAN DEFAULT FALSE,
  team_finalized   BOOLEAN DEFAULT FALSE,
  created_at       TIMESTAMP DEFAULT NOW()
);

-- Applications: sinh viên xin gia nhập dự án
CREATE TABLE IF NOT EXISTS applications (
  id            SERIAL PRIMARY KEY,
  project_id    INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  applicant_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  remark        TEXT,
  status        VARCHAR(20) NOT NULL DEFAULT 'Pending',
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW(),
  UNIQUE(project_id, applicant_id)
);

-- Team members (approved + finalized)
CREATE TABLE IF NOT EXISTS team_members (
  id           SERIAL PRIMARY KEY,
  project_id   INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_in_team VARCHAR(100) DEFAULT 'Member',
  joined_at    TIMESTAMP DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- ======================== TASKS (Kanban) ========================

CREATE TABLE IF NOT EXISTS tasks (
  id             SERIAL PRIMARY KEY,
  project_id     INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title          VARCHAR(255) NOT NULL,
  description    TEXT,
  priority       VARCHAR(20) DEFAULT 'Medium',
  status         VARCHAR(30) DEFAULT 'Backlog',
  assigned_to_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  due_date       DATE,
  position       INTEGER DEFAULT 0,
  created_at     TIMESTAMP DEFAULT NOW(),
  updated_at     TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS task_comments (
  id         SERIAL PRIMARY KEY,
  task_id    INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  author_id  INTEGER REFERENCES users(id) ON DELETE SET NULL,
  content    TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ======================== COMMUNITY POSTS ========================

CREATE TABLE IF NOT EXISTS posts (
  id                  SERIAL PRIMARY KEY,
  author_id           INTEGER REFERENCES users(id) ON DELETE SET NULL,
  content             TEXT NOT NULL,
  topic               VARCHAR(100) DEFAULT 'General',
  images              JSONB DEFAULT '[]',
  pinned              BOOLEAN DEFAULT FALSE,
  locked              BOOLEAN DEFAULT FALSE,
  hidden              BOOLEAN DEFAULT FALSE,
  moderation_status   VARCHAR(20) DEFAULT 'Approved',
  created_at          TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS post_likes (
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY(post_id, user_id)
);

CREATE TABLE IF NOT EXISTS post_comments (
  id         SERIAL PRIMARY KEY,
  post_id    INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id  INTEGER REFERENCES users(id) ON DELETE SET NULL,
  content    TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ======================== NOTIFICATIONS ========================

CREATE TABLE IF NOT EXISTS notifications (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title      VARCHAR(255),
  message    TEXT,
  type       VARCHAR(20) DEFAULT 'info',
  read       BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ======================== AUDIT LOGS ========================

CREATE TABLE IF NOT EXISTS audit_logs (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
  user_name  VARCHAR(100),
  action     TEXT,
  module     VARCHAR(100),
  ip         VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ======================== INDEXES ========================

CREATE INDEX IF NOT EXISTS idx_applications_project ON applications(project_id);
CREATE INDEX IF NOT EXISTS idx_applications_applicant ON applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_team_members_project ON team_members(project_id);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read);

-- Migration commands (safe to run multiple times)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]';
