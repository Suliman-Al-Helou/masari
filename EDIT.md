# 📘 دليل تطوير مشروع "مساري" — قواعد وإرشادات التعديل

> مبني على تحليل كامل للمشروع — يُستخدم كمرجع عند أي تعديل أو إضافة

---

## 1. هيكل المشروع

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Dashboard / الرئيسية
│   ├── academic-path/
│   ├── semester-plan/
│   ├── students/
│   ├── course/[id]/
│   ├── profile/
│   ├── login/
│   ├── onboarding/
│   ├── register/           # يعيد توجيه فقط إلى /login?invite=token
│   ├── support/
│   └── verify-email/
│
├── components/
│   ├── layout/             # AppLayout, Sidebar, TopBar
│   ├── auth/               # AuthGuard, ProtectedRoute
│   ├── dashboard/          # 8 مكونات
│   ├── academic-path/      # 6 مكونات
│   ├── semester-plan/      # 6 مكونات
│   ├── students/           # 7 مكونات + Chat
│   ├── courses/            # CourseNotes, NoteCard
│   ├── landing/
│   └── support/
│
└── lib/
    ├── api.ts              # كل Supabase API calls هنا فقط
    ├── supabase.ts         # Supabase client — لا تعدّل عليه
    ├── auth.ts             # دوال المصادقة
    ├── gpa.ts              # حساب GPA
    ├── exportTranscript.ts # تصدير PDF
    ├── context/            # AuthContext, ToastContext
    ├── hooks/              # useAuth, useDashboard, useFormField
    └── constants/          # navigation, dashboard, semester-plan, students
```

---

## 2. قاعدة البيانات (Supabase Tables)

| الجدول        | الأعمدة الرئيسية                                                                                   |
| ------------- | -------------------------------------------------------------------------------------------------- |
| `profiles`    | id, full_name, university, major, semester, total_credits, onboarded, show_in_network, degree_type |
| `courses`     | id, user_id, name, code, credits, category, status, grade                                          |
| `tasks`       | id, user_id, title, type, status, priority, due_date, course_code                                  |
| `notes`       | id, user_id, course_code, title, content, tags, link, created_date                                 |
| `messages`    | id, sender_id, receiver_id, content, read_at, created_at                                           |
| `invitations` | id, invited_by, email, token                                                                       |

---

## 3. قواعد المصادقة والتوجيه

### تدفق المستخدم

```
زيارة الموقع
    ↓
AuthGuard يتحقق من الجلسة
    ↓
غير مسجل → LandingPage أو /login
مسجل + onboarded = false → /onboarding
مسجل + onboarded = true → Dashboard
```

### الصفحات العامة (لا تحتاج مصادقة)

```ts
const PUBLIC_ROUTES = ["/login", "/verify-email", "/"];
```

### الصفحات بدون Layout

```ts
const NO_LAYOUT_ROUTES = ["/login", "/verify-email", "/onboarding"];
```

### قواعد ثابتة

- لا تضيف صفحة محمية بدون إضافة AuthGuard عليها
- كل صفحة جديدة تحتاج مصادقة → تأكد أنها **ليست** في `PUBLIC_ROUTES`
- لو أضفت صفحة بدون sidebar/topbar → أضفها في `NO_LAYOUT_ROUTES`

---

## 4. قواعد Data Fetching — المكتبات الجديدة

### ✅ استخدم React Query لكل البيانات من Supabase

**تثبيت:**

```bash
npm install @tanstack/react-query
```

**إعداد Provider في layout.tsx:**

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

// داخل RootLayout
<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
```

**النمط الصحيح للـ Fetch:**

```ts
// ✅ صح
const { data, isLoading, error } = useQuery({
  queryKey: ['courses', user.id],
  queryFn: () => getCourses(user.id),
  enabled: !!user,
});

// ❌ غلط — لا تكتب هيك بعد الآن
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
useEffect(() => { fetch()... }, [user]);
```

**النمط الصحيح للـ Mutations:**

```ts
const mutation = useMutation({
  mutationFn: (course) => addCourse(course),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["courses"] }),
});
```

**مفاتيح الـ Query Keys — اتبع هيك التسمية:**

```ts
["courses", userId][("tasks", userId)][("notes", userId, courseCode)][
  ("dashboard", userId)
][("students", userId, { major, search })][("profile", userId)][
  ("messages", userId, otherId)
][("unread", userId)];
```

---

## 5. قواعد الـ Forms

### ✅ استخدم React Hook Form + Zod لكل form جديد

**تثبيت:**

```bash
npm install react-hook-form @hookform/resolvers zod
```

**النمط الصحيح:**

