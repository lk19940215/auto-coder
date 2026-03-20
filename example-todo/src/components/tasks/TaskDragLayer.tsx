import { useDragLayer } from 'react-dnd'
import type { DragItem } from '../../types'
import { DragItemType } from '../../types'

export function TaskDragLayer() {
  const { isDragging, item, currentOffset } = useDragLayer(
    (monitor) => ({
      isDragging: monitor.isDragging(),
      item: monitor.getItem() as DragItem | null,
      currentOffset: monitor.getSourceClientOffset(),
    })
  )

  if (!isDragging || !item || item.type !== DragItemType.TASK) {
    return null
  }

  if (!currentOffset) {
    return null
  }

  const { x, y } = currentOffset

  return (
    <div
      className="fixed pointer-events-none z-50 left-0 top-0"
      style={{
        transform: `translate(${x}px, ${y}px)`,
      }}
    >
      <div
        className="
          w-[calc(100vw-40rem)] max-w-xl
          px-5 py-4
          flex items-center gap-4
          bg-[#252930] rounded-xl
          border-2 border-[#7CB68E]
          shadow-xl shadow-[#7CB68E20]
          opacity-90
        "
      >
        {/* 简化的拖拽预览 */}
        <div className="flex-1 min-w-0">
          <div className="h-4 bg-[#E5E7EB30] rounded w-3/4" />
        </div>
        <div className="text-[#7CB68E] text-xs font-medium">
          拖动排序
        </div>
      </div>
    </div>
  )
}

export default TaskDragLayer