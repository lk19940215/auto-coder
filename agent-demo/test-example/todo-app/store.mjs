import { readFile, writeFile } from 'fs/promises';

export class TodoStore {
  constructor(filePath = 'todos.json') {
    this.filePath = filePath;
    this.todos = [];
  }

  async load() {
    try {
      const data = await readFile(this.filePath, 'utf-8');
      this.todos = JSON.parse(data);
    } catch {
      this.todos = [];
    }
  }

  async save() {
    await writeFile(this.filePath, JSON.stringify(this.todos), 'utf-8');
  }

  add(title) {
    const todo = {
      id: this.todos.length + 1,
      title,
      done: false,
      createdAt: Date.now(),
    };
    this.todos.push(todo);
    return todo;
  }

  toggle(id) {
    const todo = this.todos.find(t => t.id === id);
    if (!todo) return null;
    todo.done = !todo.done;
    return todo;
  }

  remove(id) {
    const idx = this.todos.findIndex(t => t.id === id);
    if (idx === -1) return false;
    this.todos.splice(idx, 1);
    return true;
  }

  getAll() {
    return this.todos;
  }

  getCompleted() {
    return this.todos.filter(t => t.done === true);
  }

  getPending() {
    return this.todos.filter(t => t.done === false);
  }
}
