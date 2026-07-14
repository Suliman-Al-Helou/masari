import type { AdminStats } from "@/types/admin";

export const ADMIN_STATS_MOCK: AdminStats = {
  totalStudents: 36,
  students: {
    value: 36,
    changePercent: 8.6,
    trendData: [2, 5, 4, 8, 6, 10, 9],
  },

  courses: {
    value: 1248,
    changePercent: 6.3,
    trendData: [5, 7, 6, 10, 8, 12, 11],
  },

  tasks: {
    value: 18732,
    changePercent: 12.4,
    trendData: [7, 11, 9, 14, 12, 17, 15],
  },

  notes: {
    value: 7352,
    changePercent: 9.1,
    trendData: [4, 6, 5, 9, 7, 11, 10],
  },

  messages: {
    value: 12548,
    changePercent: -3.8,
    trendData: [15, 13, 14, 10, 12, 8, 7],
  },
};