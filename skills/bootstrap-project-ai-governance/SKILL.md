---
name: bootstrap-project-ai-governance
description: Analyze an existing, scaffolded, or empty software repository and establish a production-oriented, tool-agnostic AI governance baseline with project instructions, verified context, coding style, Git commit governance, design-system documentation, cross-Agent adapters, and the executable project-memory protocol v0.2. Use when users ask to initialize, bootstrap, migrate, standardize, harden, or audit AI-ready repositories for Codex, Claude Code, Cursor, or other coding Agents.
---

# 初始化项目 AI 治理

为软件仓库建立可验证、可维护、跨 Agent 的工程约束与项目记忆体系。根据仓库证据生成内容，不把模板占位符或推测写成事实。

方法论版本：`0.3`。这是生产化基线，不代表所有 Agent 已达到 lifecycle hook 级硬保障。

## 必读资源

开始前完整读取：

1. `references/discovery.md`：判断项目模式并采集证据。
2. `references/document-contracts.md`：确定文件 owner、目录和输出 contract。
3. `references/git-governance.md`：确定 commit message contract、迁移策略和执行等级。
4. `references/runtime-memory.md`：建立可执行记忆 contract、CLI 和支持等级。
5. `references/acceptance.md`：实施前矩阵和最终验收。

使用 `assets/templates/` 作为输出骨架，不得机械覆盖现有文件。

## 成功标准

- 现有项目的每条现状结论都能指向代码、配置、测试、设计稿或用户确认。
- 空项目只把用户明确选择或本方法明确规定的默认基线写成初始决策；缺少阻断性输入时先询问。
- `AGENTS.md` 是治理协议 owner，工具专属入口保持为薄引用。
- coding-style、project context、design system 和 project memory 各有单一 owner。
- commit message 由 coding-style 持有；规则有仓库证据或明确基线，执行等级不高于 hook/CI 实际能力。
- 项目记忆支持 `ADD`、`UPDATE`、`DELETE`、`NOOP`，历史由 Git 保存。
- project-memory protocol v0.2 通过统一 CLI 执行 CRUD、结构校验、baseHash 冲突拒绝和本地事件记录。
- Agent 支持按 L1/L2/L3 标注；没有 lifecycle hook 的工具不得宣称生产级硬保障。
- 保留用户现有改动，不自动 stage、commit 或 push。
- 生成文件通过项目 formatter、路径检查和适用的测试或构建门禁。

## 工作流

### 1. Pre-flight

1. 确认仓库根目录、Git 状态和用户授权范围。
2. 完整读取已有 Agent 指令、项目文档、manifest、构建配置、源码、测试、全局样式和 design token。
3. 将仓库分类为 `EXISTING`、`SCAFFOLDED` 或 `EMPTY`。
4. 检查目标 Agent 是否支持项目指令、CLI/MCP 和正常完成 hook，输出支持等级。
5. 明确假设、风险、取舍和可验证目标。
6. 发现未提交改动或已有同名文件时保留它们；遇到重叠修改先停止覆盖。

### 2. 建立发现清单

按 `references/discovery.md` 输出证据表，至少覆盖：

- 技术栈、包管理器、构建和测试命令；
- 实际目录、模块边界、API 和状态管理；
- 代码命名、类型、错误处理和测试模式；
- commit message、Git hook、CI 校验和历史提交模式；
- 色彩、字体、间距、布局、组件状态、响应式和 accessibility；
- 已有 Agent 入口、规则文件和知识 owner；
- 已知事实、期望行为、实际 bug 和未知项。

不得仅根据 README、模板目录或依赖名称推断实际行为。

### 3. 输出迁移矩阵

修改前列出每个目标文件的 `ADD`、`MERGE`、`KEEP` 或 `BLOCKED` 动作、信息来源、owner、风险和验证方式。

- `EXISTING`：默认合并和引用，不覆盖。
- `SCAFFOLDED`：复用 scaffold 约定，补齐缺失治理文件。
- `EMPTY`：先确认项目名称、产品类型、技术栈、包管理器、视觉输入和目标 Agent；缺失会改变架构的输入时停止生成对应事实。

### 4. 生成最小文件体系