```ts
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  credits: z.number().min(1).max(6),
});

type FormData = z.infer<typeof schema>;

const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm<FormData>({
  resolver: zodResolver(schema),
});
```

**لا تكتب validation يدوي بعد الآن:**

```ts
// ❌ غلط
if (!name.trim()) {
  setError("الاسم مطلوب");
  return;
}

// ✅ صح — Zod يتكفل بهيك
```

---

## 6. قواعد التاريخ والوقت

**تثبيت:**

```bash
npm install date-fns
```

**استخدم date-fns بدل الحسابات اليدوية:**

```ts
// ❌ غلط
const in48h = now + 48 * 60 * 60 * 1000;
const due = new Date(t.due_date).getTime();
return due <= in48h;

// ✅ صح
import { isWithinInterval, addHours, addDays } from "date-fns";
isWithinInterval(dueDate, { start: new Date(), end: addHours(new Date(), 48) });
```

---

## 7. قواعد الـ API Layer

### كل الـ API calls تمر عبر `lib/api.ts` فقط

```ts
// ❌ غلط — استدعاء Supabase مباشرة من الصفحة
const { data } = await supabase.from("courses").select("*").eq("id", id);

// ✅ صح — دالة في api.ts ثم تستدعيها من الصفحة
// في api.ts:
export async function getCourseById(userId: string, courseId: string) {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .eq("user_id", userId)
    .single();
  if (error) throw error;
  return data;
}
```

> ⚠️ استثناء موجود حالياً: `course/[id]/page.tsx` يستدعي Supabase مباشرة — يجب تصحيحه

---

## 8. قواعد الـ State Management

### متى تستخدم كل نوع:

| النوع             | متى                                          |
| ----------------- | -------------------------------------------- |
| `useState`        | UI state فقط (open/close modal، input value) |
| React Query       | أي بيانات من Supabase                        |
| `AuthContext`     | بيانات المستخدم — لا تعيد إنشاؤها            |
| `ToastContext`    | الإشعارات — استخدم `useToast()`              |
| `useSearchParams` | فلاتر البحث في URL                           |
| Zustand           | ❌ لا تضيفها — المشروع لا يحتاجها            |

---

## 9. قواعد الـ Realtime (الرسائل)

**بدّل الـ polling الحالي بـ Supabase Realtime:**

```ts
// ❌ الطريقة الحالية
const interval = setInterval(fetchUnread, 30_000);

// ✅ الطريقة الصحيحة
const channel = supabase
  .channel("messages")
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "messages",
      filter: `receiver_id=eq.${userId}`,
    },
    () => {
      queryClient.invalidateQueries({ queryKey: ["unread", userId] });
    },
  )
  .subscribe();

return () => supabase.removeChannel(channel);
```

---

## 10. قواعد البيانات المكررة — لا تكررها

### المشكلة الحالية:

`UNIVERSITIES` و`MAJORS` و`MAJOR_YEARS` مكررة في:

- `app/onboarding/page.tsx`
- `app/profile/page.tsx`

### الحل:

```ts
// أنشئ: src/lib/constants/academic.ts
export const UNIVERSITIES = [...];
export const MAJORS = [...];
export const MAJOR_YEARS: Record<string, string[]> = {...};
export const DEFAULT_YEARS = [...];
export const SEMESTERS = [...];
export const getYearsForMajor = (major: string) => MAJOR_YEARS[major] ?? DEFAULT_YEARS;
```

ثم استوردها في كلا الصفحتين.

---

## 11. قواعد التصميم والـ Styling

### نظام الألوان — استخدم CSS Variables دائماً

```ts
// ✅ صح
className = "bg-primary text-primary-foreground";
className = "bg-card border-border";
className = "text-muted-foreground";

// ❌ غلط — لا تستخدم ألوان Tailwind مباشرة للعناصر الرئيسية
className = "bg-purple-600 text-white";
```

### الألوان المتاحة

```
--primary          اللون الرئيسي (بنفسجي)
--background       خلفية الصفحة
--card             خلفية البطاقات
--foreground       النص الرئيسي
--muted-foreground النص الثانوي
--border           الحدود
--destructive      الأحمر / الحذف
--success          الأخضر
--warning          الأصفر
--info             الأزرق
```

### RTL — قواعد ثابتة

- `dir="rtl"` موجود على `<html>` — لا تحتاج تضيفه لكل عنصر
- للعناصر اللي فيها كود/رقم → أضف `dir="ltr"` عليها فقط:
  ```tsx
  <p dir="ltr">{course.code}</p>
  ```
- اتجاه الـ icons: `ChevronRight` للرجوع (RTL) وليس `ChevronLeft`

### الخط

