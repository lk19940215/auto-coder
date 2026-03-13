# 样式修复 & React 重构方案

## 一、背景与问题

### 1.1 问题背景
- 项目执行 `npm run dev` 后服务器正常启动，但页面样式丢失
- 项目是一个 Claude Coder 官网展示项目，需要从 Vue 3 重构为 React

### 1.2 当前技术栈
- **框架**: Vue 3.4 (Composition API)
- **构建工具**: Vite 5.0
- **路由**: Vue Router 4.2
- **样式**: Tailwind CSS 3.4 (已安装但未配置)

### 1.3 样式丢失原因
项目使用了 Tailwind CSS 的 `@tailwind` 指令，但缺少必要的配置文件：
- 缺少 `tailwind.config.js` - Tailwind 配置文件
- 缺少 `postcss.config.js` - PostCSS 配置文件
- 缺少 `autoprefixer` 依赖

---

## 二、样式修复方案

### 2.1 需要创建的文件

#### 文件 1: `tailwind.config.js`
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

#### 文件 2: `postcss.config.js`
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### 2.2 需要安装的依赖
```bash
npm install -D autoprefixer
```

### 2.3 执行步骤
1. 在项目根目录创建 `tailwind.config.js`
2. 在项目根目录创建 `postcss.config.js`
3. 执行 `npm install -D autoprefixer`
4. 重启开发服务器 `npm run dev`

---

## 三、React 重构方案

### 3.1 目标技术栈
| 层级 | 选择 | 说明 |
|------|------|------|
| 框架 | React 18 | 组件化开发 |
| 语言 | TypeScript | 类型安全 |
| 构建工具 | Vite 5 | 保持一致 |
| 路由 | React Router 6 | 官方推荐 |
| 样式 | Tailwind CSS 3 | 保持一致 |
| 状态管理 | useState/useReducer | 无全局状态，组件内部管理 |

### 3.2 目录结构设计
```
src/
├── main.tsx                    # 应用入口
├── App.tsx                     # 根组件
├── vite-env.d.ts               # Vite 类型声明
├── router/
│   └── index.tsx               # 路由配置
├── styles/
│   └── global.css              # 全局样式 (保留)
├── pages/
│   ├── Home.tsx
│   ├── Features.tsx
│   ├── QuickStart.tsx
│   ├── Docs.tsx
│   └── Examples.tsx
├── components/
│   ├── common/
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   └── home/
│       ├── HeroSection.tsx
│       ├── FeaturesSection.tsx
│       ├── HowItWorks.tsx
│       └── CTASection.tsx
├── hooks/                      # 自定义 Hooks
├── types/                      # 类型定义
│   └── index.ts
└── utils/                      # 工具函数
    └── cn.ts                   # className 合并
```

### 3.3 需要修改的配置文件

#### `package.json`
```json
{
  "name": "claude-coder-website",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0"
  }
}
```

#### `vite.config.ts`
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/claude-coder/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
```

#### `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

#### `tailwind.config.js` (更新 content)
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### 3.4 组件迁移映射
| Vue 组件 | React 组件 | 关键变更 |
|---------|-----------|---------|
| `main.js` | `main.tsx` | createApp -> ReactDOM.createRoot |
| `App.vue` | `App.tsx` | `<router-view />` -> `<Outlet />` |
| `router/index.js` | `router/index.tsx` | Vue Router -> React Router |
| `Header.vue` | `Header.tsx` | `ref` -> `useState`, `router-link` -> `Link` |
| `Footer.vue` | `Footer.tsx` | 静态组件，直接转换 |
| `Home.vue` | `Home.tsx` | 组件组合方式不变 |
| `HeroSection.vue` | `HeroSection.tsx` | scoped style -> 模块内样式 |
| `FeaturesSection.vue` | `FeaturesSection.tsx` | 静态组件，直接转换 |
| `HowItWorks.vue` | `HowItWorks.tsx` | `v-for` -> `map()` |
| `CTASection.vue` | `CTASection.tsx` | 静态组件，直接转换 |
| `Features.vue` | `Features.tsx` | `ref` -> `useState` |
| `QuickStart.vue` | `QuickStart.tsx` | 静态组件，直接转换 |
| `Docs.vue` | `Docs.tsx` | `ref` -> `useState` |
| `Examples.vue` | `Examples.tsx` | 静态组件，直接转换 |

