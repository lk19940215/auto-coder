# 创建 Hello World 函数

## Context
用户请求创建一个简单的 hello world 函数。基于项目结构分析，这是一个 Node.js 项目，使用 JavaScript，代码组织在 `src/` 目录下，分为 `commands/`、`core/`、`common/` 子目录。

## 实现方案

### 文件路径
`src/common/hello.js`

### 代码实现
```javascript
/**
 * Hello World 函数
 * @returns {string} 返回 "Hello, World!" 字符串
 */
function helloWorld() {
  return 'Hello, World!';
}

module.exports = {
  helloWorld
};
```

### 实现步骤
1. 在 `src/common/` 目录下创建 `hello.js` 文件
2. 定义 `helloWorld` 函数，返回 "Hello, World!"
3. 使用 CommonJS 模块导出

## 验证方式
- 检查文件是否正确创建
- 可通过 Node.js 运行测试：`node -e "const {helloWorld} = require('./src/common/hello.js'); console.log(helloWorld());"`

## 修改文件清单
- 新增：`src/common/hello.js`