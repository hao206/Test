export interface Translations {
  appName: string;
  tagline: string;
  login: string;
  logout: string;
  register: string;
  forgotPassword: string;
  resetPassword: string;
  rememberMe: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
  fullnamePlaceholder: string;
  studentIdPlaceholder: string;
  emailValidationMsg: string;
  dashboard: string;
  projectHub: string;
  teamFlow: string;
  community: string;
  resourceCenter: string;
  skillExchange: string;
  mentorConnect: string;
  resourceSearchPlaceholder: string;
  allResourcesLabel: string;
  directConnectBtn: string;
  searchSkillsPlaceholder: string;
  sendExchangeInvite: string;
  mentorAskTitle: string;
  cancelButton: string;
  submitInquiryBtn: string;
  securityShieldLabel: string;
  achievements: string;
  adminPanel: string;
  settings: string;
  auditLogs: string;
  sprintActive: string;
  openKanban: string;
  yourTasks: string;
  viewAll: string;
  topMatches: string;
  reputation: string;
  upgradeProfile: string;
  createProject: string;
  searchPlaceholder: string;
  projects: string;
  tasks: string;
  posts: string;
  resources: string;
  totalUsers: string;
  activeUsers: string;
  growth: string;
  moderationHeader: string;
  statusPen: string;
  statusApp: string;
  statusRej: string;
  vietnamese: string;
  english: string;

  // New localized categories and sidebar keys
  categoryMainMenu: string;
  categoryResources: string;
  categoryPersonalization: string;
  categoryGovernance: string;
  myReputation: string;
  xpGoalLabel: string;
  academicNotifications: string;
  dismiss: string;
  sessionAuthenticated: string;
  encryptionType: string;
  dbSchema: string;
  rolePermissionLevel: string;
  guestModeBannerTitle: string;
  guestModeBannerDesc: string;
  guestModeLoginBtn: string;
  studentDashboardTitle: string;
  welcomeFrameworkDesc: string;
  activeStudentsContributing: string;
  emptyTaskChecklist: string;
  graduationSkills: string;
  xpProgressTree: string;
  badgeIndexTitle: string;
  badgeIndexDesc: string;
  activeBadgeRank: string;
  nextBadgeThreshold: string;
  medalsCatalogTitle: string;
  topRankingsTitle: string;
  personalizationTitle: string;
  personalizationDesc: string;
  themeAccentSelection: string;
  academicsMetadataEditor: string;
  majorDegreeFocus: string;
  profileAvatarLabel: string;
  miniBioLabel: string;
  terminateSession: string;
  loginToEditBtn: string;

  // Modals / Guest Interceptions
  guestReqTitle: string;
  guestReqDesc: string;
  restrictedActionLabel: string;
  guestDescRestricted: string;
  backToGuestBtn: string;

  // Project Hub labels
  phSubTitle: string;
  phTopMatches: string;
  phMatchScore: string;
  createProjModalTitle: string;
  projNameLabel: string;
  projDescLabel: string;
  projCatLabel: string;
  projSkillsLabel: string;
  projDeadlineLabel: string;
  projTeamSizeLabel: string;
  applyModalTitle: string;
  applyRemarkLabel: string;
  btnCancel: string;
  btnSubmit: string;
  btnApplying: string;
  btnDone: string;
  btnApply: string;

  // Teamflow labels
  tfSubTitle: string;
  tfBurnLabel: string;
  tfBurnDesc: string;
  categoryTitle: string;
  addTaskModalTitle: string;
  taskTitleLabel: string;
  taskDescLabel: string;
  taskPriorityLabel: string;
  taskAssignedLabel: string;
  taskDueDateLabel: string;
  btnAddTask: string;

  // Community labels
  topicLabel: string;
  publishBtn: string;
  toxicAlert: string;
  writePostPlaceholder: string;
  commentPlaceholder: string;
  presetImagesLabel: string;

  // Resource & Exchange titles
  rcSubTitle: string;
  uploadResTitle: string;
  uploadResBtn: string;
  resTitleLabel: string;
  resCatLabel: string;
  skillsOffersTitle: string;
  matchEngineBtn: string;
  matchingSuccess: string;
  noMatchedOffer: string;
  mentorsSubTitle: string;
  askMentorModalTitle: string;
  askQuestionBtn: string;
  registeredUsersText: string;
  activeInitiativesText: string;
  tasksAssignedText: string;
  downloadsRecordedText: string;
  totalProjectsEnrolled: string;
  activeSprintTasks: string;
  sharedLearningAssets: string;
  universityEngagementTitle: string;
  universityEngagementDesc: string;
  activePeaksText: string;
  activityIndexText: string;
  topDepartmentLabel: string;
  highestSkillDemandLabel: string;
  terminalLogsTitle: string;
  enableAutoscrollText: string;
  userRoleStudent: string;
  userRoleGuest: string;

  // Auth additions
  guestModeBtn: string;
  needTeamEnv: string;
  joinPortal: string;
  alreadyPart: string;
  accessSession: string;
  emailRequired: string;
  passwordLength: string;
  passwordPolicy: string;
  invalidCredentials: string;
  emailAlreadyRegistered: string;
  registrationSuccess: string;
  fillAllFields: string;
  challengeLaunched: string;
  enterEmailRecovery: string;
  recoveryDispatched: string;
  secBlockMsg: string;
}

