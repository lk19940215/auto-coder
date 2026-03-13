# Claude Coder 官网需求文档

## 项目目标

为 Claude Coder 工具开发一个展示官网，用于 GitHub Pages 部署，展示工具的核心功能、亮点特性，并提供快速上手文档和使用案例。

---

## 一、GitHub Pages 部署步骤

### 1.1 前置准备

1. **安装依赖**
   ```bash
   npm install
   # 或使用其他包管理器
   yarn install
   bun install
   pnpm install
   ```

2. **构建静态资源**
   ```bash
   npm run build
   ```

3. **测试本地预览**
   ```bash
   npm run preview
   # 或使用本地服务器
   python -m http.server 8000
   # 访问 http://localhost:8000
   ```

### 1.2 GitHub Pages 配置

1. **仓库设置**
   - 进入 GitHub 仓库 Settings → Pages
   - Source 选择：`Deploy from a branch`
   - Branch 选择：`main` 或 `gh-pages`
   - Folder 选择：`/(root)` 或 `/docs`

2. **GitHub Actions 配置（推荐）**
   在 `.github/workflows/deploy.yml` 中配置自动部署：

   ```yaml
   name: Deploy to GitHub Pages

   on:
     push:
       branches:
         - main

   permissions:
     contents: read
     pages: write
     id-token: write

   concurrency:
     group: "pages"
     cancel-in-progress: true

   jobs:
     deploy:
       environment:
         name: github-pages
         url: ${{ steps.deployment.outputs.page_url }}
       runs-on: ubuntu-latest
       steps:
         - name: Checkout
           uses: actions/checkout@v4

         - name: Setup Node
           uses: actions/setup-node@v4
           with:
             node-version: '20'
             cache: 'npm'

         - name: Install dependencies
           run: npm install

         - name: Build
           run: npm run build

         - name: Upload artifact
           uses: actions/upload-pages-artifact@v3
           with:
             path: './dist'

         - name: Deploy to GitHub Pages
           id: deployment
           uses: actions/deploy-pages@v4
   ```

3. **手动部署**
   ```bash
   # 安装 gh-pages
   npm install -g gh-pages

   # 构建并部署
   npm run build
   gh-pages -d dist
   ```

4. **验证部署**
   - 访问 `https://<username>.github.io/<repo-name>/`
   - 检查控制台是否有 404 或资源加载错误
   - 验证所有路由和静态资源是否正常

### 1.3 注意事项

- **Base URL 配置**：确保构建工具中设置了正确的 `base` 路径
  ```js
  // vite.config.js
  export default {
    base: '/claude-coder/'
  }
  ```

- **路由模式**：使用 hash 模式或配置 404 重定向到 index.html
  ```html
  <!-- 404.html -->
  <script>
    window.location.href = '/claude-coder/'
  </script>
  ```

- **CNAME（自定义域名）**
  ```bash
  echo "your-domain.com" > dist/CNAME
  ```

---

## 二、项目结构

### 2.1 目录结构

```
example/
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Pages 自动部署配置
├── public/
│   ├── favicon.ico                 # 网站图标
│   ├── logo.svg                    # 主要 Logo
│   └── robots.txt                  # 搜索引擎爬虫配置
├── src/
│   ├── assets/
│   │   ├── images/
│   │   │   ├── hero-bg.png        # 首页背景图
│   │   │   ├── features/
│   │   │   │   ├── hook.png       # Hook 机制图标
│   │   │   │   ├── session.png    # Session 守护图标
│   │   │   │   └── config.png     # 配置驱动图标
│   │   │   └── workflow.png       # 工作流程图
│   │   ├── styles/
│   │   │   ├── variables.css      # 颜色变量
│   │   │   ├── reset.css          # 样式重置
│   │   │   └── global.css         # 全局样式
│   │   └── icons/                  # SVG 图标集合
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.vue         # 顶部导航栏
│   │   │   ├── Footer.vue         # 页脚
│   │   │   ├── Button.vue         # 按钮组件
│   │   │   ├── Card.vue           # 卡片组件
│   │   │   └── CodeBlock.vue      # 代码块展示
│   │   ├── home/
│   │   │   ├── HeroSection.vue    # 首页横幅
│   │   │   ├── FeaturesSection.vue # 核心功能展示
│   │   │   ├── HowItWorks.vue     # 工作原理可视化
│   │   │   └── CTASection.vue     # 行动号召区
│   │   └── docs/
│   │       ├── Sidebar.vue        # 文档侧边栏
│   │       ├── TableOfContents.vue # 目录导航
│   │       └── MarkdownViewer.vue # Markdown 渲染器
│   ├── pages/
│   │   ├── Home.vue               # 首页
│   │   ├── Features.vue           # 功能详解页
│   │   ├── QuickStart.vue         # 快速上手页
│   │   ├── Docs.vue               # 文档中心
│   │   └── Examples.vue           # 使用案例页
│   ├── router/
│   │   └── index.js               # 路由配置
│   ├── stores/
│   │   └── appStore.js            # 状态管理（可选）
│   ├── App.vue                    # 根组件
│   └── main.js                    # 入口文件
├── index.html                     # HTML 模板
├── package.json                   # 依赖配置
├── vite.config.js                 # Vite 构建配置
├── README.md                      # 项目说明
├── LICENSE                        # 许可证
└── requirements.md                # 本需求文档
```

