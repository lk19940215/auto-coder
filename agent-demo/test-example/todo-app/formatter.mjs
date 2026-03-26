export function formatTodo(todo) {
  const status = todo.done ? '✓' : '○';
  const date = new Date(todo.createdAt).toLocaleDateString();
  return `[${status}] #${todo.id} ${todo.title} (${date})`;
}

export function formatList(todos) {
  if (todos.length === 0) return '没有待办事项';
  return todos.map(formatTodo).join('\n');
}

export function formatStats(todos) {
  const total = todos.length;
  const done = todos.filter(t => t.done).length;
  const pending = total - done;
  return `总计: ${total} | 完成: ${done} | 待办: ${pending}`;
}