按 `references/document-contracts.md` 和模板生成必要文件。现有项目继续使用已存在的 `doc/ai`、`docs/ai` 或等价目录；不得为了统一模板迁移路径。

默认新项目生成：

```text
AGENTS.md
docs/ai/project-context.md
docs/ai/coding-style.md
docs/ai/engineering-discipline.md
docs/ai/design-system.md
docs/ai/project-memory.md
docs/ai/skills/maintain-project-memory/SKILL.md
CLAUDE.md
.cursor/rules/project.mdc
```

只有出现多个真实业务域或单一设计系统文件已难以按需读取时，才拆分 `design-system.md`；不为未来场景预建空目录。

### 5. 生成设计系统

- `EXISTING`：从 token、CSS/SCSS、Tailwind、组件库、页面源码、设计稿和截图提取；区分已实现、已确认期望、已知偏差和未定义。
- `SCAFFOLDED`：同时记录 scaffold 已实现部分和用户确认的初始决策。
- `EMPTY`：依据产品与品牌输入生成初始规范，并明确标记为决策而非现状总结。

不得虚构颜色、组件、断点、业务页面或 accessibility 能力。

### 6. 建立 Git 提交治理

按 `references/git-governance.md` 处理：

- 检查正式规范、commitlint、Git hook、CI、package scripts 和 Git history；
- Existing Project 保留已执行的现有规则；证据冲突时标为 `BLOCKED`，不得静默覆盖；
- 没有现有规则时采用最小 Conventional Commits 基线，并按项目工作语言和真实业务域填写 subject 与 scope；
- 按文档、hook、CI 的实际能力标记 G1/G2/G3；没有运行证据不得升级等级；
- 优先复用现有工具，不为 commit message 校验自动增加依赖；
- 不自动 stage、commit、push 或改写 Git history。

### 7. 初始化项目记忆

按 `references/runtime-memory.md` 建立当前事实入口、固定版本的 CLI 命令和维护 Skill，确保：

- 实施任务或用户明确确认决策正常完成时分类为 `ADD`、`UPDATE`、`DELETE` 或 `NOOP`；Review、解释和诊断默认 `NOOP`；
- 所有 CRUD 经过 `propose` 和 `apply`，Agent 不直接编辑结构化数据块；
- 新信息替代旧信息时使用 `UPDATE` 或 `DELETE`；
- 每条事实只有一个 owner；
- 写入使用 baseHash 乐观锁并原子替换，冲突时拒绝覆盖；
- `lint` 检查 contract、重复事实、placeholder 和高置信 secret；`doctor` 检查入口、Git 和 Adapter；
- 进程强制终止或用户停止生成不要求写回；
- 只有事实数、token、领域数量或检索指标证明选择性读取受影响时才按业务边界拆分。

Existing Project 没有 v0.2 数据块时只输出迁移矩阵；未经确认不得转换或双写旧格式。

### 8. 接入 Agent

- Codex：让仓库根 `AGENTS.md` 成为统一入口，并验证 CLI 可调用。
- Claude Code：让 `CLAUDE.md` 只引用 `AGENTS.md` 和项目记忆，并验证 CLI 可调用。
- Cursor：创建 `alwaysApply: true` 的薄入口，只要求读取 `AGENTS.md`，并验证 CLI 可调用。
- 其他 Agent：使用其项目级指令入口引用 `AGENTS.md`；不复制治理内容。只有通过统一 CLI 和跨 Agent E2E 才能从 L1 升为 L2/L3。

### 9. 验证与交付

执行 `references/acceptance.md`。完整重读所有生成文件，运行 `project-memory lint` 和 `doctor`，确认没有占位符、证据错误、重复 owner、失效链接、静默兼容或无关改动。输出前后矩阵、支持等级、运行指标、验证结果和 `BLOCKED` 项。

## 输出

先给结论，再给：

1. 项目模式与证据摘要。
2. 文件迁移矩阵。
3. 已生成或更新的文件。
4. design system 的证据、决策、偏差和未知项。
5. memory lifecycle 与 Agent 接入结果。
6. Git commit contract、执行等级及证据。
7. formatter、测试、构建、链接和 diff 验证。
8. 未解决问题及最小确认方式。

说明实际修改及原因；区分已验证事实、用户决策和未确认项。
