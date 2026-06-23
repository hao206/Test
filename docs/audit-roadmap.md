# CampusForge Architecture Audit & SaaS Roadmap

Ngày audit: 2026-06-18  
Phạm vi thực tế: Vite React SPA, Zustand local stores, Express static server. Chưa có database, ORM, API CRUD thật, upload thật, session server-side hoặc SQL runtime.

## Executive Summary

CampusForge hiện là prototype frontend tốt cho demo đồ án, nhưng chưa phải SaaS production. Các rủi ro lớn nhất là: dữ liệu mock/localStorage, thiếu backend domain layer, thiếu database schema/index, thiếu auth/session thật, thiếu RBAC enforced ở server, thiếu upload validation thật và nhiều chuỗi UI bị lỗi encoding.

Refactor đã thực hiện:

- Tách Express server thành `server/controllers`, `server/services`, `server/routes`, `server/middleware`, `server/models`, `server/validators`, `server/utils`, `server/repositories`.
- Thêm security headers, rate limiting, JSON body limit, cache static assets, `/api/health`.
- Thêm lazy loading route cho frontend.
- Thêm admin store và Admin Suite: dashboard, user/project/mentor/forum/resource/notification/analytics/audit.
- Thêm action admin cho project/post/resource stores.
- Siết admin route chỉ cho `Admin` và `Super Admin`.

## Findings

### 1. Backend chưa có Clean Architecture thật

- Severity: Critical
- File: `server.js`, `server/*`
- Nguyên nhân: trước audit `server.js` chỉ serve static SPA, không có API/domain boundary.
- Giải pháp đã làm: tách entrypoint ra `server/app.js`, thêm `routes/controller/service/middleware`.
- Code mẫu:

```js
app.use(securityHeaders(config));
app.use(rateLimiter(config.rateLimit));
registerHealthRoutes(app);
```

- Hiệu năng ước tính: không trực tiếp giảm latency nghiệp vụ, nhưng giảm 30-50% chi phí bảo trì khi thêm API/domain thật.

### 2. Chưa có database nên không thể kiểm tra N+1/SQL Injection runtime

- Severity: Critical
- File: toàn repo
- Nguyên nhân: dữ liệu nằm trong `src/data.ts` và Zustand persist/localStorage.
- Giải pháp: thêm PostgreSQL/MySQL schema, repository layer và query builder/ORM dùng parameterized queries.
- Code mẫu đề xuất:

```ts
const rows = await db
  .selectFrom('projects')
  .leftJoin('project_members', 'project_members.project_id', 'projects.id')
  .select(['projects.id', 'projects.name'])
  .where('projects.status', '=', status)
  .limit(pageSize)
  .offset((page - 1) * pageSize)
  .execute();
```

- Hiệu năng ước tính: pagination + join preload tránh N+1 có thể giảm 60-95% số query ở dashboard/list page.

### 3. Auth/AuthZ chỉ là mock client-side

- Severity: Critical
- File: `src/store/useAuthStore.ts`, `src/components/AuthModule.tsx`, `src/pages/Admin.tsx`
- Nguyên nhân: role được suy ra từ email, persist localStorage, không có JWT/session server-side.
- Giải pháp đã làm một phần: `Role` union type, admin route chỉ `Admin/Super Admin`.
- Giải pháp còn cần: password hashing Argon2/bcrypt, access token ngắn hạn, refresh token rotation, server RBAC middleware.
- Code mẫu đề xuất:

```ts
router.get('/admin/users', requireAuth, requireRole(['Admin', 'Super Admin']), userController.list);
```

- Hiệu năng ước tính: tác động hiệu năng nhỏ; cải thiện security posture rất lớn.

### 4. Thiếu rate limiting và security headers

- Severity: High
- File: `server/middleware/*`
- Nguyên nhân: Express server mặc định không chặn request burst, thiếu CSP/referrer/frame policy.
- Giải pháp đã làm: thêm rate limiter in-memory, CSP, `X-Frame-Options`, `nosniff`, `Permissions-Policy`.
- Code mẫu:

