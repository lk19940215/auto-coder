// ==================== 任务相关类型 ====================

/** 任务状态 */
export type TaskStatus = 'todo' | 'in_progress' | 'completed'

/** 任务接口 */
export interface Task {
  id: string
  title: string
  description: string
  tagIds: string[]
  status: TaskStatus
  order: number
  createdAt: number
  updatedAt: number
}

/** 创建任务参数 */
export interface CreateTaskParams {
  title: string
  description?: string
  tagIds?: string[]
}

/** 更新任务参数 */
export interface UpdateTaskParams {
  title?: string
  description?: string
  tagIds?: string[]
  status?: TaskStatus
}

// ==================== 标签相关类型 ====================

/** 标签颜色配置 */
export interface TagColor {
  bg: string
  text: string
  border?: string
}

/** 标签接口 */
export interface Tag {
  id: string
  name: string
  icon: string
  color: TagColor
  isBuiltIn: boolean
  order: number
}

/** 创建标签参数 */
export interface CreateTagParams {
  name: string
  icon?: string
  color: TagColor
}

// ==================== 番茄钟相关类型 ====================

/** 番茄钟模式 */
export type PomodoroMode = 'work' | 'short_break' | 'long_break'

/** 番茄钟状态 */
export type PomodoroStatus = 'idle' | 'running' | 'paused'

/** 番茄钟会话 */
export interface PomodoroSession {
  id: string
  mode: PomodoroMode
  duration: number // 秒
  remainingTime: number // 剩余秒数
  taskId?: string
  startedAt?: number
  completedAt?: number
  status: PomodoroStatus
}

/** 今日番茄钟统计 */
export interface PomodoroStats {
  date: string // YYYY-MM-DD
  completedPomodoros: number
  totalWorkTime: number // 秒
  totalBreakTime: number // 秒
  taskStats: Record<string, number> // taskId -> 完成数量
}

/** 番茄钟配置 */
export interface PomodoroConfig {
  workDuration: number // 默认 25 分钟
  shortBreakDuration: number // 默认 5 分钟
  longBreakDuration: number // 默认 15 分钟
  longBreakInterval: number // 每 4 个番茄后长休息
}

// ==================== 应用状态类型 ====================

/** 标签筛选模式 */
export type TagFilterMode = 'all' | 'single' | 'multi'

/** 应用全局状态 */
export interface AppState {
  tasks: Task[]
  tags: Tag[]
  selectedTagIds: string[]
  tagFilterMode: TagFilterMode
  pomodoroSession: PomodoroSession | null
  pomodoroStats: PomodoroStats
}

// ==================== 拖拽相关类型 ====================

/** 拖拽项类型 */
export const DragItemType = {
  TASK: 'task',
} as const

/** 拖拽项 */
export interface DragItem {
  type: typeof DragItemType.TASK
  id: string
  index: number
}

/** 拖放结果 */
export interface DropResult {
  dragIndex: number
  hoverIndex: number
}