export const translations: Record<'en' | 'vi', Translations> = {
  en: {
    appName: "CampusForge",
    tagline: "Build Together • Learn Together • Grow Together",
    login: "Log In",
    logout: "Log Out",
    register: "Register",
    forgotPassword: "Forgot Password?",
    resetPassword: "Reset Password",
    rememberMe: "Remember Me",
    emailPlaceholder: "University email (any valid email)",
    passwordPlaceholder: "Password",
    fullnamePlaceholder: "Full Name",
    studentIdPlaceholder: "Student ID (e.g., 73DCTT...)",
    emailValidationMsg: "Please enter a valid email address.",
    passwordPolicy: "Password must be at least 8 characters, with uppercase, lowercase, and a number.",
    invalidCredentials: "Email or password is incorrect.",
    emailAlreadyRegistered: "This email is already registered.",
    registrationSuccess: "Registration complete. You are now logged in.",
    dashboard: "Dashboard",
    projectHub: "Project Hub",
    teamFlow: "TeamFlow Pro",
    community: "Community",
    resourceCenter: "Resource Center",
    skillExchange: "Skill Exchange",
    mentorConnect: "Mentor Connect",
    resourceSearchPlaceholder: "Filter files...",
    allResourcesLabel: "All Classes",
    directConnectBtn: "Direct Connect Messenger",
    searchSkillsPlaceholder: "Search by skills prefix...",
    sendExchangeInvite: "Send Exchange Invite",
    mentorAskTitle: "Ask Professor",
    cancelButton: "Cancel",
    submitInquiryBtn: "Submit Inquiry",
    securityShieldLabel: "Automated Security Shield Active",
    achievements: "Leaderboard & Badges",
    adminPanel: "Admin Suite",
    settings: "Personalization",
    auditLogs: "Audit Trails",
    sprintActive: "Sprint 04 ACTIVE",
    openKanban: "OPEN KANBAN",
    yourTasks: "Your Active Board Tasks",
    viewAll: "View All",
    topMatches: "Top Skill Matches",
    reputation: "Reputation Points",
    upgradeProfile: "Edit Profile Info",
    createProject: "Create Project",
    searchPlaceholder: "Search projects, skills, or mentors...",
    projects: "Projects",
    tasks: "Tasks",
    posts: "Posts",
    resources: "Resources",
    totalUsers: "Total Users Enrolled",
    activeUsers: "Daily Active Students",
    growth: "Engagement Growth",
    moderationHeader: "Content Moderation Queue",
    statusPen: "Pending",
    statusApp: "Approved",
    statusRej: "Rejected",
    vietnamese: "Vietnamese",
    english: "English",

    // English additions
    categoryMainMenu: "Main Menu",
    categoryResources: "Resources",
    categoryPersonalization: "Personalization",
    categoryGovernance: "Governance",
    myReputation: "My Reputation",
    xpGoalLabel: "Goal",
    academicNotifications: "Academic Notifications (3)",
    dismiss: "Dismiss",
    sessionAuthenticated: "Session Authenticated: YES",
    encryptionType: "Encryption Type: Advanced Tokenized SHA Hashed (Simulated)",
    dbSchema: "Relational Database schema: MySQL on XAMPP (Local Target)",
    rolePermissionLevel: "Role Permission Level",
    guestModeBannerTitle: "You are browsing in Guest Mode",
    guestModeBannerDesc: "You can view public academic initiatives, explore general community threads, search info and download documents freely. Register or Sign In to register new projects, submit comments, apply to project teams or assign team tasks.",
    guestModeLoginBtn: "🔐 MEMBER SIGN IN",
    loginToEditBtn: "Login to Edit",
    studentDashboardTitle: "Student Dashboard",
    welcomeFrameworkDesc: "Welcome to CampusForge portal framework. Currently contributing towards Module 17: Security Systems & JWT Auth parameter validations.",
    activeStudentsContributing: "active students currently contributing",
    emptyTaskChecklist: "Checked off active board. Good job!",
    graduationSkills: "My Graduation Mastered Skills",
    xpProgressTree: "XP PROGRESS TREE",
    badgeIndexTitle: "CampusForge Badging Index",
    badgeIndexDesc: "Accumulate XP points by contributing code, downloading resources, commenting, or passing milestones.",
    activeBadgeRank: "Active Badge Rank",
    nextBadgeThreshold: "Next Badge Threshold",
    medalsCatalogTitle: "Academic Prestige Medals Catalog",
    topRankingsTitle: "Top Contributor Rankings",
    personalizationTitle: "Student Personalization",
    personalizationDesc: "Tailor visual aesthetics metrics, branding elements, cover images, and role-based permissions.",
    themeAccentSelection: "Workspace Theme Accent Selection",
    academicsMetadataEditor: "Academics Metadata Profile Editor",
    majorDegreeFocus: "Major Degree Focus",
    profileAvatarLabel: "Profile Avatar Link (Unsplash URL)",
    miniBioLabel: "Mini Student Biography",
    terminateSession: "Terminate Active Session",

    // Modals / Guest Interceptions
    guestReqTitle: "Membership Required",
    guestReqDesc: "You are accessing the CampusForge system in Guest Mode.",
    restrictedActionLabel: "Restricted Action:",
    guestDescRestricted: "Guest mode only allows searches, browsing, and educational resource downloads. Please log in with a student or administrator account to perform active group or posting operations.",
    backToGuestBtn: "Return to browsing (Guest)",

    // Project hub labels
    phSubTitle: "Discover academic initiatives, browse open positions, filter specialized requirements, or pair automatically with projects matching your skill sets.",
    phTopMatches: "Top Relational Matches for Your Profile",
    phMatchScore: "Skill Match",
    createProjModalTitle: "Register New Project Initiative",
    projNameLabel: "Official Project Name",
    projDescLabel: "Consolidated Descriptive Objectives",
    projCatLabel: "Core Engineering Field",
    projSkillsLabel: "Required Skills (comma separated)",
    projDeadlineLabel: "Target Accomplishment Date",
    projTeamSizeLabel: "Maximum Recruits Limit",
    applyModalTitle: "Submit Entrance Application",
    applyRemarkLabel: "Introduction & Commitment Remark",
    btnCancel: "Cancel",
    btnSubmit: "Submit",
    btnApplying: "Applying...",
    btnDone: "Applied ✓",
    btnApply: "Apply to Join Team",

    // Teamflow labels
    tfSubTitle: "Plan sprints, move Kanban nodes, trigger velocity counters, and organize peer assignments iteratively.",
    tfBurnLabel: "Sprint Burn Down Metric",
    tfBurnDesc: "Reflects the ratio of tasks successfully advanced to Done against backlog volumes.",
    categoryTitle: "Assigned Project Workspace",
    addTaskModalTitle: "Dispatch New Task Card",
    taskTitleLabel: "Task Operational Title",
    taskDescLabel: "Detailed Execution Guidelines",
    taskPriorityLabel: "Task Execution Priority Level",
    taskAssignedLabel: "Assigned Student Peer",
    taskDueDateLabel: "Target Due Date Limit",
    btnAddTask: "Create Task",

    // Community labels
    topicLabel: "Operational Forum Category Focus",
    publishBtn: "Publish Post",
    toxicAlert: "Security block: Submission failed. Content contains banned keyword protocols.",
    writePostPlaceholder: "Contribute knowledge, share feedback or broadcast ideas...",
    commentPlaceholder: "Contribute constructive feedback...",
    presetImagesLabel: "Attach Aesthetic Cover Preset",

    // Resource & Exchange
    rcSubTitle: "Exchange notes, borrow templates, or ask professional advisors academic questions.",
    uploadResTitle: "Contribute Shared Asset",
    uploadResBtn: "Upload Resource",
    resTitleLabel: "Asset Document Title",
    resCatLabel: "Asset Scope Type Category",
    skillsOffersTitle: "Available Exchange Offers",
    matchEngineBtn: "Run Skill Match Router",
    matchingSuccess: "Routing successful! Connected with matching peer:",
    noMatchedOffer: "No exact skill pairings logged. Try uploading more skills in settings!",
    mentorsSubTitle: "Connect with dedicated faculty members and verified student mentors.",
    askMentorModalTitle: "Transmit Question to Faculty Advisor",
    askQuestionBtn: "Ask Academic Advisor",
    registeredUsersText: "Peers Enrolled",
    activeInitiativesText: "Active Initiatives",
    tasksAssignedText: "Tasks Assigned",
    downloadsRecordedText: "downloads recorded",
    totalProjectsEnrolled: "Projects Enrolled",
    activeSprintTasks: "Sprint Tasks",
    sharedLearningAssets: "Shared Learning Assets",
    universityEngagementTitle: "University Engagement Vectors",
    universityEngagementDesc: "Dynamic enrollment velocity trends tracking registered users across departments.",
    activePeaksText: "Active Peaks (Max 250)",
    activityIndexText: "Activity Index",
    topDepartmentLabel: "Top Department",
    highestSkillDemandLabel: "Highest Skill Demand",
    terminalLogsTitle: "Real-time Audited Activity Logs (Admin)",
    enableAutoscrollText: "Lock Terminal Feed Stream",
    userRoleStudent: "Student",
    userRoleGuest: "Guest",

    // Auth additions
    guestModeBtn: "🔍 Explore as Guest (Guest Mode)",
    needTeamEnv: "Need a student team environment?",
    joinPortal: "Join CampusForge Portal",
    alreadyPart: "Already part of CampusForge?",
    accessSession: "Access Academic Session",
    emailRequired: "Email field cannot be empty.",
    passwordLength: "Password must satisfy security protocols (minimum 6 characters length).",
    fillAllFields: "Please complete all form fields.",
    challengeLaunched: "Verification email challenge launched! Please check inbox to verify identity.",
    enterEmailRecovery: "Please input registered university email address to initialize password reset.",
    recoveryDispatched: "Secure password reset token dispatched successfully to your email.",
    secBlockMsg: "Security block: Submission blocked."
  },
  vi: {
    appName: "CampusForge",
    tagline: "Đồng Hành Kiến Tạo • Cùng Nhau Phát Triển",
    login: "Đăng Nhập",
    logout: "Đăng Xuất",
    register: "Đăng Ký",
    forgotPassword: "Quên mật khẩu?",
    resetPassword: "Đặt lại mật khẩu",
    rememberMe: "Ghi nhớ đăng nhập",
    emailPlaceholder: "Email trường (bất kỳ email hợp lệ)",
    passwordPlaceholder: "Mật khẩu bảo mật",
    fullnamePlaceholder: "Họ và tên thí sinh",
    studentIdPlaceholder: "Mã số sinh viên (Vd: 73DCTT...)",
    emailValidationMsg: "Vui lòng nhập địa chỉ email hợp lệ.",
    passwordPolicy: "Mật khẩu cần ít nhất 8 ký tự, gồm chữ hoa, chữ thường và số.",
    invalidCredentials: "Email hoặc mật khẩu không chính xác.",
    emailAlreadyRegistered: "Email này đã được đăng ký.",
    registrationSuccess: "Đăng ký thành công. Bạn đã được đăng nhập.",
    dashboard: "Trang Tổng Quan",
    projectHub: "Cổng Dự Án",
    teamFlow: "Quy Trình Nhóm",
    community: "Cộng Đồng",
    resourceCenter: "Thư Viện Tài Nguyên",
    skillExchange: "Chợ Trao Đổi Kỹ Năng",
    mentorConnect: "Kết Nối Cố Vấn",
    resourceSearchPlaceholder: "Tìm tài liệu học tập...",
    allResourcesLabel: "Tất cả tài liệu",
    directConnectBtn: "Gửi kết nối trực tiếp",
    searchSkillsPlaceholder: "Tìm kiếm kỹ năng...",
    sendExchangeInvite: "Gửi lời mời trao đổi",
    mentorAskTitle: "Hỏi Giảng Viên",
    cancelButton: "Hủy Bỏ",
    submitInquiryBtn: "Gửi yêu cầu",
    securityShieldLabel: "Bộ bảo vệ an ninh hoạt động",
    achievements: "Xếp Hạng & Huy Chương",
    adminPanel: "Bảng Quản Trị",
    settings: "Cơ Bản & Giao Diện",
    auditLogs: "Nhật Ký Hệ Thống",
    sprintActive: "Giai Đoạn Sprint 04",
    openKanban: "MỞ BẢNG KANBAN",
    yourTasks: "Công Việc Kế Hoạch Của Bạn",
    viewAll: "Xem tất cả",
    topMatches: "Gợi Ý Ghép Cặp Phù Hợp",
    reputation: "Điểm Uy Tín Học Tập",
    upgradeProfile: "Cập nhật Hồ Sơ",
    createProject: "Đăng Ký Đề Tài Mới",
    searchPlaceholder: "Tìm đề tài, kỹ năng, cố vấn học tập...",
    projects: "Dự Án",
    tasks: "Nhiệm Vụ",
    posts: "Bài Đăng",
    resources: "Tài Nguyên",
    totalUsers: "Tổng Số Sinh Viên",
    activeUsers: "Hoạt Động Hàng Ngày",
    growth: "Tăng Trưởng Tương Tác",
    moderationHeader: "Kiểm Duyệt Nội Dung",
    statusPen: "Chờ Duyệt",
    statusApp: "Đã Duyệt",
    statusRej: "Đã Từ Chối",
    vietnamese: "Tiếng Việt",
    english: "Tiếng Anh",

    // Vietnamese additions
    categoryMainMenu: "Menu Chính",
    categoryResources: "Tài nguyên & Cố Vấn",
    categoryPersonalization: "Cá nhân hóa",
    categoryGovernance: "Bảng Quản Trị",
    myReputation: "Uy Tín Học Tập",
    xpGoalLabel: "Mục tiêu",
    academicNotifications: "Thông báo học thuật (3)",
    dismiss: "Bỏ qua",
    sessionAuthenticated: "Xác thực phiên làm việc: THÀNH CÔNG",
    encryptionType: "Mã hóa bảo mật: Thuật toán nâng cao SHA Hashed (Mô phỏng)",
    dbSchema: "Sơ đồ cơ sở dữ liệu: MySQL trên XAMPP (Cục bộ)",
    rolePermissionLevel: "Cấp Quyền Vai Trò",
    guestModeBannerTitle: "Bạn đang duyệt ở chế độ Khách (Guest Browser Mode)",
    guestModeBannerDesc: "Bạn có thể tự do xem danh sách đề tài khoa học công khai, tìm kiếm thông tin, theo dõi thảo luận cộng đồng và tải tài liệu học tập. Đăng nhập tài khoản để đăng ký đề tài mới, viết bình luận, gia nhập đội nhóm hoặc phân công công việc hành trình.",
    guestModeLoginBtn: "🔐 ĐĂNG NHẬP THÀNH VIÊN",
    studentDashboardTitle: "Trang Sinh Viên",
    welcomeFrameworkDesc: "Chào mừng bạn đến với hệ thống CampusForge. Đang tham gia đóng góp cho học phần Module 17: Hệ thống bảo mật & Xác thực token JWT.",
    activeStudentsContributing: "sinh viên đang tích cực đóng góp xây dựng",
    emptyTaskChecklist: "Đã hoàn thành mọi công việc trên bảng Kanban. Tuyệt vời!",
    graduationSkills: "Hồ sơ năng lực tốt nghiệp",
    xpProgressTree: "CÂY TIẾN TRÌNH XP",
    badgeIndexTitle: "Bộ Huy Chương CampusForge",
    badgeIndexDesc: "Tích lũy điểm XP bằng công việc đóng góp code, chia sẻ tài liệu học tập, viết thảo luận hoặc hoàn thành mốc công việc đề ra.",
    activeBadgeRank: "Danh hiệu hiện tại",
    nextBadgeThreshold: "Khoảng cách danh hiệu tiếp theo",
    medalsCatalogTitle: "Danh mục Danh Hiệu Hoạt Động",
    topRankingsTitle: "Bảng Xếp Hạng Đóng Góp",
    personalizationTitle: "Cấu Hình Cá Nhân",
    personalizationDesc: "Tùy biến các tham số hiển thị, màu sắc chủ đạo, ảnh đại diện, tiểu sử và phân vùng hoạt động học thuật.",
    themeAccentSelection: "Thay đổi màu sắc chủ đạo (Accent Color)",
    academicsMetadataEditor: "Biên Tập Thông Tin Học Thuật",
    majorDegreeFocus: "Chuyên Ngành Theo Học",
    profileAvatarLabel: "Đường dẫn ảnh đại diện mới (Unsplash)",
    miniBioLabel: "Tiểu sử sinh viên ngắn",
    terminateSession: "Đăng Xuất Khỏi Hệ Thống",
    loginToEditBtn: "Đăng nhập để chỉnh sửa",

    // Modals / Guest Interceptions
    guestReqTitle: "Yêu Cầu Thành Viên",
    guestReqDesc: "Bạn đang truy cập hệ thống CampusForge với tư cách Khách.",
    restrictedActionLabel: "Hành động bị hạn chế:",
    guestDescRestricted: "Chế độ khách chỉ cho phép tra cứu, xem dữ liệu, và tải tài liệu học tập. Vui lòng đăng nhập bằng tài khoản sinh viên/admin để đăng tin hoặc thực hiện các hoạt động nhóm khác.",
    backToGuestBtn: "Trở lại duyệt ở chế độ Khách",

    // Project hub labels
    phSubTitle: "Khám phá các sáng kiến học tập mới, tìm hiểu vị trí khuyết tuyển thành viên, lọc kỹ năng hoặc ghép cặp dự án phù hợp với trình độ học lực của bạn.",
    phTopMatches: "Đề Tài Phù Hợp Nhất Với Trình Độ Kỹ Năng",
    phMatchScore: "Tương thích",
    createProjModalTitle: "Đăng Ký Đề Tài Sáng Kiến Mới",
    projNameLabel: "Tên Đề Tài Khoa Học",
    projDescLabel: "Mô Tả Mục Tiêu Thực Hiện",
    projCatLabel: "Phân Khúc Công Nghệ Core",
    projSkillsLabel: "Kỹ năng yêu cầu (phân tách bằng dấu phẩy)",
    projDeadlineLabel: "Hạn Chặng Hoàn Thành Đề Tài",
    projTeamSizeLabel: "Giới Hạn Thành Viên Tuyển Dụng",
    applyModalTitle: "Gửi Đơn Tham Gia Đội Nhóm",
    applyRemarkLabel: "Lời Giới Thiệu Bản Thân & Cam Kết Đóng Góp",
    btnCancel: "Hủy Bỏ",
    btnSubmit: "Gửi Đơn",
    btnApplying: "Đang xử lý ứng tuyển...",
    btnDone: "Đã Gửi Đơn ✓",
    btnApply: "Đăng Ký Tham Gia Nhóm",

    // Teamflow labels
    tfSubTitle: "Lập kế hoạch tiến độ Sprint, dịch chuyển các thẻ công việc Kanban, theo dõi tốc độ dự án và phân việc cho các thành viên tốt nhất.",
    tfBurnLabel: "Tiến độ Sprint Burn Down",
    tfBurnDesc: "Thể hiện tỉ lệ hoàn thành công việc từ phân khu chuẩn bị (Backlog) qua trạng thái Đã Xong (Done).",
    categoryTitle: "Không Gian Nhóm Liên Kết",
    addTaskModalTitle: "Thêm Mới Thẻ Nhiệm Vụ Kanban",
    taskTitleLabel: "Mô tả ngắn công việc cần làm",
    taskDescLabel: "Hướng dẫn thực hiện chi tiết cho thành viên",
    taskPriorityLabel: "Mức Độ Ưu Tiên Hoạt Động",
    taskAssignedLabel: "Thành viên chịu trách nhiệm chính",
    taskDueDateLabel: "Hạn Chót Hoàn Thành Nhiệm Vụ",
    btnAddTask: "Thêm Công Việc",

    // Community labels
    topicLabel: "Chủ Đề Diễn Đàn Khoa Học",
    publishBtn: "Đăng thảo luận",
    toxicAlert: "Ngăn chặn bảo mật: Gửi bài thất bại do chứa từ ngữ bị giới hạn chính sách.",
    writePostPlaceholder: "Chia sẻ kiến thức, góp ý phương pháp học hoặc thảo luận bài tập lớn...",
    commentPlaceholder: "Đóng góp ý kiến thảo luận...",
    presetImagesLabel: "Đính kèm ảnh nền chủ đề",

    // Resource & Exchange
    rcSubTitle: "Chia sẻ tài liệu học tập, mượn mã nguồn mẫu, hoặc đặt câu hỏi học thuật tới giảng viên chuyên gia.",
    uploadResTitle: "Chia Sẻ Tài Nguyên Học Tập",
    uploadResBtn: "Tải Lên Tài Nguyên",
    resTitleLabel: "Tiêu Đề Tài Nguyên",
    resCatLabel: "Định dạng / Thể loại Tài Nguyên",
    skillsOffersTitle: "Danh Sách Kỹ Năng Đang Trao Đổi",
    matchEngineBtn: "Kích Hoạt Hệ Thống Ghép Cặp",
    matchingSuccess: "Liên kết thành công! Đã kết nối với học viên tương đồng:",
    noMatchedOffer: "Không tìm thấy trao đổi tương thích hoàn toàn. Hãy khai báo thêm kỹ năng học thuật của bạn trong cấu hình!",
    mentorsSubTitle: "Kết nối trực tiếp tới các cố vấn học tập chất lượng, chuyên gia đầu ngành.",
    askMentorModalTitle: "Gửi Câu Hỏi Học Thuật Cho Giảng Viên Cố Vấn",
    askQuestionBtn: "Đặt Câu Hỏi",
    registeredUsersText: "Học Viên Ghi Danh",
    activeInitiativesText: "Đề Tài Hoạt Động",
    tasksAssignedText: "Nhiệm Vụ Được Giao",
    downloadsRecordedText: "lượt tải ghi nhận",
    totalProjectsEnrolled: "Số lượng đề tài",
    activeSprintTasks: "Công việc hoạt động",
    sharedLearningAssets: "Tài liệu học tập chia sẻ",
    universityEngagementTitle: "Chỉ số tương tác học thuật",
    universityEngagementDesc: "Biểu đồ biến đổi lưu lượng hoạt động đăng ký thành viên học tập theo thời gian thực.",
    activePeaksText: "Lưu lượng cao điểm (Tối đa 250)",
    activityIndexText: "Chỉ số hoạt động",
    topDepartmentLabel: "Khoa hàng đầu",
    highestSkillDemandLabel: "Môn học có nhu cầu cao nhất",
    terminalLogsTitle: "Dòng Nhật Ký Hoạt Động Hệ Thống thời gian thực (Admin)",
    enableAutoscrollText: "Khóa cuộn tự động thiết bị đầu cuối",
    userRoleStudent: "Sinh Viên",
    userRoleGuest: "Khách",

    // Auth additions
    guestModeBtn: "🔍 Xem với tư cách Khách (Guest Mode)",
    needTeamEnv: "Bạn chưa có tài khoản sinh viên?",
    joinPortal: "Đăng ký tài khoản ngay",
    alreadyPart: "Đã có tài khoản sinh viên?",
    accessSession: "Đăng nhập ngay",
    emailRequired: "Vui lòng nhập email trường học.",
    passwordLength: "Mật khẩu phải đáp ứng tiêu chuẩn an toàn (tối thiểu 6 ký tự).",
    fillAllFields: "Vui lòng hoàn thành mọi trường dữ liệu.",
    challengeLaunched: "Đã kích hoạt gửi email xác minh sinh viên! Vui lòng kiểm tra lại hòm thư trường học.",
    enterEmailRecovery: "Nhập địa chỉ email trường để tiến hành khôi phục mật khẩu.",
    recoveryDispatched: "Đã gửi mã khôi phục mật khẩu bảo mật về email của bạn.",
    secBlockMsg: "Hành động bị chặn vì lý do bảo mật."
  }
};
