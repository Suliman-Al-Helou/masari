import { supabase } from '@/lib/db/client';
import { TASK_STATUS_DB } from '@/lib/constants/task-status';
import type {Student} from '@/types';
// ===== COURSES =====
export async function getCourses(userId: string) {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function addCourse(course: {
  user_id: string;
  name: string;
  code: string;
  credits: number;
  category: string;
  status: string;

   semester?: string;
  year?: string;
}) {
  const { data, error } = await supabase
    .from('courses')
    .insert(course)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCourse(id: string, updates: Partial<{
  name: string;
  code: string;
  credits: number;
  category: string;
  status: string;
  grade: string;
}>) {
  const { data, error } = await supabase
    .from('courses')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCourse(id: string) {
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getCourseById(userId: string, courseId: string) {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
}

// ===== TASKS =====
export async function getTasks(userId: string) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('due_date', { ascending: true });

  if (error) throw error;
  return data;
}

export async function addTask(task: {
  user_id: string;
  title: string;
  type: string;
  status: string;
  priority: string;
  due_date?: string;
  course_code?: string;
}) {
  const { data, error } = await supabase
    .from('tasks')
    .insert(task)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTask(id: string, updates: Partial<{
  status: string;
  priority: string;
  due_date: string;
}>) {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTask(id: string) {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ===== NOTES =====
export async function getNotesByCourse(userId: string, courseCode: string) {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .eq('course_code', courseCode)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function addNote(note: {
  user_id: string;
  course_code: string;
  title: string;
  content: string;
  tags: string[];
  link: string | null;
}) {
  const { data, error } = await supabase
    .from('notes')
    .insert({
      ...note,
      created_date: new Date().toISOString().split('T')[0],
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteNote(id: string) {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ===== DASHBOARD =====
export async function getDashboardStats(userId: string) {
  // نجلب المواد والمهام بشكل متوازٍ
  const [coursesRes, tasksRes] = await Promise.all([
   supabase.from('courses').select('id, name, code, status, credits, grade').eq('user_id', userId),
    supabase.from('tasks').select('id, status, priority, due_date, title, type, course_code').eq('user_id', userId),
  ]);

  if (coursesRes.error) throw coursesRes.error;
  if (tasksRes.error) throw tasksRes.error;

  const courses = coursesRes.data ?? [];
  const tasks = tasksRes.data ?? [];

  const completedCourses = courses.filter(c => c.status === 'مكتملة');
  const activeCourses = courses.filter(c => c.status === 'قيد الدراسة');
  const completedCredits = completedCourses.reduce((sum, c) => sum + (c.credits ?? 0), 0);
  const totalCredits = courses.reduce((sum, c) => sum + (c.credits ?? 0), 0);
  const progressPercent = totalCredits > 0 ? Math.round((completedCredits / totalCredits) * 100) : 0;

  const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === TASK_STATUS_DB.PENDING);
  const now = Date.now();
  const in48h = now + 48 * 60 * 60 * 1000;
  const urgentTasks = tasks.filter(t => {
    if (t.priority !== 'عالي' && t.priority !== 'high') return false;
    if (t.status === 'done' || t.status === 'مكتمل') return false;
    if (!t.due_date) return false;
    const due = new Date(t.due_date).getTime();
    return due <= in48h;
  });

  // المهام القادمة (خلال 7 أيام)
  const in7d = now + 7 * 24 * 60 * 60 * 1000;
  const upcomingTasks = tasks
    .filter(t => {
      if (t.status === 'done' || t.status === 'مكتمل') return false;
      if (!t.due_date) return false;
      const due = new Date(t.due_date).getTime();
      return due >= now && due <= in7d;
    })
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
    .slice(0, 5);

  // أقرب امتحان
  const nextExam = tasks
    .filter(t => (t.type === 'امتحان' || t.type === 'exam') && t.status !== 'done' && t.due_date)
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())[0];

  const daysToExam = nextExam?.due_date
    ? Math.max(0, Math.ceil((new Date(nextExam.due_date).getTime() - now) / (1000 * 60 * 60 * 24)))
    : null;

  return {
    completedCredits,
    totalCredits,
    completedCourses: completedCourses.length,
    activeCourses,
    progressPercent,
    pendingTasksCount: pendingTasks.length,
    urgentTasks,
    upcomingTasks,
    daysToExam,
    nextExamTitle: nextExam?.title ?? null,
  };
}

// ===== PROFILE =====
export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
};

export const updateProfile = async (userId: string, updates: {
  full_name?: string;
  university?: string;
  major?: string;
  semester?: string;
  total_credits?: number;
  onboarded?: boolean;
  degree_type?: string; // ✅ هاد كان ناقص
}) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);
  return { data, error };
};
// ===== MESSAGES =====
export type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
};

export async function getConversation(userId: string, otherId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(
      `and(sender_id.eq.${userId},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${userId})`
    )
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as Message[];
}

export async function sendMessage(senderId: string, receiverId: string, content: string): Promise<Message> {
  const { data, error } = await supabase
    .from('messages')
    .insert({ sender_id: senderId, receiver_id: receiverId, content: content.trim() })
    .select()
    .single();

  if (error) throw error;
  return data as Message;
}

export async function markMessagesRead(receiverId: string, senderId: string) {
  await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('receiver_id', receiverId)
    .eq('sender_id', senderId)
    .is('read_at', null);
}

export async function getUnreadCount(receiverId: string): Promise<Record<string, number>> {
  const { data } = await supabase
    .from('messages')
    .select('sender_id')
    .eq('receiver_id', receiverId)
    .is('read_at', null);

  const counts: Record<string, number> = {};
  (data ?? []).forEach(row => {
    counts[row.sender_id] = (counts[row.sender_id] ?? 0) + 1;
  });
  return counts;
}


/** جلب الطلاب من نفس التخصص + البحث بالاسم */
export async function getNetworkStudents(
  currentUserId: string,
  options: { major?: string; search?: string; university?: string } = {}
): Promise<Student []> {
  let query = supabase
    .from('profiles')
    .select('id, full_name, major, university, semester, show_in_network')
    .eq('show_in_network', true)
    .neq('id', currentUserId)
    .order('full_name', { ascending: true });

  if (options.university) query = query.eq('university', options.university);
  if (options.major) query = query.eq('major', options.major);
  if (options.search?.trim()) query = query.ilike('full_name', `%${options.search.trim()}%`);

  const { data, error } = await query.limit(50);
  if (error) throw error;
  return (data ?? []) as Student [];
}

/** دعوة طالب عبر الإيميل — تحفظ الدعوة في جدول invitations */
export async function inviteStudent(
  invitedBy: string,
  email: string
): Promise<{ token: string }> {
  const { data, error } = await supabase
    .from('invitations')
    .insert({ invited_by: invitedBy, email })
    .select('token')
    .single();

  if (error) throw error;
  return data as { token: string };
}

/** تحديث إعداد الظهور في الشبكة */
export async function updateNetworkVisibility(
  userId: string,
  visible: boolean
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ show_in_network: visible })
    .eq('id', userId);
  if (error) throw error;
}
// ===== NOTES (كل الملاحظات) =====
export async function getNotes(userId: string) {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .order('created_date', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

