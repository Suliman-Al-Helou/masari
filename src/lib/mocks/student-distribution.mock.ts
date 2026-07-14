import type {
  StudentDistributionData,
  StudentDistributionFilters,
  StudentDistributionGroupBy,
} from "@/types/admin";

type MockRow = {
  university: string;
  major: string;
  count: number;
};

const MOCK_ROWS: MockRow[] = [
  {
    university: "جامعة الأزهر",
    major: "علوم الحاسوب",
    count: 85,
  },
  {
    university: "جامعة الأزهر",
    major: "نظم المعلومات",
    count: 48,
  },
  {
    university: "جامعة الأزهر",
    major: "الطب البشري",
    count: 38,
  },

  {
    university: "الجامعة الإسلامية ",
    major: "هندسة البرمجيات",
    count: 120,
  },
  {
    university: "الجامعة الإسلامية ",
    major: "الطب البشري",
    count: 60,
  },
  {
    university: "الجامعة الإسلامية ",
    major: "إدارة الأعمال",
    count: 42,
  },

  {
    university: "جامعة فلسطين",
    major: "هندسة البرمجيات",
    count: 35,
  },
  {
    university: "جامعة فلسطين",
    major: "هندسة الذكاء الاصطناعي",
    count: 55,
  },
  {
    university: "جامعة فلسطين",
    major: "طب وجراحة الفم والأسنان",
    count: 30,
  },

  {
    university: "جامعة القدس المفتوحة",
    major: "علوم الحاسوب",
    count: 42,
  },
  {
    university: "جامعة القدس المفتوحة",
    major: "أمن المعلومات",
    count: 35,
  },
  {
    university: "جامعة القدس المفتوحة",
    major: "إدارة الأعمال",
    count: 50,
  },

  {
    university: "جامعة الأقصى",
    major: "علم الحاسوب",
    count: 35,
  },
  {
    university: "جامعة الأقصى",
    major: "العلوم الطبية المخبرية",
    count: 25,
  },
  {
    university: "جامعة الأقصى",
    major: "الرياضيات",
    count: 20,
  },
];

function buildDistribution(
  groupBy: StudentDistributionGroupBy,
  groups: Map<string, number>,
): StudentDistributionData {
  const entries = [...groups.entries()]
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);

  const total = entries.reduce(
    (sum, [, count]) => sum + count,
    0,
  );

  return {
    groupBy,
    total,
    items: entries.slice(0, 6).map(([label, count]) => ({
      label,
      count,
      percentage:
        total > 0 ? Math.round((count / total) * 100) : 0,
    })),
  };
}

function addCount(
  groups: Map<string, number>,
  label: string,
  count: number,
) {
  const normalizedLabel = label.trim();

  groups.set(
    normalizedLabel,
    (groups.get(normalizedLabel) ?? 0) + count,
  );
}

export function getMockStudentDistribution(
  filters: StudentDistributionFilters,
): StudentDistributionData {
  const { university, major } = filters;

  if (university && major) {
    const universityRows = MOCK_ROWS.filter(
      (row) => row.university === university,
    );

    const selectedCount = universityRows
      .filter((row) => row.major === major)
      .reduce((sum, row) => sum + row.count, 0);

    const remainingCount = universityRows
      .filter((row) => row.major !== major)
      .reduce((sum, row) => sum + row.count, 0);

    return buildDistribution(
      "comparison",
      new Map([
        [major, selectedCount],
        ["باقي التخصصات", remainingCount],
      ]),
    );
  }

  const groups = new Map<string, number>();

  if (university) {
    MOCK_ROWS.filter(
      (row) => row.university === university,
    ).forEach((row) => {
      addCount(groups, row.major, row.count);
    });

    return buildDistribution("major", groups);
  }

  if (major) {
    MOCK_ROWS.filter((row) => row.major === major).forEach(
      (row) => {
        addCount(groups, row.university, row.count);
      },
    );

    return buildDistribution("university", groups);
  }

  MOCK_ROWS.forEach((row) => {
    addCount(groups, row.university, row.count);
  });

  return buildDistribution("university", groups);
}