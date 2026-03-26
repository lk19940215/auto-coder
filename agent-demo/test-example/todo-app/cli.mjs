import { TodoStore } from './store.mjs';
import { formatList, formatStats } from './formatter.mjs';

const store = new TodoStore();
await store.load();

const [,, command, ...args] = process.argv;

switch (command) {
  case 'add':
    const todo = store.add(args.join(' '));
    console.log(`添加: ${todo.title}`);
    break;
  case 'list':
    console.log(formatList(store.getAll()));
    break;
  case 'done':
    store.toggle(parseInt(args[0]));
    console.log('已标记完成');
    break;
  case 'remove':
    store.remove(parseInt(args[0]));
    console.log('已删除');
    break;
  case 'stats':
    console.log(formatStats(store.getAll()));
    break;
  default:
    console.log('用法: node cli.mjs <add|list|done|remove|stats> [参数]');
}

await store.save();