### 3.5 Vue -> React 语法对照
| Vue 语法 | React 语法 |
|---------|-----------|
| `<template>` | JSX return |
| `<script setup>` | `export default function Component() {}` |
| `ref(value)` | `useState(value)` |
| `v-if="cond"` | `{cond && <div/>}` |
| `v-else` | 三元表达式 `{cond ? <A/> : <B/>}` |
| `v-for="item in list"` | `{list.map(item => <div key={item.id}/>)}` |
| `@click="handler"` | `onClick={handler}` |
| `:class="{ active: isActive }"` | `className={isActive ? 'active' : ''}` |
| `<router-link to="/path">` | `<Link to="/path">` |
| `<router-view />` | `<Outlet />` |

---

## 四、实施计划

### 阶段 1: 样式修复 (优先)
1. 创建 `tailwind.config.js`
2. 创建 `postcss.config.js`
3. 安装 `autoprefixer`
4. 验证样式恢复正常

### 阶段 2: React 环境搭建
1. 更新 `package.json` 依赖
2. 创建 `vite.config.ts`
3. 创建 TypeScript 配置文件
4. 创建 `index.html` (更新入口为 main.tsx)
5. 创建 `src/main.tsx` 入口文件

### 阶段 3: 基础设施迁移
1. 创建 `src/styles/global.css` (复制原有样式)
2. 创建 `src/router/index.tsx`
3. 创建 `src/App.tsx`
4. 创建 `src/types/index.ts`
5. 创建 `src/utils/cn.ts`

### 阶段 4: 组件迁移 (按顺序)
1. `Header.tsx` - 导航栏组件
2. `Footer.tsx` - 页脚组件
3. `HeroSection.tsx` - 首页英雄区
4. `FeaturesSection.tsx` - 功能特性区
5. `HowItWorks.tsx` - 工作原理区
6. `CTASection.tsx` - 行动召唤区
7. `Home.tsx` - 首页
8. `Features.tsx` - 功能页
9. `QuickStart.tsx` - 快速开始页
10. `Docs.tsx` - 文档页
11. `Examples.tsx` - 案例页

### 阶段 5: 清理与验证
1. 删除 Vue 相关文件 (`*.vue`, `main.js`)
2. 删除 Vue 相关依赖
3. 功能测试
4. 样式对比验证
5. 路由测试

---

## 五、关键文件路径

### 需要创建
- `E:\Code\claude-coder\example\tailwind.config.js`
- `E:\Code\claude-coder\example\postcss.config.js`
- `E:\Code\claude-coder\example\vite.config.ts`
- `E:\Code\claude-coder\example\tsconfig.json`
- `E:\Code\claude-coder\example\tsconfig.node.json`
- `E:\Code\claude-coder\example\src\main.tsx`
- `E:\Code\claude-coder\example\src\App.tsx`
- `E:\Code\claude-coder\example\src\router\index.tsx`
- 所有 React 组件文件

### 需要修改
- `E:\Code\claude-coder\example\package.json` - 更新依赖
- `E:\Code\claude-coder\example\index.html` - 更新入口脚本

### 需要删除 (阶段 5)
- `E:\Code\claude-coder\example\src\main.js`
- `E:\Code\claude-coder\example\src\App.vue`
- `E:\Code\claude-coder\example\src\router\index.js`
- 所有 `.vue` 文件

---

## 六、验证方法

### 样式修复验证
1. 执行 `npm run dev`
2. 打开浏览器访问页面
3. 检查 Tailwind 类是否生效（如 `min-h-screen`, `grid`, `text-center`）
4. 检查自定义类是否生效（如 `.btn-primary`, `.card`, `.terminal`）

### React 重构验证
1. 执行 `npm run dev` 确保无编译错误
2. 访问所有路由页面，验证功能正常
3. 对比 Vue 版本，验证样式一致
4. 测试移动端响应式布局
5. 执行 `npm run build` 验证生产构建