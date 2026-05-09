import Link from 'next/link';

type Course = {
  id: string;
  name: string;
  code: string;
};

const PILL_COLORS = [
  'bg-blue-100 text-blue-700 hover:bg-blue-200',
  'bg-purple-100 text-purple-700 hover:bg-purple-200',
  'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
  'bg-amber-100 text-amber-700 hover:bg-amber-200',
  'bg-rose-100 text-rose-700 hover:bg-rose-200',
  'bg-indigo-100 text-indigo-700 hover:bg-indigo-200',
];

interface CurrentCoursesProps {
  courses: Course[];
}

export default function CurrentCourses({ courses }: CurrentCoursesProps) {
  if (courses.length === 0) return null;

  return (
    <div className="rounded-2xl bg-card border border-border/50 p-5">
      <h3 className="font-bold text-foreground mb-4">المواد الحالية</h3>
      <div className="flex flex-wrap gap-2">
        {courses.map((course, i) => (
          <Link
            key={course.id}
            href={`/course/${course.id}`}
            className={`${PILL_COLORS[i % PILL_COLORS.length]} px-4 py-2 rounded-xl text-xs font-medium transition-colors`}
          >
            {course.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
