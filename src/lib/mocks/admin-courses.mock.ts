import type {
  AdminCourse,
  AdminCourseFilters,
  AdminCoursePage,
} from "@/types/admin";

export type MockReviewStatus = "active" | "deleted";

type Rating = 1 | 2 | 3 | 4 | 5;


export interface AdminCourseReviewMock {
  id: string;
  course_id: string;
  user_id: string;
  student_name: string;
  rating_overall: Rating;
  rating_difficulty: Rating;
  rating_workload: Rating;
  rating_content_quality: Rating;
  would_retake: boolean;
  review: string;
  tips: string;
  semester_taken: string;
  status: MockReviewStatus;
  created_at: string;
  deleted_at: string | null;
}



interface CourseSeed {
  name: string;
  code: string;
  credits: number;
  category: string;
  semester: string;
  year: string;
  university: string;
  major: string;
  ratings: Rating[];
  prerequisiteCodes?: string[];
  deleted?: boolean;
}

const courseSeeds: CourseSeed[] = [
  {
    name: "مقدمة في البرمجة",
    code: "COMP1101",
    credits: 3,
    category: "متطلب تخصص",
    semester: "الفصل الأول",
    year: "السنة الأولى",
    university: "جامعة الأزهر",
    major: "هندسة البرمجيات",
    ratings: [5, 4, 5, 4, 3, 5, 4],
  },
  {
    name: "البرمجة كائنية التوجه",
    code: "COMP1202",
    credits: 3,
    category: "متطلب تخصص",
    semester: "الفصل الثاني",
    year: "السنة الأولى",
    university: "جامعة الأزهر",
    major: "هندسة البرمجيات",
    ratings: [4, 4, 3, 5, 4, 4],
    prerequisiteCodes: ["COMP1101"],
  },
  {
    name: "هياكل البيانات والخوارزميات",
    code: "COMP2101",
    credits: 3,
    category: "متطلب تخصص",
    semester: "الفصل الأول",
    year: "السنة الثانية",
    university: "جامعة الأزهر",
    major: "هندسة البرمجيات",
    ratings: [5, 4, 4, 3, 5, 2, 4, 5],
    prerequisiteCodes: ["COMP1202"],
  },
  {
    name: "قواعد البيانات",
    code: "COMP2202",
    credits: 3,
    category: "متطلب تخصص",
    semester: "الفصل الثاني",
    year: "السنة الثانية",
    university: "جامعة الأزهر",
    major: "هندسة البرمجيات",
    ratings: [5, 5, 4, 4, 3, 4, 5],
    prerequisiteCodes: ["COMP1202"],
  },
  {
    name: "هندسة البرمجيات",
    code: "SENG3101",
    credits: 3,
    category: "متطلب تخصص",
    semester: "الفصل الأول",
    year: "السنة الثالثة",
    university: "جامعة الأزهر",
    major: "هندسة البرمجيات",
    ratings: [4, 4, 5, 3, 4, 5],
    prerequisiteCodes: ["COMP2101", "COMP2202"],
  },
  {
    name: "تطوير تطبيقات الويب",
    code: "WEB3202",
    credits: 3,
    category: "متطلب تخصص",
    semester: "الفصل الثاني",
    year: "السنة الثالثة",
    university: "جامعة الأزهر",
    major: "هندسة البرمجيات",
    ratings: [5, 4, 5, 5, 4, 3, 5, 4, 5],
    prerequisiteCodes: ["COMP2202"],
  },
  {
    name: "أمن المعلومات",
    code: "SECU4101",
    credits: 3,
    category: "متطلب تخصص",
    semester: "الفصل الأول",
    year: "السنة الرابعة",
    university: "جامعة الأزهر",
    major: "هندسة البرمجيات",
    ratings: [4, 3, 4, 5, 2, 4],
    prerequisiteCodes: ["COMP2101"],
  },
  {
    name: "مشروع التخرج",
    code: "SENG4202",
    credits: 4,
    category: "متطلب تخصص",
    semester: "الفصل الثاني",
    year: "السنة الرابعة",
    university: "جامعة الأزهر",
    major: "هندسة البرمجيات",
    ratings: [5, 5, 4, 5, 4],
    prerequisiteCodes: ["SENG3101", "WEB3202"],
  },
  {
    name: "التشريح العام (1)",
    code: "ANAT1101",
    credits: 4,
    category: "متطلب تخصص",
    semester: "الفصل الأول",
    year: "السنة الأولى",
    university: "جامعة الأزهر",
    major: "الطب البشري",
    ratings: [4, 3, 5, 4, 2, 4, 3, 5],
  },
  {
    name: "الكيمياء الحيوية (1)",
    code: "BIOC1101",
    credits: 3,
    category: "متطلب تخصص",
    semester: "الفصل الأول",
    year: "السنة الأولى",
    university: "جامعة الأزهر",
    major: "الطب البشري",
    ratings: [3, 4, 4, 2, 5, 3],
  },
  {
    name: "الفسيولوجيا الطبية (1)",
    code: "PHYS1102",
    credits: 4,
    category: "متطلب تخصص",
    semester: "الفصل الأول",
    year: "السنة الأولى",
    university: "جامعة الأزهر",
    major: "الطب البشري",
    ratings: [4, 4, 5, 3, 4, 2, 5],
  },
  {
    name: "التشريح العام (2)",
    code: "ANAT1202",
    credits: 4,
    category: "متطلب تخصص",
    semester: "الفصل الثاني",
    year: "السنة الأولى",
    university: "جامعة الأزهر",
    major: "الطب البشري",
    ratings: [4, 5, 3, 4, 4, 5],
    prerequisiteCodes: ["ANAT1101"],
  },
  {
    name: "علم الأدوية (1)",
    code: "PHAR2101",
    credits: 3,
    category: "متطلب تخصص",
    semester: "الفصل الأول",
    year: "السنة الثانية",
    university: "جامعة الأزهر",
    major: "الطب البشري",
    ratings: [3, 4, 2, 5, 3, 4, 4],
    prerequisiteCodes: ["BIOC1101", "PHYS1102"],
  },
  {
    name: "علم الأمراض العام",
    code: "PATH2202",
    credits: 3,
    category: "متطلب تخصص",
    semester: "الفصل الثاني",
    year: "السنة الثانية",
    university: "جامعة الأزهر",
    major: "الطب البشري",
    ratings: [4, 3, 4, 5, 4, 2],
    prerequisiteCodes: ["ANAT1202"],
  },
  {
    name: "مبادئ الصحافة",
    code: "JOUR1101",
    credits: 3,
    category: "متطلب تخصص",
    semester: "الفصل الأول",
    year: "السنة الأولى",
    university: "جامعة الأزهر",
    major: "الصحافة والإعلام",
    ratings: [4, 5, 4, 3, 5],
  },
  {
    name: "التحرير الصحفي",
    code: "JOUR1202",
    credits: 3,
    category: "متطلب تخصص",
    semester: "الفصل الثاني",
    year: "السنة الأولى",
    university: "جامعة الأزهر",
    major: "الصحافة والإعلام",
    ratings: [5, 4, 4, 3, 5, 4],
    prerequisiteCodes: ["JOUR1101"],
  },
  {
    name: "الإعلام الرقمي والإلكتروني",
    code: "JO2202",
    credits: 3,
    category: "متطلب تخصص",
    semester: "الفصل الثاني",
    year: "السنة الثانية",
    university: "جامعة الأزهر",
    major: "الصحافة والإعلام",
    ratings: [5, 4, 5, 3, 4, 5, 4],
    prerequisiteCodes: ["JOUR1202"],
  },
  {
    name: "إنتاج المحتوى الرقمي",
    code: "MEDI3101",
    credits: 3,
    category: "متطلب تخصص",
    semester: "الفصل الأول",
    year: "السنة الثالثة",
    university: "جامعة الأزهر",
    major: "الصحافة والإعلام",
    ratings: [5, 5, 4, 5, 3, 4],
    prerequisiteCodes: ["JO2202"],
  },
  {
    name: "مبادئ الإدارة",
    code: "BUSI1101",
    credits: 3,
    category: "متطلب كلية",
    semester: "الفصل الأول",
    year: "السنة الأولى",
    university: "الجامعة الإسلامية",
    major: "إدارة الأعمال",
    ratings: [4, 4, 5, 3, 4, 5, 2],
  },
  {
    name: "السلوك التنظيمي",
    code: "BUSI2201",
    credits: 3,
    category: "متطلب تخصص",
    semester: "الفصل الأول",
    year: "السنة الثانية",
    university: "الجامعة الإسلامية",
    major: "إدارة الأعمال",
    ratings: [5, 4, 3, 4, 5, 4],
    prerequisiteCodes: ["BUSI1101"],
  },
  {
    name: "إدارة الموارد البشرية",
    code: "BUSI3202",
    credits: 3,
    category: "متطلب تخصص",
    semester: "الفصل الثاني",
    year: "السنة الثالثة",
    university: "الجامعة الإسلامية",
    major: "إدارة الأعمال",
    ratings: [4, 5, 5, 4, 3],
    prerequisiteCodes: ["BUSI2201"],
  },
  {
    name: "إدارة المشاريع",
    code: "BUSI4101",
    credits: 3,
    category: "متطلب تخصص",
    semester: "الفصل الأول",
    year: "السنة الرابعة",
    university: "الجامعة الإسلامية",
    major: "إدارة الأعمال",
    ratings: [5, 4, 5, 4, 5, 3],
    prerequisiteCodes: ["BUSI3202"],
  },
  {
    name: "رياضيات هندسية (1)",
    code: "MATH1101",
    credits: 3,
    category: "متطلب كلية",
    semester: "الفصل الأول",
    year: "السنة الأولى",
    university: "الجامعة الإسلامية",
    major: "الهندسة المدنية",
    ratings: [4, 3, 4, 2, 5, 4],
  },
  {
    name: "ميكانيكا هندسية",
    code: "CIVL1202",
    credits: 3,
    category: "متطلب تخصص",
    semester: "الفصل الثاني",
    year: "السنة الأولى",
    university: "الجامعة الإسلامية",
    major: "الهندسة المدنية",
    ratings: [3, 4, 4, 5, 2, 3],
    prerequisiteCodes: ["MATH1101"],
  },
  {
    name: "تحليل إنشائي (1)",
    code: "CIVL2101",
    credits: 3,
    category: "متطلب تخصص",
    semester: "الفصل الأول",
    year: "السنة الثانية",
    university: "الجامعة الإسلامية",
    major: "الهندسة المدنية",
    ratings: [4, 3, 5, 4, 3],
    prerequisiteCodes: ["CIVL1202"],
  },
  {
    name: "تصميم الخرسانة المسلحة",
    code: "CIVL3202",
    credits: 3,
    category: "متطلب تخصص",
    semester: "الفصل الثاني",
    year: "السنة الثالثة",
    university: "الجامعة الإسلامية",
    major: "الهندسة المدنية",
    ratings: [4, 5, 3, 4, 4, 5],
    prerequisiteCodes: ["CIVL2101"],
  },
  {
    name: "مقدمة في التمريض",
    code: "NURS1101",
    credits: 3,
    category: "متطلب تخصص",
    semester: "الفصل الأول",
    year: "السنة الأولى",
    university: "جامعة الأقصى",
    major: "التمريض",
    ratings: [5, 4, 5, 4, 3, 5],
  },
  {
    name: "أساسيات التمريض العملي",
    code: "NURS1202",
    credits: 4,
    category: "متطلب تخصص",
    semester: "الفصل الثاني",
    year: "السنة الأولى",
    university: "جامعة الأقصى",
    major: "التمريض",
    ratings: [4, 5, 4, 3, 4, 5, 5],
    prerequisiteCodes: ["NURS1101"],
  },
  {
    name: "تمريض البالغين",
    code: "NURS2101",
    credits: 4,
    category: "متطلب تخصص",
    semester: "الفصل الأول",
    year: "السنة الثانية",
    university: "جامعة الأقصى",
    major: "التمريض",
    ratings: [4, 3, 5, 4, 2, 4],
    prerequisiteCodes: ["NURS1202"],
  },
  {
    name: "تمريض صحة المجتمع",
    code: "NURS3202",
    credits: 3,
    category: "متطلب تخصص",
    semester: "الفصل الثاني",
    year: "السنة الثالثة",
    university: "جامعة الأقصى",
    major: "التمريض",
    ratings: [5, 4, 4, 5, 3],
    prerequisiteCodes: ["NURS2101"],
  },
  {
    name: "مناهج البحث العلمي",
    code: "RESR3101",
    credits: 3,
    category: "متطلب جامعة",
    semester: "الفصل الأول",
    year: "السنة الثالثة",
    university: "جامعة الأقصى",
    major: "التمريض",
    ratings: [],
    deleted: true,
  },
  {
    name: "موضوعات خاصة في الإدارة",
    code: "BUSI4301",
    credits: 3,
    category: "متطلب اختياري",
    semester: "الفصل الأول",
    year: "السنة الرابعة",
    university: "الجامعة الإسلامية",
    major: "إدارة الأعمال",
    ratings: [3, 4],
    deleted: true,
    prerequisiteCodes: ["BUSI3202"],
  },
  {
    name: "تطبيقات صحفية متقدمة",
    code: "JOUR4302",
    credits: 3,
    category: "متطلب اختياري",
    semester: "الفصل الثاني",
    year: "السنة الرابعة",
    university: "جامعة الأزهر",
    major: "الصحافة والإعلام",
    ratings: [],
    deleted: true,
    prerequisiteCodes: ["MEDI3101"],
  },
];

