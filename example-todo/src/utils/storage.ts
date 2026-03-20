import { STORAGE_KEYS } from '../types/constants'
import type { Task, Tag, PomodoroSession, PomodoroStats, PomodoroConfig } from '../types'

/**
 * localStorage 数据持久化工具
 * 提供类型安全的本地存储操作，支持自动序列化/反序列化和错误处理
 */

/** 存储键类型映射 */
type StorageKeyMap = {
  [STORAGE_KEYS.TASKS]: Task[]
  [STORAGE_KEYS.TAGS]: Tag[]
  [STORAGE_KEYS.POMODORO_SESSION]: PomodoroSession | null
  [STORAGE_KEYS.POMODORO_STATS]: PomodoroStats
  [STORAGE_KEYS.POMODORO_CONFIG]: PomodoroConfig
}

/** 存储键类型 */
type StorageKey = keyof StorageKeyMap

/** 存储错误类型 */
export class StorageError extends Error {
  constructor(
    message: string,
    public readonly operation: 'get' | 'set' | 'remove' | 'clear',
    public readonly key?: string,
    public readonly originalError?: unknown
  ) {
    super(message)
    this.name = 'StorageError'
  }
}

/**
 * 检查 localStorage 是否可用
 */
function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__'
    window.localStorage.setItem(testKey, testKey)
    window.localStorage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}

/**
 * LocalStorage 服务类
 * 提供类型安全的本地存储操作
 */
class LocalStorageService {
  private available: boolean
  private prefix: string

  constructor(prefix: string = '') {
    this.prefix = prefix
    this.available = typeof window !== 'undefined' && isLocalStorageAvailable()
  }

  /**
   * 获取完整的存储键名
   */
  private getFullKey(key: string): string {
    return this.prefix ? `${this.prefix}_${key}` : key
  }

  /**
   * 获取存储值（泛型方法）
   * @param key 存储键
   * @param defaultValue 默认值
   * @returns 存储值或默认值
   */
  get<T>(key: string, defaultValue: T): T {
    if (!this.available) {
      console.warn('localStorage is not available, returning default value')
      return defaultValue
    }

    try {
      const fullKey = this.getFullKey(key)
      const item = localStorage.getItem(fullKey)

      if (item === null) {
        return defaultValue
      }

      // 尝试解析 JSON
      try {
        return JSON.parse(item) as T
      } catch {
        // 如果不是 JSON 格式，直接返回字符串
        return item as unknown as T
      }
    } catch (error) {
      console.error(`Failed to get item from localStorage: ${key}`, error)
      return defaultValue
    }
  }

  /**
   * 获取类型安全的存储值
   * @param key 存储键（类型安全）
   * @param defaultValue 默认值
   * @returns 存储值或默认值
   */
  getTyped<K extends StorageKey>(key: K, defaultValue: StorageKeyMap[K]): StorageKeyMap[K] {
    return this.get<StorageKeyMap[K]>(key, defaultValue)
  }

  /**
   * 设置存储值
   * @param key 存储键
   * @param value 要存储的值
   * @returns 是否成功
   */
  set<T>(key: string, value: T): boolean {
    if (!this.available) {
      console.warn('localStorage is not available, value not saved')
      return false
    }

    try {
      const fullKey = this.getFullKey(key)
      const serialized = JSON.stringify(value)
      localStorage.setItem(fullKey, serialized)
      return true
    } catch (error) {
      // 检查是否是配额超限
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.error('localStorage quota exceeded')
        throw new StorageError(
          'Storage quota exceeded',
          'set',
          key,
          error
        )
      }
      console.error(`Failed to set item in localStorage: ${key}`, error)
      return false
    }
  }

  /**
   * 设置类型安全的存储值
   * @param key 存储键（类型安全）
   * @param value 要存储的值
   * @returns 是否成功
   */
  setTyped<K extends StorageKey>(key: K, value: StorageKeyMap[K]): boolean {
    return this.set(key, value)
  }

  /**
   * 移除指定键
   * @param key 存储键
   */
  remove(key: string): void {
    if (!this.available) return

    try {
      const fullKey = this.getFullKey(key)
      localStorage.removeItem(fullKey)
    } catch (error) {
      console.error(`Failed to remove item from localStorage: ${key}`, error)
    }
  }

  /**
   * 清除所有应用相关的存储数据
   */
  clearAll(): void {
    if (!this.available) return

    try {
      // 只清除应用相关的存储键
      Object.values(STORAGE_KEYS).forEach((key) => {
        const fullKey = this.getFullKey(key)
        localStorage.removeItem(fullKey)
      })
    } catch (error) {
      console.error('Failed to clear localStorage', error)
    }
  }

  /**
   * 检查键是否存在
   * @param key 存储键
   * @returns 是否存在
   */
  has(key: string): boolean {
    if (!this.available) return false

    try {
      const fullKey = this.getFullKey(key)
      return localStorage.getItem(fullKey) !== null
    } catch {
      return false
    }
  }

  /**
   * 获取存储大小（字节）
   * @param key 存储键
   * @returns 字节数
   */
  getSize(key: string): number {
    if (!this.available) return 0

    try {
      const fullKey = this.getFullKey(key)
      const item = localStorage.getItem(fullKey)
      return item ? new Blob([item]).size : 0
    } catch {
      return 0
    }
  }

  /**
   * 获取所有应用存储的总大小
   * @returns 总字节数
   */
  getTotalSize(): number {
    if (!this.available) return 0

    let total = 0
    Object.values(STORAGE_KEYS).forEach((key) => {
      total += this.getSize(key)
    })
    return total
  }
}

// 导出单例实例
export const storage = new LocalStorageService()

// 导出类型和类
export type { StorageKeyMap, StorageKey }