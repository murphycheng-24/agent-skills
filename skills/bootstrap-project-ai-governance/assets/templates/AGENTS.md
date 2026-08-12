# {{PROJECT_NAME}} — AI Agent Instructions

## 规则真源

- `docs/ai/project-context.md`：当前项目结构、技术栈、命令和边界。
- `docs/ai/coding-style.md`：项目代码、类型、API、测试和 Git 规范。
- `docs/ai/engineering-discipline.md`：通用工程行为准则。非简单任务开始前必须完整读取；L0 轻路径除外，见下节。
- `docs/ai/design-system.md`：视觉 token、布局、组件、状态和业务页面规范。仅 UI/样式/视觉审查时读取；L0 除外。
- `docs/ai/project-memory.md`：共享项目记忆统一入口与路由索引；领域细则可在 `docs/ai/project-memory/*.md` 分册。
- 本文件只提供强制入口和协议；禁止复制以上 owner 的完整内容。

## 任务分级（L0 轻路径）

- 仅定义 L0；未命中 L0 的任务仍按本文件其余章节的完整门禁执行，不得自行发明更高等级例外。
- 用户声明 `【轻路径】` / `L0`，或任务同时满足下列全部条件时，按 L0 执行：
  1. 纯解释（只读、不改文件），或单文件 typo（错别字/注释/无关格式），或与业务语义无关的标识符重命名；
  2. 不改变运行时行为、API 契约、校验规则、默认值、UI 视觉语义或数据兼容；
  3. 不依赖项目记忆中的业务规则判断。
- L0 允许读取：目标文件；以及已注入上下文的本文件（`AGENTS.md`）相关约束。
- L0 禁止读取：`docs/ai/engineering-discipline.md` 全文、`docs/ai/design-system.md`（及已拆分的 design-system 分册）。
- L0 可跳过完整项目记忆：不必读取 `docs/ai/project-memory.md` 入口及其领域分册，也不必为完成本任务运行记忆查询。最终回复仍须给出项目记忆结论；L0 默认 `NOOP`，除非本轮产生了用户明确确认且需跨会话保存的新事实。
- L0 不要求为完成本任务再完整打开 `docs/ai/coding-style.md`；已注入的本文件工程约束仍然生效。
- 边界不清、可能影响行为，或改动超出单文件 typo/无关重命名时，必须立即退出 L0，补读项目记忆与对应门禁后再继续。
- 最终回复须标明 `任务分级：L0`，便于审计是否误用轻路径。

## 执行方式

- 处理项目任务前先读取项目记忆入口，再按任务领域只读取相关分册或对相关 `--memory` 执行 `query`；禁止无必要地默认读全部分册或全量事实。L0 与项目无关的简单任务除外。
- 修改前读取目标文件、相邻实现、调用方和相关测试。
- 先说明假设、范围、风险和验证目标，再实施最小变更。
- 保留已有未提交改动；遇到重叠修改时停止覆盖并说明冲突。
- 不主动迁移、升级依赖、增加兼容或建立平行规范。
- 当前代码与已确认期望不一致时，区分“期望行为”和“实际 bug”。
- commit message 遵循 `docs/ai/coding-style.md`；生成前检查 staged diff，不自动 stage、commit、push 或改写历史。

## 项目记忆协议

- 本节是项目记忆协议唯一 owner；`docs/ai/project-memory.md` 是统一入口与路由索引，领域细则可在 `docs/ai/project-memory/*.md`（或项目等价 `doc/ai/...` 路径）分册。
- 项目使用 project-memory protocol v0.2；运行命令以 `docs/ai/project-context.md` 为准。
- Agent 不得直接编辑 `project-memory-data` 数据块，所有 CRUD 必须经 `project-memory propose` 和 `project-memory apply`。
- 每条事实只能有一个 owner；owner 必须是实际持有该事实数据块的记忆文件路径。跨域事实写根入口；领域事实写对应分册，并通过 `--memory` 指向该文件。
- 若新增领域分册：先更新根入口路由表，再创建分册记忆文件，再写入事实。
- 实施任务或用户明确确认决策正常完成时，将事实分类为 `ADD`、`UPDATE`、`DELETE` 或 `NOOP`；Review、解释和诊断默认 `NOOP`，除非用户同时确认新的持久事实。
- `ADD`、`UPDATE`、`DELETE` 必须在最终回复前通过 CLI 实际应用；`NOOP` 必须提供原因并应用 NOOP proposal。
- 新信息替代旧信息时使用 `UPDATE` 或 `DELETE`，不得追加冲突副本；历史由 Git 保存。
- 强制终止或用户停止生成无需写回，也不计入持久事实写回率。
- 只记录已确认需求、已验证 contract、架构决策和可复用根因。
- 禁止记录聊天流水、临时状态、推测、密钥、账号和个人数据。
- `apply` 发生 baseHash 冲突时重新读取并提议，禁止自动语义合并。
- 整理、去重、迁移或拆分记忆时读取 `docs/ai/skills/maintain-project-memory/SKILL.md`。用户明确要求按域拆分时，即使未超过体量阈值也可以拆分。

## 验证

- 文档：运行项目 formatter 和 `git diff --check`。
- 项目记忆：运行 `project-memory lint`；存在多个记忆文件时使用 `project-memory lint --all`；接入或协议变化时再运行 `project-memory doctor`（或多个文件时 `--all`）。
- 源码：执行 `docs/ai/project-context.md` 中确认的 type、test、lint 或 build 门禁。
- 无法执行时说明原因，不得声称通过。

## 最终回复

说明修改、验证和风险，并报告：`项目记忆：已更新——<摘要>` 或 `项目记忆：无需更新——<理由>`。若使用了 L0，同时报告 `任务分级：L0`。
