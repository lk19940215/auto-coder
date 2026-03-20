import type { Tag, PomodoroConfig, TaskStatus, PomodoroMode } from './index'

// ==================== 任务状态配置 ====================

/** 任务状态配置 */
export const TASK_STATUS_CONFIG: Record<TaskStatus, { label: string; color: string }> = {
  todo: { label: '待办', color: '#6B7280' },
  in_progress: { label: '进行中', color: '#F59E0B' },
  completed: { label: '已完成', color: '#5A9A6D' },
}

// ==================== 内置标签 ====================

/** 内置标签 ID */
export const BUILTIN_TAG_IDS = {
  ALL: 'tag-all',
  WORK: 'tag-work',
  PERSONAL: 'tag-personal',
  STUDY: 'tag-study',
} as const

/** 内置标签配置 */
export const BUILTIN_TAGS: Tag[] = [
  {
    id: BUILTIN_TAG_IDS.WORK,
    name: '工作',
    icon: '💼',
    color: {
      bg: '#5A9A6D20',
      text: '#5A9A6D',
      border: '#5A9A6D55',
    },
    isBuiltIn: true,
    order: 1,
  },
  {
    id: BUILTIN_TAG_IDS.PERSONAL,
    name: '个人',
    icon: '🏠',
    color: {
      bg: '#F59E0B20',
      text: '#F59E0B',
      border: '#F59E0B55',
    },
    isBuiltIn: true,
    order: 2,
  },
  {
    id: BUILTIN_TAG_IDS.STUDY,
    name: '学习',
    icon: '📚',
    color: {
      bg: '#10B98120',
      text: '#10B981',
      border: '#10B98155',
    },
    isBuiltIn: true,
    order: 3,
  },
]

// ==================== 番茄钟默认配置 ====================

/** 默认番茄钟配置 */
export const DEFAULT_POMODORO_CONFIG: PomodoroConfig = {
  workDuration: 25 * 60, // 25 分钟
  shortBreakDuration: 5 * 60, // 5 分钟
  longBreakDuration: 15 * 60, // 15 分钟
  longBreakInterval: 4, // 每 4 个番茄后长休息
}

/** 番茄钟模式显示文本 */
export const POMODORO_MODE_LABELS: Record<PomodoroMode, string> = {
  work: '专注中...',
  short_break: '短休息',
  long_break: '长休息',
}

/** 番茄钟模式颜色 */
export const POMODORO_MODE_COLORS: Record<PomodoroMode, string> = {
  work: '#5A9A6D',
  short_break: '#60A5FA',
  long_break: '#8B5CF6',
}

// ==================== Storage Keys ====================

/** localStorage 存储键 */
export const STORAGE_KEYS = {
  TASKS: 'flowtask_tasks',
  TAGS: 'flowtask_tags',
  POMODORO_SESSION: 'flowtask_pomodoro_session',
  POMODORO_STATS: 'flowtask_pomodoro_stats',
  POMODORO_CONFIG: 'flowtask_pomodoro_config',
} as const

// ==================== 时间常量 ====================

/** 一天的毫秒数 */
export const ONE_DAY_MS = 24 * 60 * 60 * 1000

/** 获取今日日期字符串 (YYYY-MM-DD) */
export function getTodayString(): string {
  return new Date().toISOString().split('T')[0]
}