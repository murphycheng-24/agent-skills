---
name: bootstrap-project-ai-governance
description: Analyze an existing, scaffolded, or empty software repository and establish a tool-agnostic AI governance baseline, including project instructions, verified project context, evidence-based coding style, design-system documentation, cross-Agent adapters, and a shared project-memory lifecycle. Use when users ask to initialize, bootstrap, migrate, standardize, or audit AI-ready project documentation for Codex, Claude Code, Cursor, or other coding Agents.
---

# 初始化项目 AI 治理

为软件仓库建立可验证、可维护、跨 Agent 的工程约束与项目记忆体系。根据仓库证据生成内容，不把模板占位符或推测写成事实。

## 必读资源

开始前完整读取：

1. `references/discovery.md`：判断项目模式并采集证据。
2. `references/document-contracts.md`：确定文件 owner、目录和输出 contract。
3. `references/acceptance.md`：实施前矩阵和最终验收。

使用 `assets/templates/` 作为输出骨架，不得机械覆盖现有文件。

## 成功标准

- 现有项目的每条现状结论都能指向代码、配置、测试、设计稿或用户确认。
- 空项目只把用户明确选择写成初始决策；缺少阻断性输入时先询问。
- `AGENTS.md` 是治理协议 owner，工具专属入口保持为薄引用。
- coding-style、project context、design system 和 project memory 各有单一 owner。
- 项目记忆支持 `ADD`、`UPDATE`、`DELETE`、`NOOP`，历史由 Git 保存。
- 保留用户现有改动，不自动 stage、commit 或 push。
- 生成文件通过项目 formatter、路径检查和适用的测试或构建门禁。

## 工作流

### 1. Pre-flight

1. 确认仓库根目录、Git 状态和用户授权范围。
2. 完整读取已有 Agent 指令、项目文档、manifest、构建配置、源码、测试、全局样式和 design token。
3. 将仓库分类为 `EXISTING`、`SCAFFOLDED` 或 `EMPTY`。
4. 明确假设、风险、取舍和可验证目标。
5. 发现未提交改动或已有同名文件时保留它们；遇到重叠修改先停止覆盖。

### 2. 建立发现清单

按 `references/discovery.md` 输出证据表，至少覆盖：

- 技术栈、包管理器、构建和测试命令；
- 实际目录、模块边界、API 和状态管理；
- 代码命名、类型、错误处理和测试模式；
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

### 6. 初始化项目记忆

建立当前事实入口和维护 Skill，确保：

- 每个正常完成任务都分类为 `ADD`、`UPDATE`、`DELETE` 或 `NOOP`；
- 首次 `ADD` 替换“暂无。”；
- 新信息替代旧信息时原位更新或删除；
- 每条事实只有一个 owner；
- 进程强制终止或用户停止生成不要求写回；
- 记忆清理后仍超过 300 行才按业务边界拆分。

### 7. 接入 Agent

- Codex：让仓库根 `AGENTS.md` 成为统一入口。
- Claude Code：让 `CLAUDE.md` 只引用 `AGENTS.md` 和项目记忆。
- Cursor：创建 `alwaysApply: true` 的薄入口，只要求读取 `AGENTS.md`。
- 其他 Agent：使用其项目级指令入口引用 `AGENTS.md`；不复制治理内容。

### 8. 验证与交付

执行 `references/acceptance.md`。完整重读所有生成文件，确认没有占位符、证据错误、重复 owner、失效链接或无关改动。输出前后矩阵、验证结果和 `BLOCKED` 项。

## 输出

先给结论，再给：

1. 项目模式与证据摘要。
2. 文件迁移矩阵。
3. 已生成或更新的文件。
4. design system 的证据、决策、偏差和未知项。
5. memory lifecycle 与 Agent 接入结果。
6. formatter、测试、构建、链接和 diff 验证。
7. 未解决问题及最小确认方式。

说明实际修改及原因；区分已验证事实、用户决策和未确认项。