function makeUuid(index: number, group = 1) {
  const suffix = String(group * 1000 + index).padStart(12, "0");
  return `00000000-0000-4000-8000-${suffix}`;
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function average(values: number[]) {
  if (values.length === 0) return null;
  return round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function courseKey(university: string, code: string) {
  return `${university.trim().toLowerCase()}::${code.trim().toLowerCase()}`;
}

const baseCourses = courseSeeds.map((seed, index) => ({
  id: makeUuid(index + 1),
  ...seed,
  created_at: new Date(
    Date.UTC(2026, index % 6, (index % 24) + 1, 9, 0, 0),
  ).toISOString(),
  deleted_at: seed.deleted
    ? new Date(Date.UTC(2026, 6, (index % 15) + 1, 12, 0, 0)).toISOString()
    : null,
}));

const courseByKey = new Map(
  baseCourses.map((course) => [
    courseKey(course.university, course.code),
    course,
  ]),
);

export const adminCourseReviewsMock: AdminCourseReviewMock[] =
  baseCourses.flatMap((course, courseIndex) =>
    course.ratings.map((rating, reviewIndex) => {
      const difficulty = Math.min(
        5,
        Math.max(1, 6 - rating + ((reviewIndex + courseIndex) % 2)),
      ) as Rating;

      const workload = Math.min(
        5,
        Math.max(1, difficulty + ((reviewIndex + 1) % 2)),
      ) as Rating;

      const contentQuality = Math.min(
        5,
        Math.max(1, rating + (reviewIndex % 3 === 0 ? 0 : -1)),
      ) as Rating;

      const isDeleted = reviewIndex === course.ratings.length - 1 &&
        course.ratings.length >= 7;

      return {
        id: makeUuid(courseIndex * 20 + reviewIndex + 1, 2),
        course_id: course.id,
        user_id: makeUuid(courseIndex * 20 + reviewIndex + 1, 3),
        student_name: `طالب ${courseIndex + 1}-${reviewIndex + 1}`,
        rating_overall: rating,
        rating_difficulty: difficulty,
        rating_workload: workload,
        rating_content_quality: contentQuality,
        would_retake: rating >= 4,
        review:
          rating >= 4
            ? "المادة مفيدة وشرحها واضح، لكنها تحتاج متابعة أسبوعية وحل التمارين أولًا بأول."
            : rating === 3
              ? "المادة متوسطة الصعوبة وتحتاج تنظيمًا جيدًا قبل الامتحانات."
              : "المادة تحتاج شرحًا إضافيًا ومصادر خارجية لفهم بعض الوحدات.",
        tips:
          difficulty >= 4
            ? "ابدأ المراجعة مبكرًا وركّز على أسئلة السنوات السابقة."
            : "لخّص كل محاضرة وحل الأسئلة التطبيقية بعد انتهائها.",
        semester_taken:
          reviewIndex % 2 === 0 ? "الفصل الأول 2025-2026" : "الفصل الثاني 2024-2025",
        status: isDeleted ? "deleted" : "active",
        created_at: new Date(
          Date.UTC(2026, 5, ((reviewIndex + courseIndex) % 25) + 1, 10, 0, 0),
        ).toISOString(),
        deleted_at: isDeleted
          ? new Date(Date.UTC(2026, 6, 10, 13, 0, 0)).toISOString()
          : null,
      };
    }),
  );

export const adminCoursesMock: AdminCourse[] = baseCourses.map((course) => {
  const reviews = adminCourseReviewsMock.filter(
    (review) => review.course_id === course.id && review.status === "active",
  );

  const distribution: AdminCourse["rating_distribution"] = {
    "1": 0,
    "2": 0,
    "3": 0,
    "4": 0,
    "5": 0,
  };

  reviews.forEach((review) => {
    distribution[String(review.rating_overall) as keyof typeof distribution] += 1;
  });

  const prerequisites = (course.prerequisiteCodes ?? [])
    .map((code) => courseByKey.get(courseKey(course.university, code)))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .map((item) => ({
      id: item.id,
      name: item.name,
      code: item.code,
    }));

  const retakeCount = reviews.filter((review) => review.would_retake).length;

  return {
    id: course.id,
    name: course.name,
    code: course.code,
    description: null,
    teaching_language: "العربية",
    credits: course.credits,
    category: course.category,
    semester: course.semester,
    year: course.year,
    university: course.university,
    major: course.major,
    created_at: course.created_at,
    updated_at: course.created_at,
    deleted_at: course.deleted_at,
    average_rating: average(
      reviews.map((review) => review.rating_overall),
    ) ?? 0,
    reviews_count: reviews.length,
    rating_distribution: distribution,
    average_difficulty: average(
      reviews.map((review) => review.rating_difficulty),
    ),
    average_workload: average(
      reviews.map((review) => review.rating_workload),
    ),
    average_content_quality: average(
      reviews.map((review) => review.rating_content_quality),
    ),
    retake_percent:
      reviews.length > 0 ? round((retakeCount / reviews.length) * 100) : null,
    prerequisite_ids: prerequisites.map((item) => item.id),
    prerequisites,
  };
});

export function findMockAdminCourse(id: string) {
  return adminCoursesMock.find((course) => course.id === id) ?? null;
}

export function getMockCourseReviews(
  courseId: string,
  options?: {
    status?: MockReviewStatus;
    sort?: "newest" | "oldest" | "rating_high" | "rating_low";
  },
) {
  let reviews = adminCourseReviewsMock.filter(
    (review) => review.course_id === courseId,
  );

  if (options?.status) {
    reviews = reviews.filter((review) => review.status === options.status);
  }

  switch (options?.sort) {
    case "oldest":
      return reviews.sort((a, b) =>
        a.created_at.localeCompare(b.created_at),
      );
    case "rating_high":
      return reviews.sort((a, b) => b.rating_overall - a.rating_overall);
    case "rating_low":
      return reviews.sort((a, b) => a.rating_overall - b.rating_overall);
    case "newest":
    default:
      return reviews.sort((a, b) =>
        b.created_at.localeCompare(a.created_at),
      );
  }
}

export function listMockAdminCourses(
  filters: AdminCourseFilters,
): AdminCoursePage {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 10;
  const search = filters.search?.trim().toLowerCase();

  let courses = [...adminCoursesMock];

  courses =
    filters.status === "deleted"
      ? courses.filter((course) => course.deleted_at !== null)
      : courses.filter((course) => course.deleted_at === null);

  if (filters.university) {
    courses = courses.filter(
      (course) => course.university === filters.university,
    );
  }

  if (filters.major) {
    courses = courses.filter((course) => course.major === filters.major);
  }

  if (filters.semester) {
    courses = courses.filter(
      (course) => course.semester === filters.semester,
    );
  }

  if (filters.year) {
    courses = courses.filter((course) => course.year === filters.year);
  }

  if (search) {
    courses = courses.filter((course) =>
      [
        course.name,
        course.code,
        course.university,
        course.major,
        course.category,
      ].some((value) => value.toLowerCase().includes(search)),
    );
  }

  switch (filters.sort ?? "created_desc") {
    case "name_asc":
      courses.sort((a, b) => a.name.localeCompare(b.name, "ar"));
      break;

    case "code_asc":
      courses.sort((a, b) => a.code.localeCompare(b.code));
      break;

    case "rating_desc":
      courses.sort(
        (a, b) => (b.average_rating ?? 0) - (a.average_rating ?? 0),
      );
      break;

    case "rating_asc":
      courses.sort(
        (a, b) => (a.average_rating ?? 0) - (b.average_rating ?? 0),
      );
      break;

    case "reviews_desc":
      courses.sort((a, b) => b.reviews_count - a.reviews_count);
      break;

    case "created_desc":
    default:
      courses.sort((a, b) =>
        b.created_at.localeCompare(a.created_at),
      );
      break;
  }

  const total = courses.length;
  const start = (page - 1) * pageSize;
  const items = courses.slice(start, start + pageSize);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export function createMockAdminCourse(
  input: Pick<
    AdminCourse,
    | "name"
    | "code"
    | "credits"
    | "category"
    | "semester"
    | "year"
    | "university"
    | "major"
  > &
    Partial<Pick<AdminCourse, "description" | "teaching_language">> & {
      prerequisite_ids?: string[];
    },
) {
  const prerequisites = adminCoursesMock
    .filter((course) => input.prerequisite_ids?.includes(course.id))
    .map((course) => ({
      id: course.id,
      name: course.name,
      code: course.code,
    }));

  const now = new Date().toISOString();

  const course: AdminCourse = {
    id: crypto.randomUUID(),
    name: input.name,
    code: input.code,
    description: input.description ?? null,
    teaching_language: input.teaching_language ?? "العربية",
    credits: input.credits,
    category: input.category,
    semester: input.semester,
    year: input.year,
    university: input.university,
    major: input.major,
    created_at: now,
    updated_at: now,
    deleted_at: null,
    average_rating: 0,
    reviews_count: 0,
    rating_distribution: {
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
    },
    average_difficulty: null,
    average_workload: null,
    average_content_quality: null,
    retake_percent: null,
    prerequisite_ids: prerequisites.map((item) => item.id),
    prerequisites,
  };

  adminCoursesMock.unshift(course);
  return course;
}

export function updateMockAdminCourse(
  id: string,
  input: Partial<
    Pick<
      AdminCourse,
      | "name"
      | "code"
      | "credits"
      | "category"
      | "semester"
      | "year"
      | "university"
      | "major"
      | "description"
      | "teaching_language"
    >
  > & {
    prerequisite_ids?: string[];
  },
) {
  const course = findMockAdminCourse(id);
  if (!course) return null;

  Object.assign(course, input, {
    updated_at: new Date().toISOString(),
  });

  if (input.prerequisite_ids) {
    const prerequisites = adminCoursesMock
      .filter((item) => input.prerequisite_ids?.includes(item.id))
      .map((item) => ({
        id: item.id,
        name: item.name,
        code: item.code,
      }));

    course.prerequisite_ids = prerequisites.map((item) => item.id);
    course.prerequisites = prerequisites;
  }

  return course;
}

export function softDeleteMockAdminCourse(id: string) {
  const course = findMockAdminCourse(id);
  if (!course) return false;

  course.deleted_at = new Date().toISOString();
  return true;
}

export function restoreMockAdminCourse(id: string) {
  const course = findMockAdminCourse(id);
  if (!course) return false;

  course.deleted_at = null;
  return true;
}

export function updateMockCourseReviewStatus(
  reviewId: string,
  status: MockReviewStatus,
) {
  const review = adminCourseReviewsMock.find((item) => item.id === reviewId);
  if (!review) return null;

  review.status = status;
  review.deleted_at = status === "deleted" ? new Date().toISOString() : null;
  return review;
}