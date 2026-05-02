import { COURSES } from '@/lib/constants/dashboard';

export default function CurrentCourses() {
  return (
    <div className="rounded-2xl bg-card border border-border/50 p-5">
      <h3 className="font-bold text-foreground mb-4">المواد الحالية</h3>
      <div className="flex flex-wrap gap-2">
        {COURSES.map((course) => (
          <span
            key={course.code}
            className={`${course.color} px-4 py-2 rounded-xl text-xs font-medium cursor-pointer hover:opacity-90 transition-opacity`}
          >
            {course.name}
          </span>
        ))}
      </div>
    </div>
  );
}