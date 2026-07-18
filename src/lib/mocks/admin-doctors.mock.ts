import type {
  AdminDoctor,
  AdminDoctorCourse,
  AdminDoctorFilters,
  AdminDoctorReviewDetails,
} from "@/types/admin";

function course(
  id: string,
  code: string,
  name: string,
): AdminDoctorCourse {
  return { id, code, name };
}

export const ADMIN_DOCTORS_MOCK = [
  {
    id: "10000000-0000-4000-8000-000000000001",
    name: "د. أحمد محمود",
    university: "جامعة الأزهر",
    major: "هندسة الحاسوب والاتصالات",
    courses: [
      course("course-001", "CE401", "معالجات دقيقة"),
      course("course-002", "CE301", "معمارية الحاسوب"),
      course("course-003", "CE201", "دوائر منطقية"),
    ],
    average_rating: 4.5,
    reviews_count: 38,
    created_at: "2026-07-17T08:00:00.000Z",
  },
  {
    id: "10000000-0000-4000-8000-000000000002",
    name: "د. محمد أبو عودة",
    university: "جامعة الأزهر",
    major: "الطب البشري",
    courses: [
      course("course-004", "MED301", "الطب الباطني"),
      course("course-005", "MED201", "علم الأمراض"),
    ],
    average_rating: 4.8,
    reviews_count: 67,
    created_at: "2026-07-16T09:30:00.000Z",
  },
  {
    id: "10000000-0000-4000-8000-000000000003",
    name: "د. خالد عفانة",
    university: "جامعة الأزهر",
    major: "المحاسبة (باللغتين العربية والإنجليزية)",
    courses: [
      course("course-006", "ACC101", "المحاسبة المالية"),
      course("course-007", "ACC201", "محاسبة التكاليف"),
      course("course-008", "ACC301", "المراجعة والتدقيق"),
      course("course-009", "ACC401", "المحاسبة الإدارية"),
    ],
    average_rating: 3.5,
    reviews_count: 24,
    created_at: "2026-07-15T11:00:00.000Z",
  },
  {
    id: "10000000-0000-4000-8000-000000000004",
    name: "د. منار أبو طويلة",
    university: "جامعة الأزهر",
    major: "اللغة الإنجليزية وآدابها",
    courses: [
      course("course-010", "EN2102", "الأدب الإنجليزي الحديث"),
      course("course-011", "EN3102", "الترجمة"),
      course("course-012", "EN2201", "علم اللغويات"),
      course("course-013", "EN4101", "الأدب المقارن"),
      course("course-014", "EN3101", "النقد الأدبي"),
    ],
    average_rating: 2.5,
    reviews_count: 19,
    created_at: "2026-07-14T10:00:00.000Z",
  },
  {
    id: "10000000-0000-4000-8000-000000000005",
    name: "د. سمر النجار",
    university: "جامعة الأزهر",
    major: "دكتور صيدلة (Pharm D) / الصيدلة",
    courses: [
      course("course-015", "PHARM201", "علم الأدوية"),
      course("course-016", "PHARM301", "الصيدلة السريرية"),
    ],
    average_rating: 4.2,
    reviews_count: 31,
    created_at: "2026-07-13T12:00:00.000Z",
  },
  {
    id: "10000000-0000-4000-8000-000000000006",
    name: "د. ياسر المكلوك",
    university: "الجامعة الإسلامية ",
    major: "هندسة البرمجيات",
    courses: [
      course("course-017", "SE201", "هندسة البرمجيات"),
      course("course-018", "SE301", "اختبار البرمجيات"),
      course("course-019", "SE401", "إدارة مشاريع البرمجيات"),
    ],
    average_rating: 4.7,
    reviews_count: 54,
    created_at: "2026-07-12T08:30:00.000Z",
  },
  {
    id: "10000000-0000-4000-8000-000000000007",
    name: "د. إيمان نصر",
    university: "الجامعة الإسلامية ",
    major: "التمريض العام",
    courses: [
      course("course-020", "NUR201", "تمريض البالغين"),
      course("course-021", "NUR301", "تمريض الحالات الحرجة"),
    ],
    average_rating: 3.8,
    reviews_count: 29,
    created_at: "2026-07-11T09:00:00.000Z",
  },
  {
    id: "10000000-0000-4000-8000-000000000008",
    name: "د. رائد الشوا",
    university: "الجامعة الإسلامية ",
    major: "الهندسة المدنية",
    courses: [
      course("course-022", "CIV201", "ميكانيكا هندسية"),
      course("course-023", "CIV301", "تحليل إنشائي"),
      course("course-024", "CIV401", "تصميم المنشآت"),
      course("course-025", "CIV402", "هندسة الأساسات"),
    ],
    average_rating: 4,
    reviews_count: 43,
    created_at: "2026-07-10T13:00:00.000Z",
  },
  {
    id: "10000000-0000-4000-8000-000000000009",
    name: "د. هبة الأغا",
    university: "الجامعة الإسلامية ",
    major: "الرياضيات",
    courses: [
      course("course-026", "MATH201", "التفاضل والتكامل"),
      course("course-027", "MATH301", "الجبر الخطي"),
    ],
    average_rating: 1.5,
    reviews_count: 12,
    created_at: "2026-07-09T08:00:00.000Z",
  },
  {
    id: "10000000-0000-4000-8000-000000000010",
    name: "د. محمود سالم",
    university: "الكلية الجامعية للعلوم التطبيقية",
    major: "علم الحاسب",
    courses: [
      course("course-028", "CS101", "برمجة 1"),
      course("course-029", "CS102", "برمجة 2"),
      course("course-030", "CS201", "هياكل البيانات"),
      course("course-031", "CS301", "الخوارزميات"),
      course("course-032", "CS303", "قواعد البيانات"),
      course("course-033", "CS450", "الذكاء الاصطناعي"),
    ],
    average_rating: 4.9,
    reviews_count: 86,
    created_at: "2026-07-08T10:00:00.000Z",
  },
  {
    id: "10000000-0000-4000-8000-000000000011",
    name: "د. آلاء حمادة",
    university: "الكلية الجامعية للعلوم التطبيقية",
    major: "التصميم الجرافيكي",
    courses: [
      course("course-034", "GD201", "أساسيات التصميم"),
      course("course-035", "GD301", "تصميم واجهات المستخدم"),
      course("course-036", "GD401", "الهوية البصرية"),
    ],
    average_rating: 3.2,
    reviews_count: 17,
    created_at: "2026-07-07T11:30:00.000Z",
  },
  {
    id: "10000000-0000-4000-8000-000000000012",
    name: "د. عبد الرحمن حمدان",
    university: "الكلية الجامعية للعلوم التطبيقية",
    major: "أمن المعلومات",
    courses: [
      course("course-037", "SEC201", "مبادئ أمن المعلومات"),
      course("course-038", "SEC301", "أمن الشبكات"),
    ],
    average_rating: 2.8,
    reviews_count: 14,
    created_at: "2026-07-06T07:30:00.000Z",
  },
  {
    id: "10000000-0000-4000-8000-000000000013",
    name: "د. نور الدين قاسم",
    university: "جامعة فلسطين",
    major: "هندسة الذكاء الاصطناعي",
    courses: [
      course("course-039", "AI201", "مقدمة في الذكاء الاصطناعي"),
      course("course-040", "AI301", "تعلم الآلة"),
      course("course-041", "AI401", "معالجة اللغات الطبيعية"),
      course("course-042", "AI402", "الرؤية الحاسوبية"),
    ],
    average_rating: 4.6,
    reviews_count: 72,
    created_at: "2026-07-05T09:45:00.000Z",
  },
  {
    id: "10000000-0000-4000-8000-000000000014",
    name: "د. ميساء القدرة",
    university: "جامعة فلسطين",
    major: "العلاج الطبيعي",
    courses: [
      course("course-043", "PT201", "علم الحركة"),
      course("course-044", "PT301", "التأهيل الحركي"),
    ],
    average_rating: 3,
    reviews_count: 21,
    created_at: "2026-07-04T12:00:00.000Z",
  },
  {
    id: "10000000-0000-4000-8000-000000000015",
    name: "د. شادي أبو مصطفى",
    university: "جامعة فلسطين",
    major: "هندسة البرمجيات ",
    courses: [
      course("course-045", "WEB201", "تطوير تطبيقات الويب"),
      course("course-046", "DB301", "قواعد البيانات المتقدمة"),
      course("course-047", "MOB401", "تطوير تطبيقات الهاتف"),
    ],
    average_rating: 4.1,
    reviews_count: 36,
    created_at: "2026-07-03T10:15:00.000Z",
  },
  {
    id: "10000000-0000-4000-8000-000000000016",
    name: "د. فاطمة بركات",
    university: "جامعة فلسطين",
    major: "التغذية السريرية",
    courses: [],
    average_rating: null,
    reviews_count: 0,
    created_at: "2026-07-02T08:20:00.000Z",
  },
] satisfies AdminDoctor[];

