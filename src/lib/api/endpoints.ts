// كل روابط الـ API الخاصة بالأدمن بمكان واحد.
// أي Route جديد لازم يُضاف هون أولاً قبل استخدامه بأي مكان تاني.
export const API_ENDPOINTS = {
  admin: {
    // إدارة المستخدمين
    users: "/api/admin/users", // GET: جلب كل المستخدمين
    user: (userId: string) => `/api/admin/users/${userId}`, // DELETE: حذف مستخدم محدد
    userRole: (userId: string) => `/api/admin/users/${userId}/role`, // PATCH: تغيير دور مستخدم

    // إحصائيات لوحة التحكم
    stats: "/api/admin/stats", // GET: أرقام Dashboard (عدد المستخدمين، المواد، إلخ)
    majorDistribution: "/api/admin/major-distribution", // GET: توزيع الطلاب حسب التخصص
    universityDistribution: "/api/admin/university-distribution", // GET: توزيع الطلاب حسب الجامعة
    recentActivity: "/api/admin/recent-activity", // GET: آخر الأنشطة (ملاحظات، مهام، مواد)
    studentDistribution: "/api/admin/student-distribution", // GET: توزيع الطلاب حسب التخصص أو الجامعة
    platformActivity: "/api/admin/platform-activity", // Platform activity trend endpoint
    // إدارة المواد
    courses: "/api/admin/courses", // GET: جلب المواد (بفلاتر اختيارية) / POST: إنشاء مادة
    adminCourse: (id: string) => `/api/admin/courses/${id}`, // DELETE: حذف مادة محددة

    // مراجعات المواد
    courseReviews: "/api/admin/course-reviews", // GET: كل مراجعات المواد
    adminCourseReview: (id: string) => `/api/admin/course-reviews/${id}`, // DELETE: حذف مراجعة مادة

    // مراجعات الدكاترة
    doctorReviews: "/api/admin/doctor-reviews", // GET: كل مراجعات الدكاترة
    adminDoctorReview: (id: string) => `/api/admin/doctor-reviews/${id}`, // DELETE: حذف مراجعة دكتور
  },
} as const;