### 2.2 技术栈

- **框架**：Vue 3 / React 18（二选一）
- **构建工具**：Vite
- **样式**：Tailwind CSS / UnoCSS
- **图标**：Lucide Icons / Iconify
- **动画**：Framer Motion / Animate.css
- **部署**：GitHub Pages + GitHub Actions

### 2.3 package.json 配置

```json
{
  "name": "claude-coder-website",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "deploy": "gh-pages -d dist"
  },
  "dependencies": {
    "vue": "^3.4.0",
    "vue-router": "^4.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "gh-pages": "^6.0.0"
  }
}
```

---

## 三、官网设计文档

### 3.1 设计理念

**核心定位**：专业、现代、极客感强的技术工具官网

**设计风格**：
- 科技蓝 + 深空灰 + 渐变紫的配色方案
- 半透明玻璃拟态卡片设计
- 流畅的微交互动画
- 代码高亮与可视化流程图结合
- 深色模式优先，兼顾浅色模式

---

### 3.2 页面结构布局

#### **首页（/）**

**顶部导航栏（Header）**
- Logo + 标题 "Claude Coder"
- 导航链接：首页 | 功能特性 | 快速上手 | 文档 | 案例
- 右侧按钮：GitHub（图标 + Star）| 下载安装
- 响应式汉堡菜单（移动端）

**Hero 区域（首屏）**
- 左侧：大标题 + 副标题 + 核心标语
  ```
  Claude Coder
  长时间自运行的自主编码 Agent Harness

  一句话需求 → 完整项目，全自动交付
  ```

- 右侧：终端动画演示
  ```bash
  $ claude-coder run "实现用户注册和登录功能"

  🔍 扫描项目技术栈...
  📋 生成任务计划...
  🤖 开始编码循环...
  ✅ 功能实现完成！
  ```

- 操作按钮：立即开始（主）| 查看文档（次）

**核心功能卡片（3列布局）**
1. **Hook 提示注入**
   - 图标：🔌
   - 标题：零代码扩展规则
   - 描述：通过 JSON 配置在工具调用时向模型注入上下文引导

2. **长时间自循环**
   - 图标：🔄
   - 标题：数小时持续编码
   - 描述：多 session 编排 + 倒计时监控 + git 回滚重试

3. **配置驱动**
   - 图标：⚙️
   - 标题：灵活的模型路由
   - 描述：支持 Claude 官方、Coding Plan、DeepSeek 等任意 API

**工作原理可视化**
- 流程图展示：
  ```
  需求输入 ─→ 项目扫描 ─→ 任务分解 ─→ 编码循环
                                          │
                                    ┌──────┴──────┐
                                    │  Session N   │
                                    │  Claude SDK  │
                                    │  6 步流程    │
                                    └──────┬──────┘
                                           │
                                      harness 校验
                                           │
                                通过 → 下一个任务
                                失败 → git 回滚 + 重试
  ```

**终端演示区域**
- 实时滚动的命令行输出模拟
- 展示完整的使用流程：
  ```bash
  # 初始化
  $ claude-coder init
  Scanning project structure...
  Generating project profile...

  # 运行
  $ claude-coder run "新增头像上传功能"
  Session 1/50: Analyzing requirements...
  Session 2/50: Implementing file upload...
  ...
  ```

**行动号召区（CTA）**
- 标题：准备好提升开发效率了吗？
- 按钮：安装 Claude Coder（跳转到快速上手）
- 附加：已有账号？直接登录

**页脚（Footer）**
- 左侧：Logo + 简介
- 中间：快速链接（功能 | 文档 | GitHub | 博客）
- 右侧：社交媒体图标（Twitter | Discord | YouTube）
- 底部：版权信息 + 许可证

---

#### **功能特性页（/features）**

**页面结构**：
- 侧边导航（锚点链接）
- 主内容区域（分段展示）

**内容模块**：

1. **Hook 提示注入机制**
   - 详细说明 JSON 配置格式
   - 三级匹配策略图解
   - 示例配置代码块
   - 副作用评估说明

2. **Session 守护机制**
   - 中断策略说明
   - 倒计时活跃度检测原理
   - 工具运行状态追踪
   - 防刷屏机制

3. **多模型路由**
   - 支持的模型提供商列表
   - 环境变量配置示例
   - 成本对比表格