```js
res.setHeader('Content-Security-Policy', "default-src 'self'; frame-ancestors 'none'");
```

- Hiệu năng ước tính: giảm rủi ro abuse; latency overhead <1ms/request với in-memory limiter.

### 5. Admin System trước đây chỉ là audit mock

- Severity: High
- File: `src/components/AdminSystemAudit.tsx`
- Nguyên nhân: dashboard hard-code, thiếu CRUD/action state.
- Giải pháp đã làm: thay bằng Admin Suite có dashboard, CRUD user, lock/unlock, reset password, role management, project moderation, mentor/resource/forum/notification/analytics/audit pagination.
- Hiệu năng ước tính: không đo backend, nhưng frontend thao tác O(n) trên local arrays; đủ cho prototype dưới vài nghìn item.

### 6. Bundle frontend có nguy cơ phình khi thêm admin/analytics

- Severity: Medium
- File: `src/App.tsx`
- Nguyên nhân: trước đây import eager tất cả pages/modules và chart-heavy components.
- Giải pháp đã làm: `React.lazy` + `Suspense` route skeleton.
- Code mẫu:

```tsx
const AdminPage = lazy(() => import('./pages/Admin'));
<Suspense fallback={<RouteSkeleton />}>...</Suspense>
```

- Hiệu năng ước tính: giảm initial JS transfer/parse khi user không vào admin/resources; kỳ vọng 20-40% cải thiện first route load khi bundle lớn dần.

### 7. UI có lỗi encoding tiếng Việt

- Severity: Medium
- File: `src/App.tsx`, `src/translations.ts`, nhiều component
- Nguyên nhân: file/chuỗi bị mojibake (`Ä`, `ðŸ`, `âœ“`).
- Giải pháp: chuẩn hóa toàn bộ source UTF-8, thay chuỗi lỗi bằng Vietnamese Unicode đúng hoặc tách i18n JSON.
- Code mẫu:

```ts
vi: {
  login: 'Đăng nhập',
  projectHub: 'Cổng Dự Án',
}
```

- Hiệu năng ước tính: không cải thiện response time; cải thiện UX/độ tin cậy hiển thị.

### 8. Validation còn nằm rải rác trong components

- Severity: Medium
- File: `ProjectHubModule.tsx`, `CommunityModule.tsx`, `ResourceMarketplaceMentor.tsx`
- Nguyên nhân: business rules nằm trong event handlers.
- Giải pháp: chuyển validation sang `validators/` hoặc shared frontend validators, backend validate lại bằng Zod/Joi/Valibot.
- Code mẫu đề xuất:

```ts
const createProjectSchema = z.object({
  name: z.string().min(5).max(120),
  deadline: z.coerce.date(),
});
```

- Hiệu năng ước tính: nhỏ; giảm bug và bypass client-side.

### 9. Upload file chưa an toàn

- Severity: High khi có backend upload thật
- File: `ResourceMarketplaceMentor.tsx`
- Nguyên nhân: hiện chỉ nhập title mock, chưa có file validation/storage scanning.
- Giải pháp: validate MIME bằng magic bytes, giới hạn size, virus scan, signed URL object storage, không serve upload cùng domain app nếu chưa sanitize.
- Code mẫu đề xuất:

```ts
if (!allowedMimeTypes.includes(file.detectedMime) || file.size > MAX_UPLOAD_BYTES) {
  throw new BadRequestError('Invalid file upload');
}
```

- Hiệu năng ước tính: upload scan tăng latency nhưng giảm rủi ro critical; dùng async scan queue để giữ API nhanh.

### 10. Pagination/caching mới có một phần

- Severity: Medium
- File: `src/components/AdminSystemAudit.tsx`, `server/middleware/staticCache.js`
- Nguyên nhân: list page hiện map toàn bộ dữ liệu local; backend chưa có list endpoint.
- Giải pháp đã làm: pagination cho audit log, cache immutable static assets.
- Giải pháp tiếp theo: cursor pagination cho forum/resources/projects, Redis cache cho danh mục ít đổi.
- Code mẫu đề xuất:

