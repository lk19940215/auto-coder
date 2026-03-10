# 计划：创建 Hello World 函数

## Context
用户请求创建一个 hello world 函数。这是一个简单的任务，需要在 `src/` 目录下创建一个新的 JavaScript 文件。

## 实现方案

### 新建文件
- **路径**: `/Users/longkuo/Desktop/AI/ai-helper/src/hello.js`

### 代码内容
```javascript
/**
 * Hello World 函数
 * @returns {string} 返回 "Hello, World!" 字符串
 */
function helloWorld() {
  return "Hello, World!";
}

module.exports = { helloWorld };
```

## 验证方式
1. 运行 `node -e "const { helloWorld } = require('./src/hello.js'); console.log(helloWorld());"`
2. 预期输出: `Hello, World!`