export function getAdminDoctorsMock(
  filters: AdminDoctorFilters = {},
): AdminDoctor[] {
  const university = filters.university?.trim();
  const major = filters.major?.trim();

  return ADMIN_DOCTORS_MOCK.filter((doctor) => {
    const matchesUniversity = university
      ? doctor.university.trim() === university
      : true;

    const matchesMajor = major
      ? doctor.major.trim() === major
      : true;

    return matchesUniversity && matchesMajor;
  });
}

const MOCK_STUDENTS = [
  { full_name: "أحمد محمد", university: "جامعة الأزهر" },
  { full_name: "سارة خالد", university: "الجامعة الإسلامية" },
  { full_name: "محمود ناصر", university: "جامعة فلسطين" },
  { full_name: "نور أحمد", university: "جامعة الأزهر" },
  { full_name: "ليان سمير", university: "الكلية الجامعية للعلوم التطبيقية" },
  { full_name: "محمد ياسر", university: "الجامعة الإسلامية" },
];

const MOCK_REVIEW_COMMENTS = [
  "شرح الدكتور واضح ويعتمد على أمثلة عملية مفيدة.",
  "المادة تحتاج متابعة مستمرة، لكن أسلوب الشرح جيد.",
  "يتفاعل مع أسئلة الطلاب ويوضح النقاط الصعبة.",
  "الامتحانات مرتبطة بالمحتوى الذي يتم شرحه.",
  "أنصح بالتركيز أثناء المحاضرات ومراجعة الأمثلة.",
  "التقييم جيد عمومًا، لكن سرعة الشرح مرتفعة أحيانًا.",
];