```sql
CREATE INDEX idx_posts_created_at_id ON forum_posts (created_at DESC, id DESC);
```

- Hiệu năng ước tính: list endpoint lớn có thể giảm P95 từ >800ms xuống 100-250ms khi dùng index + cursor.

## Database Proposal

### Core tables

- `users(id, email, password_hash, role, status, last_active_at, created_at)`
- `projects(id, leader_id, name, description, status, review_status, hidden, featured, deadline, created_at)`
- `project_members(project_id, user_id, role, joined_at)`
- `tasks(id, project_id, assignee_id, title, status, priority, due_date)`
- `forum_posts(id, author_id, topic_id, content, pinned, locked, hidden, created_at)`
- `forum_comments(id, post_id, author_id, content, moderation_status, created_at)`
- `resources(id, owner_id, title, category_id, storage_key, review_status, downloads, created_at)`
- `mentors(id, user_id, bio, rating, review_status)`
- `notifications(id, channel, audience_role, title, message, created_at)`
- `audit_logs(id, actor_id, action, module, ip, created_at, metadata_json)`

### Indexes

```sql
CREATE UNIQUE INDEX users_email_uq ON users(email);
CREATE INDEX projects_status_review_idx ON projects(status, review_status, created_at DESC);
CREATE INDEX project_members_user_idx ON project_members(user_id, project_id);
CREATE INDEX tasks_project_status_idx ON tasks(project_id, status);
CREATE INDEX forum_posts_topic_created_idx ON forum_posts(topic_id, created_at DESC);
CREATE INDEX resources_category_review_idx ON resources(category_id, review_status, created_at DESC);
CREATE INDEX audit_logs_module_created_idx ON audit_logs(module, created_at DESC);
```

### Migration plan

1. Tạo schema auth/RBAC trước.
2. Import mock data từ `src/data.ts` thành seed.
3. Chuyển Zustand stores sang API client layer.
4. Thêm repository/service/controller cho từng bounded context.
5. Thêm migration tool: Prisma, Drizzle, Knex hoặc Sequelize migrations.

## Roadmap 90%+ SaaS

### Phase 1: Stabilize Prototype (1-2 tuần)

- Fix toàn bộ mojibake/i18n.
- Hoàn thiện empty/loading/error/success states.
- Thêm unit test cho stores và validators.
- Tách form validation khỏi component.
- Chuẩn hóa design tokens: colors, typography, spacing.

### Phase 2: Production Backend (3-5 tuần)

- PostgreSQL/MySQL schema + migrations.
- Express/Nest/Fastify API theo controller/service/repository.
- Auth thật: password hash, JWT/refresh rotation hoặc secure sessions.
- RBAC middleware server-side.
- Audit log server-side immutable.
- File upload qua object storage + scanning.

### Phase 3: Performance & Scale (2-3 tuần)

- Cursor pagination cho projects/forum/resources/audit.
- Query preload để tránh N+1.
- Redis cache cho skills/categories/mentor catalog.
- CDN/static cache policy.
- API observability: request id, structured logs, P95 latency dashboard.

### Phase 4: Admin & Governance (2-3 tuần)

- Admin CRUD thật.
- Moderation queues với trạng thái workflow.
- Notification center: in-app + email provider.
- Analytics từ DB/materialized views.
- Export audit CSV và retention policy.

### Phase 5: SaaS Readiness (3-4 tuần)

- Multi-tenant organization/campus model.
- Billing/plan gates nếu thương mại hóa.
- Backups, disaster recovery, rate limit theo tenant.
- Security review: OWASP ASVS, SAST/DAST, dependency scanning.
- CI/CD staging/production + feature flags.

Mức hoàn thiện sau roadmap: 90%+ cho MVP SaaS thực tế nếu có backend/database thật, test coverage và deployment pipeline.