4. **测试凭证方案**
   - Playwright 登录态导出
   - API Key 持久化
   - 安全性说明

---

#### **快速上手页（/quick-start）**

**分步骤引导**：

**步骤 1：安装**
```bash
# 安装 Claude Agent SDK
npm install -g @anthropic-ai/claude-agent-sdk

# 安装 Claude Coder
npm install -g claude-coder
```

**步骤 2：配置**
```bash
# 交互式配置（模型、MCP、安全限制）
claude-coder setup

# 或手动配置环境变量
ANTHROPIC_DEFAULT_OPUS_MODEL=glm-5
ANTHROPIC_DEFAULT_SONNET_MODEL=qwen3-coder-next
ANTHROPIC_DEFAULT_HAIKU_MODEL=qwen3-coder-plus
```

**步骤 3：初始化项目**
```bash
cd your-project
claude-coder init
```

**步骤 4：开始编码**
```bash
# 方式一：直接输入需求
claude-coder run "实现用户注册和登录功能"

# 方式二：从需求文件读取
claude-coder run

# 方式三：交互模式
claude-coder plan -i "需求描述"
```

**常见选项说明**：
- `--max N`：限制 session 数（默认 50）
- `--pause N`：每 N 个 session 暂停确认
- `--dry-run`：预览模式（查看任务队列）
- `--model M`：指定模型

**验证安装**
```bash
claude-coder status
# 应显示配置信息和模型状态
```

---

#### **文档中心页（/docs）**

**侧边栏目录结构**：
```
文档
├── 入门指南
│   ├── 安装
│   ├── 配置
│   └── 第一个项目
├── 核心概念
│   ├── Hook 注入机制
│   ├── Session 守护
│   ├── 任务分解
│   └── 自动审查
├── 使用场景
│   ├── 新项目搭建
│   ├── 已有项目增量
│   ├── 需求文档驱动
│   └── 自动测试
├── 命令参考
│   ├── setup
│   ├── init
│   ├── plan
│   ├── run
│   ├── simplify
│   ├── auth
│   └── status
└── 故障排查
    ├── 余额不足
    ├── 中断恢复
    ├── 长时间无响应
    └── 跳过任务
```

**文档样式**：
- 左侧目录导航（可折叠）
- 右侧目录锚点（当前页面大纲）
- 代码块支持多种语言高亮
- 提示框（注意、提示、警告）
- 可折叠的详细说明

---

#### **使用案例页（/examples）**

**案例 1：Todo 应用**
- 需求描述：用 Express + React 做 Todo 应用
- 完整命令：
  ```bash
  claude-coder run "用 Express + React 做 Todo 应用"
  ```
- 展示效果：前后端代码结构截图

**案例 2：头像上传**
- 需求描述：新增头像上传功能
- 完整命令：
  ```bash
  claude-coder run "新增头像上传功能"
  ```
- 展示效果：上传组件代码 + 测试流程

**案例 3：需求文档驱动**
- 需求描述：在项目根目录创建 requirements.md
- 完整命令：
  ```bash
  claude-coder run
  claude-coder add -r  # 同步新任务
  ```
- 展示效果：需求文档示例 + 任务队列

**案例 4：自动测试**
- 需求描述：导出浏览器登录态
- 完整命令：
  ```bash
  claude-coder auth http://localhost:3000
  ```
- 展示效果：测试凭证文件 + 验证记录

---

### 3.3 颜色风格

#### **主色调**

```css
:root {
  /* 科技蓝（主色） */
  --primary-50: #f0f9ff;
  --primary-100: #e0f2fe;
  --primary-200: #bae6fd;
  --primary-300: #7dd3fc;
  --primary-400: #38bdf8;
  --primary-500: #0ea5e9;
  --primary-600: #0284c7;
  --primary-700: #0369a1;
  --primary-800: #075985;
  --primary-900: #0c4a6e;

  /* 深空灰（背景） */
  --gray-900: #111827;
  --gray-800: #1f2937;
  --gray-700: #374151;

  /* 渐变紫（强调色） */
  --gradient-start: #8b5cf6;  /* Purple 500 */
  --gradient-end: #ec4899;    /* Pink 500 */

  /* 成功绿 */
  --success-500: #10b981;

  /* 警告黄 */
  --warning-500: #f59e0b;

  /* 错误红 */
  --error-500: #ef4444;
}
```

#### **深色模式**