function clampRating(value: number): number {
  return Math.min(5, Math.max(1, Math.round(value * 2) / 2));
}

export function getAdminDoctorReviewDetailsMock(
  doctorId: string,
  courseCode?: string,
): AdminDoctorReviewDetails {
  const doctor = ADMIN_DOCTORS_MOCK.find((item) => item.id === doctorId);

  if (!doctor) {
    throw new Error("الدكتور غير موجود في البيانات الوهمية");
  }

  const selectedCourse = courseCode
    ? doctor.courses.find((course) => course.code === courseCode)
    : null;

  if (courseCode && !selectedCourse) {
    throw new Error("المادة غير مرتبطة بهذا الدكتور");
  }

  const courses = selectedCourse
    ? [selectedCourse]
    : doctor.courses;

  const reviewCount =
    courses.length === 0
      ? 0
      : Math.min(12, doctor.reviews_count);

  const baseRating = doctor.average_rating ?? 3;

  const ratingChanges = [0, -0.5, 0.5, -1, 0, 0.5];

  const reviews = Array.from({ length: reviewCount }, (_, index) => {
    const rating = clampRating(
      baseRating + ratingChanges[index % ratingChanges.length],
    );

    return {
      id: `mock-review-${doctor.id}-${index}`,
      course_code: courses[index % courses.length].code,
      rating_overall: rating,
      rating_clarity: clampRating(rating + (index % 2 === 0 ? 0.5 : 0)),
      rating_fairness: clampRating(rating + (index % 3 === 0 ? -0.5 : 0)),
      would_retake: rating >= 3.5,
      review: MOCK_REVIEW_COMMENTS[index % MOCK_REVIEW_COMMENTS.length],
      created_at: new Date(
        Date.UTC(2026, 6, 18 - index),
      ).toISOString(),
      student: MOCK_STUDENTS[index % MOCK_STUDENTS.length],
    };
  });

  const average = (
    key: "rating_overall" | "rating_clarity" | "rating_fairness",
  ) => {
    if (reviews.length === 0) return 0;

    const total = reviews.reduce(
      (sum, review) => sum + review[key],
      0,
    );

    return Math.round((total / reviews.length) * 10) / 10;
  };

  const retakeCount = reviews.filter(
    (review) => review.would_retake,
  ).length;

  return {
    doctor,
    selected_course: selectedCourse ?? null,

    stats: {
      count: reviews.length,
      avg_overall: average("rating_overall"),
      avg_clarity: average("rating_clarity"),
      avg_fairness: average("rating_fairness"),
      retake_percent:
        reviews.length > 0
          ? Math.round((retakeCount / reviews.length) * 100)
          : 0,
    },

    reviews,
  };
}