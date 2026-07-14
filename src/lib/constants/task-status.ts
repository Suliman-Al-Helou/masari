
export const TASK_STATUS_DB = {
  PENDING:     'pending',
  IN_PROGRESS: 'in_progress',
  DONE:        'done',
} as const

export const TASK_STATUS_LABEL: Record<string, string> = {
  pending:     'قيد الانتظار',
  in_progress: 'قيد التنفيذ',
  done:        'مكتمل',
}