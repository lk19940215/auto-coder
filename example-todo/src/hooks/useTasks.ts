import { useCallback, useMemo } from 'react'
import { useTaskContext } from '../context/TaskContext'
import type { Task, CreateTaskParams, UpdateTaskParams, TaskStatus } from '../types'

/**
 * 任务管理 Hook
 * 封装任务的增删改查、排序、状态切换逻辑
 */
export function useTasks() {
  const { state, actions } = useTaskContext()

  // 获取排序后的任务列表
  const sortedTasks = useMemo(() => {
    return [...state.tasks].sort((a, b) => a.order - b.order)
  }, [state.tasks])

  // 获取各状态任务数量
  const taskCounts = useMemo(() => {
    const counts = {
      total: state.tasks.length,
      todo: 0,
      in_progress: 0,
      completed: 0,
    }

    state.tasks.forEach((task) => {
      counts[task.status]++
    })

    return counts
  }, [state.tasks])

  // 获取活跃任务（非已完成）
  const activeTasks = useMemo(() => {
    return sortedTasks.filter((task) => task.status !== 'completed')
  }, [sortedTasks])

  // 获取已完成任务
  const completedTasks = useMemo(() => {
    return sortedTasks.filter((task) => task.status === 'completed')
  }, [sortedTasks])

  // 添加任务
  const addTask = useCallback((params: CreateTaskParams) => {
    if (!params.title.trim()) {
      console.warn('Task title cannot be empty')
      return
    }
    actions.addTask(params)
  }, [actions])

  // 更新任务
  const updateTask = useCallback((id: string, updates: UpdateTaskParams) => {
    if (updates.title !== undefined && !updates.title.trim()) {
      console.warn('Task title cannot be empty')
      return
    }
    actions.updateTask(id, updates)
  }, [actions])

  // 删除任务
  const deleteTask = useCallback((id: string) => {
    actions.deleteTask(id)
  }, [actions])

  // 切换任务状态
  const toggleTaskStatus = useCallback((id: string) => {
    actions.toggleTaskStatus(id)
  }, [actions])

  // 设置任务状态
  const setTaskStatus = useCallback((id: string, status: TaskStatus) => {
    actions.updateTask(id, { status })
  }, [actions])

  // 拖拽排序
  const reorderTasks = useCallback((dragIndex: number, hoverIndex: number) => {
    actions.reorderTasks(dragIndex, hoverIndex)
  }, [actions])

  // 根据 ID 获取任务
  const getTaskById = useCallback((id: string): Task | undefined => {
    return actions.getTaskById(id)
  }, [actions])

  // 根据状态获取任务
  const getTasksByStatus = useCallback((status: TaskStatus): Task[] => {
    return actions.getTasksByStatus(status)
  }, [actions])

  // 根据标签获取任务
  const getTasksByTag = useCallback((tagId: string): Task[] => {
    return actions.getTasksByTag(tagId)
  }, [actions])

  // 根据多个标签获取任务（并集）
  const getTasksByTags = useCallback((tagIds: string[]): Task[] => {
    if (tagIds.length === 0) return sortedTasks

    return sortedTasks.filter((task) =>
      task.tagIds.some((tagId) => tagIds.includes(tagId))
    )
  }, [sortedTasks])

  // 清除已完成任务
  const clearCompletedTasks = useCallback(() => {
    actions.clearCompletedTasks()
  }, [actions])

  // 搜索任务
  const searchTasks = useCallback((query: string): Task[] => {
    const lowerQuery = query.toLowerCase().trim()
    if (!lowerQuery) return sortedTasks

    return sortedTasks.filter(
      (task) =>
        task.title.toLowerCase().includes(lowerQuery) ||
        task.description.toLowerCase().includes(lowerQuery)
    )
  }, [sortedTasks])

  // 检查任务是否存在
  const taskExists = useCallback((id: string): boolean => {
    return state.tasks.some((task) => task.id === id)
  }, [state.tasks])

  // 获取任务索引
  const getTaskIndex = useCallback((id: string): number => {
    return sortedTasks.findIndex((task) => task.id === id)
  }, [sortedTasks])

  return {
    // 状态
    tasks: sortedTasks,
    isLoading: state.isLoading,
    taskCounts,
    activeTasks,
    completedTasks,

    // 操作
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    setTaskStatus,
    reorderTasks,
    clearCompletedTasks,

    // 查询
    getTaskById,
    getTaskIndex,
    getTasksByStatus,
    getTasksByTag,
    getTasksByTags,
    searchTasks,
    taskExists,
  }
}

/**
 * 单个任务操作 Hook
 * 用于操作特定任务
 */
export function useTask(taskId: string) {
  const { state, actions } = useTaskContext()

  const task = useMemo(() => {
    return state.tasks.find((t) => t.id === taskId)
  }, [state.tasks, taskId])

  const updateTask = useCallback((updates: UpdateTaskParams) => {
    actions.updateTask(taskId, updates)
  }, [actions, taskId])

  const deleteTask = useCallback(() => {
    actions.deleteTask(taskId)
  }, [actions, taskId])

  const toggleStatus = useCallback(() => {
    actions.toggleTaskStatus(taskId)
  }, [actions, taskId])

  const setStatus = useCallback((status: TaskStatus) => {
    actions.updateTask(taskId, { status })
  }, [actions, taskId])

  const addTag = useCallback((tagId: string) => {
    if (!task) return
    if (task.tagIds.includes(tagId)) return

    actions.updateTask(taskId, {
      tagIds: [...task.tagIds, tagId],
    })
  }, [actions, taskId, task])

  const removeTag = useCallback((tagId: string) => {
    if (!task) return

    actions.updateTask(taskId, {
      tagIds: task.tagIds.filter((id) => id !== tagId),
    })
  }, [actions, taskId, task])

  return {
    task,
    exists: !!task,
    updateTask,
    deleteTask,
    toggleStatus,
    setStatus,
    addTag,
    removeTag,
  }
}