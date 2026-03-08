# TODO API

一个使用 Node.js + Express 实现的简单 TODO 待办事项 API，配有现代化的 React 前端界面。

## 技术栈

### 后端
- **Runtime**: Node.js
- **Framework**: Express.js
- **数据存储**: 内存数组（无需数据库）

### 前端
- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **UI 库**: Mantine v7
- **状态管理**: Zustand
- **HTTP 客户端**: Axios
- **路由**: React Router v6

## 目录结构

```
.
├── server.js              # 后端主入口，包含所有 API 路由
├── package.json           # 后端项目配置和依赖
├── client/                # 前端项目
│   ├── src/
│   │   ├── main.tsx       # 前端入口，配置路由
│   │   ├── App.tsx        # 应用布局（导航栏）
│   │   ├── pages/         # 页面组件
│   │   │   ├── HomePage.tsx    # 首页（TODO 列表）
│   │   │   └── AboutPage.tsx   # 关于页面
│   │   ├── components/    # 可复用组件
│   │   ├── store/         # Zustand 状态管理
│   │   └── lib/           # 工具函数和 API
│   └── package.json       # 前端项目配置
├── requirements.md        # 需求文档
└── README.md             # 本文件
```

## API 端点

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /health | 健康检查 |
| GET | /api/todos | 获取所有待办事项 |
| POST | /api/todos | 创建待办事项 |
| PUT | /api/todos/:id | 更新待办事项状态 |
| DELETE | /api/todos/:id | 删除待办事项 |

## TODO 数据结构

```json
{
  "id": 1,
  "title": "示例任务",
  "completed": false,
  "createdAt": "2026-03-07T12:00:00.000Z"
}
```

## 快速开始

### 安装依赖

**后端**：
```bash
npm install
```

**前端**：
```bash
cd client
npm install
```

### 启动服务

**启动后端**（终端 1）：
```bash
npm start
```
服务将在 `http://localhost:3000` 启动。

**启动前端**（终端 2）：
```bash
cd client
npm start
```
前端将在 `http://localhost:5173` 启动。

## 前端路由

| 路径 | 页面 | 描述 |
|------|------|------|
| `/` | HomePage | 首页，显示 TODO 列表 |
| `/about` | AboutPage | 关于页面，介绍项目和技术栈 |

## 使用示例

### 健康检查

```bash
curl http://localhost:3000/health
```

### 获取所有待办事项

```bash
curl http://localhost:3000/api/todos
```

### 创建待办事项

```bash
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "学习 Node.js"}'
```

### 更新待办事项状态

```bash
curl -X PUT http://localhost:3000/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
```

### 删除待办事项

```bash
curl -X DELETE http://localhost:3000/api/todos/1
```
