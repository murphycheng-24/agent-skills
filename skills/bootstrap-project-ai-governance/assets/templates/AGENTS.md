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

## 项目记忆协议

- 本节是项目记忆协议唯一 owner；`docs/ai/project-memory.md` 只保存当前事实和必要路由。
- 每条事实只能有一个 owner，其他位置最多保留链接。
- 正常完成任务、最终回复前，将结果分类为 `ADD`、`UPDATE`、`DELETE` 或 `NOOP`。
- `ADD`、`UPDATE`、`DELETE` 必须在最终回复前实际写回；`NOOP` 必须说明理由。
- 首次 `ADD` 必须删除对应分区的“暂无。”，两者不得共存。
- 新信息替代旧信息时原位修改或删除，历史由 Git 保存。
- 强制终止或用户停止生成无需写回，也不计入持久事实写回率。
- 只记录已确认需求、已验证 contract、架构决策和可复用根因。
- 禁止记录聊天流水、临时状态、推测、密钥、账号和个人数据。
- 写回前重新读取最新记忆；不得自动 stage、commit 或 push。
- 整理、去重、迁移或拆分记忆时读取 `docs/ai/skills/maintain-project-memory/SKILL.md`。

## 验证

- 文档：运行项目 formatter 和 `git diff --check`。
- 源码：执行 `docs/ai/project-context.md` 中确认的 type、test、lint 或 build 门禁。
- 无法执行时说明原因，不得声称通过。

## 最终回复

说明修改、验证和风险，并报告：`项目记忆：已更新——<摘要>` 或 `项目记忆：无需更新——<理由>`。