- الخط الوحيد: **Tajawal** عبر `var(--font-main)` أو `font-sans`
- لا تضيف خطوط جديدة بدون إضافتها في `layout.tsx`

---

## 12. قواعد المكونات

### هيكل المكون الجديد

```tsx
'use client'; // فقط لو يحتاج browser APIs أو hooks

// 1. imports
import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';

// 2. Types محلية
type Props = { ... };

// 3. المكون
export default function MyComponent({ prop }: Props) {
  // hooks أولاً
  const { user } = useAuth();

  // ثم handlers

  // ثم JSX
  return (...);
}
```

### قواعد عامة

- كل مكون في مجلده الخاص تحت `components/`
- لو المكون يُستخدم بصفحة وحدة → ضعه في مجلد تلك الصفحة
- لو يُستخدم بأكثر من صفحة → ضعه في `components/shared/` (أو أنشئ هيك مجلد)
- لا تكتب منطق API داخل المكون — المنطق في الصفحة أو الـ hook

---

## 13. أنواع المهام والحالات — لا تغيّرها

### حالات المواد (courses.status)

```
'مكتملة' | 'قيد الدراسة' | 'متبقية' | 'مخطط لها'
```

### حالات المهام (tasks.status)

```
'pending' | 'done'
```

> ملاحظة: الكود الحالي يفحص أيضاً `'قيد الانتظار'` و`'مكتمل'` للتوافق القديم

### أنواع المهام (tasks.type)

```
'واجب' | 'مشروع' | 'امتحان' | 'مذاكرة'
```

### أولوية المهام (tasks.priority)

```
'عالي' | 'متوسط' | 'منخفض'
```

---

## 14. حساب GPA — قواعد ثابتة

الدالة موجودة في `lib/gpa.ts` — استخدمها ولا تعيد كتابتها:

```ts
import { calculateGPA } from "@/lib/gpa";

const { gpa, completedCredits, gradedCredits } = calculateGPA(courses);
```

تدعم:

- حروف: `A+, A, A-, B+, B, ...`
- أرقام: `0-100` تُحوّل تلقائياً

---

## 15. تصدير PDF

الدالة موجودة في `lib/exportTranscript.ts`:

```ts
import { exportTranscriptPDF } from "@/lib/exportTranscript";

await exportTranscriptPDF(courses, profile);
```

> ⚠️ jsPDF لا يدعم العربية مباشرة — الـ labels بالإنجليزي، القيم بالعربي

---

## 16. Toast Notifications

```ts
const toast = useToast();

toast.success("العنوان", "الرسالة");
toast.error("خطأ", "تفاصيل الخطأ");
toast.info("معلومة", "الرسالة");
```

---

## 17. قائمة المكتبات المطلوب تثبيتها

```bash
# أولوية عالية
npm install @tanstack/react-query
npm install zod
npm install react-hook-form @hookform/resolvers

# أولوية متوسطة
npm install date-fns
npm install nuqs

# اختيارية
npm install sonner
```

---

## 18. قائمة المشاكل الحالية للتصحيح

| المشكلة                    | الملف                              | الإصلاح                               |
| -------------------------- | ---------------------------------- | ------------------------------------- |
| Supabase مباشرة في الصفحة  | `app/course/[id]/page.tsx`         | نقل الـ query إلى `api.ts`            |
| تكرار UNIVERSITIES/MAJORS  | `onboarding/` و `profile/`         | نقلها إلى `lib/constants/academic.ts` |
| Polling يدوي للرسائل       | `TopBar.tsx` و `students/page.tsx` | استبدال بـ Supabase Realtime          |
| Data fetching pattern قديم | كل الصفحات                         | استبدال بـ React Query                |
| Forms بدون validation      | AddCourseDialog, AddTaskDialog     | إضافة Zod + React Hook Form           |
| حسابات تاريخ يدوية         | `api.ts` في getDashboardStats      | استبدال بـ date-fns                   |

---

## 19. قواعد عامة لا تُكسر

1. **لا تضيف Zustand** — المشروع لا يحتاجها
2. **لا تستدعي Supabase مباشرة من الصفحات** — كل شيء عبر `lib/api.ts`
3. **لا تكرر البيانات الثابتة** — الثوابت في `lib/constants/`
4. **لا تكتب fetch pattern يدوي جديد** — استخدم React Query
5. **لا تكتب validation يدوي** — استخدم Zod
6. **لا تغير أسماء الحالات العربية** — `'مكتملة'`, `'قيد الدراسة'` إلخ
7. **الـ Auth يمر دائماً عبر `useAuth()`** — لا تستدعي `supabase.auth` مباشرة من المكونات
