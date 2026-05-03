import { supabase } from './supabase';

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