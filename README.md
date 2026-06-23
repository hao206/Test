# CampusForge — Môi Trường Cộng Tác Số Thống Nhất

Full-stack: **React 19 + TypeScript + Vite + Tailwind** (frontend) / **Node.js + Express + PostgreSQL** (backend)

## Tài khoản mặc định (sau seed)

| Email | Password | Role |
|-------|----------|------|
| admin@campusforge.edu | Admin12345 | Admin |
| mod@campusforge.edu | Mod12345 | Moderator |
| student@campusforge.edu | Student123 | Student |
| leader@campusforge.edu | Leader123 | Student (Leader) |

## Deploy Render (A-Z)

### 1. Push code lên GitHub

```bash
git init && git add . && git commit -m "CampusForge v1.0"
git branch -M main
git remote add origin https://github.com/TEN-ACCOUNT/campusforge.git
git push -u origin main
```

### 2. Tạo PostgreSQL Database

Render Dashboard → **New+** → **PostgreSQL** → đặt tên, Region **Singapore**, Plan **Free** → **Create** → copy **Internal Database URL**

### 3. Tạo Web Service

New+ → Web Service → chọn repo → cấu hình:

| Field | Value |
|-------|-------|
| Runtime | Node |
| Build Command | `npm install && npm run build` |
| Start Command | `npm start` |

Environment Variables:

| Key | Value |
|-----|-------|
| DATABASE_URL | *(Internal Database URL)* |
| JWT_SECRET | *(chuỗi bí mật bất kỳ)* |
| NODE_ENV | production |

### 4. Seed Database (1 lần duy nhất)

Render → Web Service → **Shell**:
```bash
npm run seed
```

---

## Chạy Local

```bash
npm install
cp .env.example .env   # Sửa DATABASE_URL
npm run seed
npm run build
npm start              # → http://localhost:4000
```

## Tính năng

- **Project Hub**: Tạo dự án → Admin duyệt → Apply → Leader approve/reject → **Chốt nhóm → Kanban tự động mở**
- **TeamFlow (Kanban)**: Backlog/To Do/Doing/Review/Done, drag-drop, task comments
- **Community**: Forum posts, like, comment, topics
- **Admin**: Quản lý user, duyệt dự án, audit logs, stats
- **Smart Matching**: Tự tính % kỹ năng phù hợp giữa ứng viên & dự án
