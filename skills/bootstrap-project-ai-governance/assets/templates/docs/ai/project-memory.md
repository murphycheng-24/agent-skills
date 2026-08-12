# {{PROJECT_NAME}} 项目记忆

> 本文件是项目记忆**统一入口与路由索引**；协议以 [`AGENTS.md`](../../AGENTS.md#项目记忆协议) 为准，历史变化由 Git 保存。

事实数据块由 `project-memory` CLI 管理，Agent 不得直接编辑。稳定事实应迁移到 API 文档、测试、coding-style 或业务规范，并从数据块删除。

## 领域路由

未拆分前，本文件同时持有全部事实数据块。当选择性读取已受影响，或用户明确要求按域拆分时，按真实业务边界创建分册，例如：

| 领域 | 分册 | 适用任务 |
| --- | --- | --- |
| （示例）核心域 A | [`project-memory/domain-a.md`](./project-memory/domain-a.md) | 与域 A 相关的需求与契约 |
| （示例）核心域 B | [`project-memory/domain-b.md`](./project-memory/domain-b.md) | 与域 B 相关的需求与契约 |

- 分册使用稳定业务域名，禁止年份、月份、序号或会话名。
- 根入口只保留跨域事实、路由表和必要摘要链接。
- 任务读取：先读本入口，再只读相关分册；CRUD 使用 `project-memory ... --memory <分册路径>`。
- 校验多个记忆文件：`project-memory lint --all` / `project-memory doctor --all`。

<!-- project-memory-data:start -->

```json
{
  "protocolVersion": "0.2",
  "facts": []
}
```

<!-- project-memory-data:end -->
