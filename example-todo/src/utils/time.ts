/**
 * 时间格式化和倒计时工具函数
 */

/**
 * 格式化秒数为 mm:ss 格式
 * @param seconds 秒数
 * @returns 格式化后的时间字符串
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * 格式化秒数为 mm:ss 或 hh:mm:ss 格式（根据时长自动选择）
 * @param seconds 秒数
 * @returns 格式化后的时间字符串
 */
export function formatTimeAuto(seconds: number): string {
  if (seconds >= 3600) {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return formatTime(seconds)
}

/**
 * 格式化秒数为可读文本（如 "25分钟"）
 * @param seconds 秒数
 * @returns 可读时间文本
 */
export function formatTimeReadable(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)

  if (hours > 0 && mins > 0) {
    return `${hours}小时${mins}分钟`
  }
  if (hours > 0) {
    return `${hours}小时`
  }
  if (mins > 0) {
    return `${mins}分钟`
  }
  return `${seconds}秒`
}

/**
 * 计算两个时间戳之间的秒数
 * @param start 开始时间戳
 * @param end 结束时间戳
 * @returns 秒数
 */
export function getElapsedSeconds(start: number, end: number): number {
  return Math.floor((end - start) / 1000)
}

/**
 * 获取今日开始时间戳（零点）
 * @returns 今日零点时间戳
 */
export function getTodayStartTimestamp(): number {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return now.getTime()
}

/**
 * 获取今日结束时间戳（次日零点）
 * @returns 今日结束时间戳
 */
export function getTodayEndTimestamp(): number {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  return tomorrow.getTime()
}

/**
 * 检查时间戳是否为今天
 * @param timestamp 时间戳
 * @returns 是否为今天
 */
export function isToday(timestamp: number): boolean {
  const date = new Date(timestamp)
  const today = new Date()
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  )
}

/**
 * 生成唯一 ID
 * @returns 唯一 ID 字符串
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 计算进度百分比
 * @param remaining 剩余时间（秒）
 * @param total 总时间（秒）
 * @returns 进度百分比 (0-100)
 */
export function calculateProgress(remaining: number, total: number): number {
  if (total <= 0) return 0
  const elapsed = total - remaining
  return Math.min(100, Math.max(0, (elapsed / total) * 100))
}

/**
 * 创建倒计时器（使用 requestAnimationFrame 实现精确计时）
 * @param duration 总时长（秒）
 * @param onTick 每秒回调
 * @param onComplete 完成回调
 * @returns 控制对象
 */
export function createTimer(
  duration: number,
  onTick: (remaining: number) => void,
  onComplete: () => void
) {
  let remainingTime = duration
  let lastTimestamp = 0
  let rafId: number | null = null
  let isPaused = false

  const tick = (timestamp: number) => {
    if (isPaused) {
      lastTimestamp = timestamp
      rafId = requestAnimationFrame(tick)
      return
    }

    if (lastTimestamp === 0) {
      lastTimestamp = timestamp
    }

    const elapsed = (timestamp - lastTimestamp) / 1000

    if (elapsed >= 1) {
      remainingTime -= Math.floor(elapsed)
      lastTimestamp = timestamp

      if (remainingTime <= 0) {
        remainingTime = 0
        onTick(0)
        onComplete()
        return
      }

      onTick(remainingTime)
    }

    rafId = requestAnimationFrame(tick)
  }

  const start = () => {
    if (rafId !== null) return
    isPaused = false
    lastTimestamp = 0
    onTick(remainingTime)
    rafId = requestAnimationFrame(tick)
  }

  const pause = () => {
    isPaused = true
  }

  const resume = () => {
    isPaused = false
    lastTimestamp = 0
  }

  const reset = (newDuration?: number) => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
    remainingTime = newDuration ?? duration
    lastTimestamp = 0
    isPaused = false
  }

  const stop = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }

  return {
    start,
    pause,
    resume,
    reset,
    stop,
    getRemainingTime: () => remainingTime,
  }
}