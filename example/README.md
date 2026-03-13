# Claude Coder 官网

Claude Coder 官网项目，基于 Vue 3 + Vite + Tailwind CSS 构建，部署于 GitHub Pages。

## 项目简介

这是一个展示 Claude Coder 工具的官方网站，包含：
- 核心功能介绍
- 快速上手指南
- 完整文档中心
- 使用案例展示

## 技术栈

- **框架**: Vue 3
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **路由**: Vue Router
- **部署**: GitHub Pages + GitHub Actions

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

## 部署

项目配置了 GitHub Actions 自动部署：
- 推送代码到 `main` 分支
- GitHub Actions 会自动构建并部署到 GitHub Pages

## 项目结构

```
├── public/              # 静态资源
├── src/
│   ├── assets/         # 资源文件
│   ├── components/     # 组件
│   │   ├── common/     # 通用组件
│   │   ├── home/       # 首页组件
│   │   └── docs/       # 文档组件
│   ├── pages/          # 页面
│   ├── router/         # 路由配置
│   └── stores/         # 状态管理
├── .github/workflows/  # CI/CD 配置
├── index.html          # 入口 HTML
├── package.json        # 依赖配置
└── vite.config.js      # Vite 配置
```

## 文档

- [快速上手](./docs/quick-start.md)
- [功能特性](./docs/features.md)
- [API 文档](./docs/api.md)

## 许可证

MIT License
