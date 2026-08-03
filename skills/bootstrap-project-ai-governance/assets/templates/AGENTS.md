# {{PROJECT_NAME}} — AI Agent Instructions

## 规则真源

- `docs/ai/project-context.md`：当前项目结构、技术栈、命令和边界。
- `docs/ai/coding-style.md`：项目代码、类型、API、测试和 Git 规范。
- `docs/ai/engineering-discipline.md`：通用工程行为准则。
- `docs/ai/design-system.md`：视觉 token、布局、组件、状态和业务页面规范。
- `docs/ai/project-memory.md`：所有 Agent 共享的当前项目事实入口。
- 本文件只提供强制入口和协议；禁止复制以上 owner 的完整内容。

## 执行方式

- 处理项目任务前完整读取项目记忆，并按任务范围读取相关真源。
- 修改前读取目标文件、相邻实现、调用方和相关测试。
- 先说明假设、范围、风险和验证目标，再实施最小变更。
- 保留已有未提交改动；遇到重叠修改时停止覆盖并说明冲突。
- 不主动迁移、升级依赖、增加兼容或建立平行规范。
- 当前代码与已确认期望不一致时，区分“期望行为”和“实际 bug”。
- commit message 遵循 `docs/ai/coding-style.md`；生成前检查 staged diff，不自动 stage、commit、push 或改写历史。

## 项目记忆协议

- 本节是项目记忆协议唯一 owner；`docs/ai/project-memory.md` 是当前事实的唯一数据入口。
- 项目使用 project-memory protocol v0.2；运行命令以 `docs/ai/project-context.md` 为准。
- Agent 不得直接编辑 `project-memory-data` 数据块，所有 CRUD 必须经 `project-memory propose` 和 `project-memory apply`。
- 每条事实只能有一个 owner，其他位置最多保留链接。
- 实施任务或用户明确确认决策正常完成时，将事实分类为 `ADD`、`UPDATE`、`DELETE` 或 `NOOP`；Review、解释和诊断默认 `NOOP`，除非用户同时确认新的持久事实。
- `ADD`、`UPDATE`、`DELETE` 必须在最终回复前通过 CLI 实际应用；`NOOP` 必须提供原因并应用 NOOP proposal。
- 新信息替代旧信息时使用 `UPDATE` 或 `DELETE`，不得追加冲突副本；历史由 Git 保存。
- 强制终止或用户停止生成无需写回，也不计入持久事实写回率。
- 只记录已确认需求、已验证 contract、架构决策和可复用根因。
- 禁止记录聊天流水、临时状态、推测、密钥、账号和个人数据。
- `apply` 发生 baseHash 冲突时重新读取并提议，禁止自动语义合并。
- 整理、去重、迁移或拆分记忆时读取 `docs/ai/skills/maintain-project-memory/SKILL.md`。

## 验证

- 文档：运行项目 formatter 和 `git diff --check`。
- 项目记忆：运行 `project-memory lint`；接入或协议变化时再运行 `project-memory doctor`。
- 源码：执行 `docs/ai/project-context.md` 中确认的 type、test、lint 或 build 门禁。
- 无法执行时说明原因，不得声称通过。

## 最终回复

说明修改、验证和风险，并报告：`项目记忆：已更新——<摘要>` 或 `项目记忆：无需更新——<理由>`。
