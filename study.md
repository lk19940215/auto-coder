# SDK学习

[文档地址](https://platform.claude.com/docs/zh-CN/agent-sdk/typescript)

## 介绍

- sdk.query({promt, options})
- prompt: 用户提示词
- options:
    ```javascript
        const options = {
        // === 核心配置 ===
        systemPrompt: '...',           // 系统提示词
        // === 工具配置 ===
        allowedTools: ['Read', 'Write', 'Bash', "Glob", "Grep"],  // 允许的工具列表
        mcpServers: { ... },                      // MCP 服务器配置
        // === 控制配置 ===
        abortController: new AbortController(),   // 中断控制器
        maxTurns: 200,                            // 最大轮次（1 turn = 模型 1 次响应，默认无限制，仅 CI 推荐）
        // === Hooks ===
        hooks: {
            PreToolUse: [...],
            PostToolUse: [...],
            // ...
        },
        // === Agent 配置 ===
        agent: 'my-agent',            // 使用预定义的 agent
        agents: { ... },              // 自定义 agent 定义

        
        // === 其它 配置 ===
        continue: true, // 这个又是什么？
        includePartialMessages: true, // 流式输出 https://platform.claude.com/docs/zh-CN/agent-sdk/streaming-output

        // === 其他 ===
        additionalDirectories: ['/path/to/access'],  // 额外可访问目录
        permissionMode: 'bypassPermissions',                       // acceptEdits、bypassPermissions、default、plan
        };
        ```
- 使用方式
    ```
    import { query } from "@anthropic-ai/claude-agent-sdk";
    for await (const message of query({})) {
        // 处理消息体
    }
    ```

- 心得
    - permissionMode 配置 bypassPermissions，allowedTools 配置所有工具后，就可以自动化处理。
    - permissionMode 有:"plan"模式. 可以用子Agent模式来规划任务。


## 高阶用法
- agents 定义子Agent