```css
.dark {
  /* 背景 */
  --bg-50: #0a0a0f;           /* 极深灰 */
  --bg-100: #121218;          /* 深灰 */
  --bg-200: #1e1e28;          /* 卡片背景 */

  /* 文字 */
  --text-50: #f9fafb;         /* 白色 */
  --text-200: #e5e7eb;        /* 浅灰 */
  --text-400: #9ca3af;        /* 灰色 */
  --text-600: #4b5563;        /* 深灰 */

  /* 边框 */
  --border-300: #374151;      /* 卡片边框 */
  --border-400: #4b5563;      /* 分割线 */

  /* 代码块 */
  --code-bg: #1a1a22;         /* 代码背景 */
  --code-border: #2d2d3a;     /* 代码边框 */
}
```

#### **渐变效果**

```css
/* 主按钮渐变 */
.btn-primary {
  background: linear-gradient(135deg, var(--gradient-start), var(--gradient-end));
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.3);
}

/* 卡片渐变边框 */
.card {
  background: linear-gradient(var(--bg-200), var(--bg-200)) padding-box,
              linear-gradient(135deg, var(--primary-500), var(--gradient-start)) border-box;
  border: 2px solid transparent;
}

/* Hero 背景渐变 */
.hero-bg {
  background: radial-gradient(
    circle at 20% 30%,
    rgba(139, 92, 246, 0.1) 0%,
    rgba(236, 72, 153, 0.05) 50%,
    transparent 100%
  );
}
```

---

### 3.4 核心展示内容

#### **Hero 区域（首屏核心）**

**视觉设计**：
- 深色背景 + 星空粒子动画
- 左右分栏布局（6:6 比例）
- 标题使用大号加粗字体（48px+）
- 副标题中等字号（20px）
- 核心标语高亮显示（渐变色）

**交互效果**：
- 标题文字打字机动画
- 终端模拟器实时滚动
- 按钮悬停发光效果
- 背景粒子随鼠标移动

#### **功能卡片（三大亮点）**

**视觉设计**：
- 玻璃拟态卡片（backdrop-filter + border）
- 半透明背景 + 渐变边框
- 大号图标（64px）
- 标题加粗，描述灰色

**交互效果**：
- 悬停时卡片上浮 + 阴影加深
- 图标轻微缩放动画
- 渐变边框流动效果

#### **工作原理可视化**

**视觉设计**：
- 横向流程图（SVG 或 Canvas）
- 节点：圆形图标 + 文字
- 连线：带箭头的曲线
- 高亮当前节点

**交互效果**：
- 鼠标悬停显示详细说明
- 点击节点跳转到对应文档
- 自动播放流程动画

#### **终端演示区域**

**视觉设计**：
- 仿终端窗口（深色背景 + 圆角边框）
- 标题栏（关闭、最小化、最大化按钮）
- 代码字体（等宽字体，如 Fira Code）
- 语法高亮

**交互效果**：
- 实时滚动输出（模拟打字效果）
- 命令高亮显示
- 成功/失败状态颜色区分

#### **响应式设计**

**断点设置**：
```css
/* 移动端 */
@media (max-width: 768px) {
  /* 单列布局 */
  /* 导航栏折叠为汉堡菜单 */
  /* 字体缩小 */
}

/* 平板 */
@media (min-width: 769px) and (max-width: 1024px) {
  /* 两列布局 */
  /* 导航栏展开 */
}

/* 桌面 */
@media (min-width: 1025px) {
  /* 完整布局 */
  /* 多列卡片 */
}
```

---

### 3.5 附加功能

#### **暗色/亮色模式切换**

- 右上角切换按钮
- 自动检测系统偏好
- 本地存储用户选择
- 平滑过渡动画

#### **语言切换**

- 中英文切换（根据 README.md 支持）
- 语言选择器（国旗图标 + 下拉菜单）
- URL 参数保持语言状态

#### **代码复制功能**

- 代码块右上角复制按钮
- 点击后显示 "已复制" 提示
- 自动高亮当前代码块

#### **锚点链接**

- 标题右侧显示锚点图标
- 点击复制链接
- 滚动时高亮当前章节

#### **搜索功能**

- 顶部搜索框（可选）
- 支持关键词搜索文档
- 实时搜索结果展示

---

## 四、验收标准

1. ✅ 页面在 GitHub Pages 上正常访问
2. ✅ 所有路由正常跳转（无 404）
3. ✅ 响应式设计（移动端、平板、桌面）
4. ✅ 深色/浅色模式切换正常
5. ✅ 所有链接（内部 + 外部）可点击
6. ✅ 代码块语法高亮正确
7. ✅ 图片和图标正常加载
8. ✅ 动画效果流畅（60fps）
9. ✅ SEO 基础优化（meta 标签、Open Graph）
10. ✅ 可访问性（ARIA 标签、键盘导航）

---

## 五、交付物

- [ ] 完整的源代码（Vue/React 项目）
- [ ] 构建后的静态文件（dist/）
- [ ] GitHub Actions 配置文件
- [ ] 部署到 GitHub Pages 的线上链接
- [ ] 设计稿（Figma/Sketch，可选）
- [ ] 使用说明文档
