import { useRef, useCallback } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { TagPill } from '../tags/TagPill'
import { useTags } from '../../hooks/useTags'
import type { Task, DragItem } from '../../types'
import { DragItemType } from '../../types'

export interface TaskItemProps {
  task: Task
  index: number
  onToggleStatus: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (task: Task) => void
  onReorder: (dragIndex: number, hoverIndex: number) => void
}

export function TaskItem({
  task,
  index,
  onToggleStatus,
  onDelete,
  onEdit,
  onReorder,
}: TaskItemProps) {
  const { getTagById } = useTags()
  const ref = useRef<HTMLDivElement>(null)

  // 获取任务关联的标签
  const taskTags = task.tagIds
    .map(id => getTagById(id))
    .filter(Boolean)

  // 拖拽功能
  const [{ isDragging }, drag] = useDrag({
    type: DragItemType.TASK,
    item: (): DragItem => ({ type: DragItemType.TASK, id: task.id, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  // 放置功能
  const [{ isOver }, drop] = useDrop<DragItem, unknown, { isOver: boolean }>({
    accept: DragItemType.TASK,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
    hover(item, monitor) {
      if (!ref.current) return

      const dragIndex = item.index
      const hoverIndex = index

      if (dragIndex === hoverIndex) return

      const hoverBoundingRect = ref.current.getBoundingClientRect()
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
      const clientOffset = monitor.getClientOffset()
      if (!clientOffset) return

      const hoverClientY = clientOffset.y - hoverBoundingRect.top

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return

      onReorder(dragIndex, hoverIndex)
      item.index = hoverIndex
    },
  })

  // 合并 drag 和 drop ref
  drag(drop(ref))

  // 状态样式
  const statusStyles = {
    todo: 'border-[#2D3139]',
    in_progress: 'border-[#F59E0B40]',
    completed: 'border-[#7CB68E40] opacity-60',
  }

  // 复选框样式
  const checkboxStyles = {
    todo: 'border-[#3D4149] bg-transparent',
    in_progress: 'border-[#F59E0B] bg-[#F59E0B20]',
    completed: 'border-[#7CB68E] bg-gradient-to-r from-[#7CB68E] to-[#D4A574]',
  }

  const handleToggleStatus = useCallback(() => {
    onToggleStatus(task.id)
  }, [onToggleStatus, task.id])

  const handleDelete = useCallback(() => {
    onDelete(task.id)
  }, [onDelete, task.id])

  const handleEdit = useCallback(() => {
    onEdit(task)
  }, [onEdit, task])

  return (
    <div
      ref={ref}
      className={`
        w-full h-[76px] px-5 py-4
        flex items-center gap-4
        bg-[#1E2128] rounded-xl
        border transition-all duration-200
        ${statusStyles[task.status]}
        ${isDragging ? 'opacity-50 scale-[0.98]' : ''}
        ${isOver ? 'ring-2 ring-[#7CB68E40]' : ''}
        hover:bg-[#252930]
      `}
    >
      {/* 复选框 */}
      <button
        onClick={handleToggleStatus}
        className={`
          w-6 h-6 rounded-md flex-shrink-0
          flex items-center justify-center
          border-2 transition-all duration-200
          ${checkboxStyles[task.status]}
          hover:scale-110
        `}
      >
        {task.status === 'completed' && (
          <span className="text-white text-xs font-bold">✓</span>
        )}
        {task.status === 'in_progress' && (
          <span className="text-[#F59E0B] text-xs">●</span>
        )}
      </button>

      {/* 任务内容 */}
      <div className="flex-1 min-w-0">
        <h3
          className={`
            text-sm font-medium truncate
            ${task.status === 'completed' ? 'text-[#6B7280] line-through' : 'text-[#E5E7EB]'}
          `}
        >
          {task.title}
        </h3>
        {task.description && (
          <p className="text-xs text-[#6B7280] truncate mt-0.5">
            {task.description}
          </p>
        )}
      </div>

      {/* 标签 */}
      <div className="flex gap-1.5 flex-shrink-0">
        {taskTags.slice(0, 2).map(tag => tag && (
          <TagPill key={tag.id} tag={tag} size="sm" />
        ))}
        {taskTags.length > 2 && (
          <span className="text-xs text-[#6B7280]">+{taskTags.length - 2}</span>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-1 flex-shrink-0">
        <button
          onClick={handleEdit}
          className="p-1.5 text-[#6B7280] hover:text-[#E5E7EB] hover:bg-[#2D3139] rounded-lg transition-colors"
          title="编辑"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        <button
          onClick={handleDelete}
          className="p-1.5 text-[#6B7280] hover:text-[#EF4444] hover:bg-[#EF444415] rounded-lg transition-colors"
          title="删除"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* 拖拽手柄 */}
      <div className="text-[#3D4149] cursor-grab active:cursor-grabbing flex-shrink-0">
        ⋮⋮
      </div>
    </div>
  )
}

export default TaskItem