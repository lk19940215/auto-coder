import { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react'
import type { Task, CreateTaskParams, UpdateTaskParams, TaskStatus, DropResult } from '../types'
import { storage } from '../utils/storage'
import { STORAGE_KEYS } from '../types/constants'

// ==================== 类型定义 ====================

/** 任务状态 */
interface TaskState {
  tasks: Task[]
  isLoading: boolean
}

/** 任务 Action 类型 */
type TaskAction =
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: UpdateTaskParams } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'REORDER_TASKS'; payload: Task[] }
  | { type: 'SET_LOADING'; payload: boolean }

/** 任务上下文值 */
interface TaskContextValue {
  state: TaskState
  actions: {
    addTask: (params: CreateTaskParams) => void
    updateTask: (id: string, updates: UpdateTaskParams) => void
    deleteTask: (id: string) => void
    toggleTaskStatus: (id: string) => void
    reorderTasks: (dragIndex: number, hoverIndex: number) => void
    getTaskById: (id: string) => Task | undefined
    getTasksByStatus: (status: TaskStatus) => Task[]
    getTasksByTag: (tagId: string) => Task[]
    clearCompletedTasks: () => void
  }
}

// ==================== 初始状态 ====================

const initialState: TaskState = {
  tasks: [],
  isLoading: true,
}

// ==================== Reducer ====================

function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'SET_TASKS':
      return {
        ...state,
        tasks: action.payload,
        isLoading: false,
      }

    case 'ADD_TASK':
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
      }

    case 'UPDATE_TASK': {
      const { id, updates } = action.payload
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === id
            ? { ...task, ...updates, updatedAt: Date.now() }
            : task
        ),
      }
    }

    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload),
      }

    case 'REORDER_TASKS':
      return {
        ...state,
        tasks: action.payload,
      }

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      }

    default:
      return state
  }
}

// ==================== Context ====================

const TaskContext = createContext<TaskContextValue | null>(null)

// ==================== Provider ====================

interface TaskProviderProps {
  children: React.ReactNode
}

/** 生成唯一 ID */
function generateId(): string {
  return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function TaskProvider({ children }: TaskProviderProps) {
  const [state, dispatch] = useReducer(taskReducer, initialState)

  // 初始化：从 localStorage 加载任务
  useEffect(() => {
    const savedTasks = storage.getTyped(STORAGE_KEYS.TASKS, [])
    dispatch({ type: 'SET_TASKS', payload: savedTasks })
  }, [])

  // 自动保存：任务变化时持久化
  useEffect(() => {
    if (!state.isLoading) {
      storage.setTyped(STORAGE_KEYS.TASKS, state.tasks)
    }
  }, [state.tasks, state.isLoading])

  // ==================== Actions ====================

  const addTask = useCallback((params: CreateTaskParams) => {
    const now = Date.now()
    const newTask: Task = {
      id: generateId(),
      title: params.title,
      description: params.description || '',
      tagIds: params.tagIds || [],
      status: 'todo',
      order: state.tasks.length,
      createdAt: now,
      updatedAt: now,
    }
    dispatch({ type: 'ADD_TASK', payload: newTask })
  }, [state.tasks.length])

  const updateTask = useCallback((id: string, updates: UpdateTaskParams) => {
    dispatch({ type: 'UPDATE_TASK', payload: { id, updates } })
  }, [])

  const deleteTask = useCallback((id: string) => {
    dispatch({ type: 'DELETE_TASK', payload: id })
  }, [])

  const toggleTaskStatus = useCallback((id: string) => {
    const task = state.tasks.find((t) => t.id === id)
    if (!task) return

    const statusFlow: Record<TaskStatus, TaskStatus> = {
      todo: 'in_progress',
      in_progress: 'completed',
      completed: 'todo',
    }

    dispatch({
      type: 'UPDATE_TASK',
      payload: { id, updates: { status: statusFlow[task.status] } },
    })
  }, [state.tasks])

  const reorderTasks = useCallback((dragIndex: number, hoverIndex: number) => {
    const newTasks = [...state.tasks]
    const [draggedTask] = newTasks.splice(dragIndex, 1)
    newTasks.splice(hoverIndex, 0, draggedTask)

    // 更新 order 字段
    const reorderedTasks = newTasks.map((task, index) => ({
      ...task,
      order: index,
    }))

    dispatch({ type: 'REORDER_TASKS', payload: reorderedTasks })
  }, [state.tasks])

  const getTaskById = useCallback((id: string) => {
    return state.tasks.find((task) => task.id === id)
  }, [state.tasks])

  const getTasksByStatus = useCallback((status: TaskStatus) => {
    return state.tasks
      .filter((task) => task.status === status)
      .sort((a, b) => a.order - b.order)
  }, [state.tasks])

  const getTasksByTag = useCallback((tagId: string) => {
    return state.tasks
      .filter((task) => task.tagIds.includes(tagId))
      .sort((a, b) => a.order - b.order)
  }, [state.tasks])

  const clearCompletedTasks = useCallback(() => {
    const activeTasks = state.tasks.filter((task) => task.status !== 'completed')
    dispatch({ type: 'SET_TASKS', payload: activeTasks })
  }, [state.tasks])

  // ==================== Context Value ====================

  const value = useMemo<TaskContextValue>(() => ({
    state,
    actions: {
      addTask,
      updateTask,
      deleteTask,
      toggleTaskStatus,
      reorderTasks,
      getTaskById,
      getTasksByStatus,
      getTasksByTag,
      clearCompletedTasks,
    },
  }), [
    state,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    reorderTasks,
    getTaskById,
    getTasksByStatus,
    getTasksByTag,
    clearCompletedTasks,
  ])

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  )
}

// ==================== Hook ====================

export function useTaskContext(): TaskContextValue {
  const context = useContext(TaskContext)
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider')
  }
  return context
}

// ==================== 拖拽排序辅助函数 ====================

/**
 * 计算拖放后的新顺序
 */
export function calculateDropResult(
  tasks: Task[],
  dragId: string,
  hoverId: string
): DropResult | null {
  const dragIndex = tasks.findIndex((t) => t.id === dragId)
  const hoverIndex = tasks.findIndex((t) => t.id === hoverId)

  if (dragIndex === -1 || hoverIndex === -1) {
    return null
  }

  return { dragIndex, hoverIndex }
}

/**
 * 检查是否可以拖放
 */
export function canDrop(
  dragIndex: number,
  hoverIndex: number,
  tasks: Task[]
): boolean {
  return (
    dragIndex >= 0 &&
    hoverIndex >= 0 &&
    dragIndex < tasks.length &&
    hoverIndex < tasks.length &&
    dragIndex !== hoverIndex
  )
}