/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 暗色主题配色
        dark: {
          bg: '#0f0f0f',
          surface: '#1a1a1a',
          border: '#2a2a2a',
          text: '#e5e5e5',
          muted: '#737373',
        },
        // 标签颜色
        tag: {
          work: '#3b82f6',    // 蓝色 - 工作
          study: '#22c55e',   // 绿色 - 学习
          life: '#a855f7',    // 紫色 - 生活
          urgent: '#ef4444',  // 红色 - 紧急
        },
        // 番茄钟颜色
        pomodoro: {
          work: '#ef4444',    // 红色 - 工作中
          break: '#22c55e',   // 绿色 - 休息中
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}