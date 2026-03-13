import React from 'react'

const App: React.FC = () => {
  return (
    <div className="dark">
      <div className="min-h-screen bg-[var(--bg-100)] text-[var(--text-200)]">
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-4xl font-bold text-[var(--text-50)] mb-4">
            Claude Coder
          </h1>
          <p className="text-xl text-[var(--text-400)]">
            自主编码 Agent
          </p>
          <p className="mt-8 text-[var(--text-400)]">
            React 18 + TypeScript 环境搭建成功！
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
