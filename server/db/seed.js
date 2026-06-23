/**
 * CampusForge — Seed Script
 * Run: npm run seed
 * Creates all tables and seeds default accounts + sample data.
 */

import 'dotenv/config';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const isRender = process.env.DATABASE_URL && process.env.DATABASE_URL.includes('render.com');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: (isRender || process.env.NODE_ENV === 'production')
    ? { rejectUnauthorized: false }
    : false,
});

async function seed() {
  try {
    console.log('🔨 Running schema...');
    const schema = readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(schema);
    console.log('✔ Tables ready');

    // ── Default Accounts ──────────────────────────────────────────────────────
    const accounts = [
      { email: 'admin@campusforge.edu', password: 'Admin12345', fullName: 'Campus Admin', studentId: 'ADMIN001', role: 'Admin', faculty: 'Administration', major: 'System Management' },
      { email: 'mod@campusforge.edu',   password: 'Mod12345',   fullName: 'Forum Moderator', studentId: 'MOD001', role: 'Moderator', faculty: 'Computer Science', major: 'Information Systems' },
      { email: 'student@campusforge.edu', password: 'Student123', fullName: 'Alex Nguyen', studentId: '73DCTT20042', role: 'Student', faculty: 'Computer Engineering', major: 'Software Development' },
      { email: 'leader@campusforge.edu',  password: 'Leader123',  fullName: 'Linh Dang',    studentId: '73DCTT20099', role: 'Student', faculty: 'Computer Engineering', major: 'Backend Engineering' },
    ];

    const userIds = {};
    for (const acc of accounts) {
      const exists = await pool.query('SELECT id FROM users WHERE email = $1', [acc.email]);
      if (exists.rows.length > 0) {
        userIds[acc.email] = exists.rows[0].id;
        console.log(`- ${acc.email} already exists`);
        continue;
      }
      const hash = await bcrypt.hash(acc.password, 10);
      const res = await pool.query(
        `INSERT INTO users (email, password_hash, full_name, student_id, role, faculty, major,
                            academic_year, biography, career_goals, reputation_score)
         VALUES ($1,$2,$3,$4,$5,$6,$7,'Senior','Passionate about building collaborative tools.','Lead Solutions Architect',2840)
         RETURNING id`,
        [acc.email, hash, acc.fullName, acc.studentId, acc.role, acc.faculty, acc.major]
      );
      userIds[acc.email] = res.rows[0].id;

      // Add default skills for students
      if (acc.role === 'Student') {
        const skills = [['React', 4], ['NodeJS', 3], ['TypeScript', 3], ['PostgreSQL', 2], ['UI/UX', 3]];
        for (const [name, level] of skills) {
          await pool.query(
            'INSERT INTO user_skills (user_id, skill_name, skill_level) VALUES ($1,$2,$3)',
            [res.rows[0].id, name, level]
          );
        }
        await pool.query(
          "INSERT INTO user_interests (user_id, interest) VALUES ($1,'Academic Hackathons'),($1,'Database Scaling'),($1,'UI Refinements')",
          [res.rows[0].id]
        );
      }
      console.log(`✔ Created ${acc.email} (${acc.role})`);
    }

    // ── Sample Projects ────────────────────────────────────────────────────────
    const projectCount = await pool.query('SELECT COUNT(*) FROM projects');
    if (Number(projectCount.rows[0].count) === 0) {
      const leaderId = userIds['leader@campusforge.edu'];
      const studentId = userIds['student@campusforge.edu'];

      const proj1 = await pool.query(
        `INSERT INTO projects (name, description, category, required_skills, deadline, team_size,
                               progress, status, leader_id, review_status, featured)
         VALUES ($1,$2,$3,$4,$5,4,75,'Active',$6,'Approved',true) RETURNING id`,
        [
          'UTT Course Planner & Scheduler',
          'An AI-powered automated scheduling platform that helps UTT students generate optimized semester planners.',
          'Web Application',
          ['React', 'NodeJS', 'PostgreSQL', 'TypeScript'],
          '2026-08-30',
          leaderId,
        ]
      );

      const proj2 = await pool.query(
        `INSERT INTO projects (name, description, category, required_skills, deadline, team_size,
                               progress, status, leader_id, review_status)
         VALUES ($1,$2,$3,$4,$5,5,20,'Recruiting',$6,'Approved') RETURNING id`,
        [
          'Smart Campus IoT Parking System',
          'Real-time parking space tracking using ultrasonic sensors integrated with an Express gateway.',
          'IoT & Hardware',
          ['Python', 'C++', 'NodeJS', 'React Native'],
          '2026-10-15',
          studentId,
        ]
      );

      const p1 = proj1.rows[0].id;
      const p2 = proj2.rows[0].id;

      // Team members for project 1 (already finalized)
      await pool.query('UPDATE projects SET team_finalized = true WHERE id = $1', [p1]);
      await pool.query(
        'INSERT INTO team_members (project_id, user_id, role_in_team) VALUES ($1,$2,$3),($1,$4,$5) ON CONFLICT DO NOTHING',
        [p1, leaderId, 'Project Leader', studentId, 'Frontend Developer']
      );

      // Sample tasks for project 1
      const taskData = [
        ['Secure JWT Authentication', 'Implement role-based access tokens on the Express server.', 'High', 'Doing', leaderId, '2026-07-01'],
        ['ER Diagram & Relational Schemas', 'Sync physical index constraints on project_members table.', 'Medium', 'To Do', studentId, '2026-07-10'],
        ['Dashboard UI Components', 'Build reusable chart components with Recharts library.', 'Medium', 'Done', studentId, '2026-06-25'],
        ['API Rate Limiting', 'Configure rate limiter middleware for all public endpoints.', 'Low', 'Backlog', null, '2026-07-20'],
      ];
      for (const [title, desc, priority, status, assignee, due] of taskData) {
        await pool.query(
          `INSERT INTO tasks (project_id, title, description, priority, status, assigned_to_id, due_date)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [p1, title, desc, priority, status, assignee, due]
        );
      }

      // Sample application for project 2
      await pool.query(
        `INSERT INTO applications (project_id, applicant_id, remark, status)
         VALUES ($1,$2,'I have experience with React Native and IoT projects. Very excited to join!','Pending')
         ON CONFLICT DO NOTHING`,
        [p2, leaderId]
      );

      // Sample community posts
      const posts = [
        ['Looking for teammates to build a fintech startup app this semester. Need 2 frontend devs.', 'Project', leaderId],
        ['Great resource for learning PostgreSQL performance tuning — check out the pgTune tool.', 'Technology', studentId],
      ];
      for (const [content, topic, authorId] of posts) {
        await pool.query(
          'INSERT INTO posts (author_id, content, topic, moderation_status) VALUES ($1,$2,$3,\'Approved\')',
          [authorId, content, topic]
        );
      }

      console.log('✔ Sample projects, tasks, posts seeded');
    } else {
      console.log('- Data already exists, skipping sample data');
    }

    console.log('\n🎉 Seed complete!');
    console.log('──────────────────────────────────────────');
    console.log(' admin@campusforge.edu     / Admin12345');
    console.log(' mod@campusforge.edu       / Mod12345');
    console.log(' student@campusforge.edu   / Student123');
    console.log(' leader@campusforge.edu    / Leader123');
    console.log('──────────────────────────────────────────');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
