# 文档 Contract

## Owner 模型

| Owner                       | 职责                                         | 禁止内容                           |
| --------------------------- | -------------------------------------------- | ---------------------------------- |
| `AGENTS.md`                 | Agent 路由、执行纪律、记忆协议、验证门禁、L0 | 大段项目事实和工具专属复制         |
| `project-context.md`        | 当前技术栈、目录、命令、模块边界             | 编码偏好和历史流水                 |
| `coding-style.md`           | 已确认的代码、类型、API、测试和 Git 规范     | 产品需求和页面视觉细节             |
| `engineering-discipline.md` | 通用执行、验证和自审准则                     | 项目特有事实                       |
| `design-system.md`          | 视觉 token、布局、组件、状态、页面模式和偏差 | 无证据的理想化规范                 |
| `project-memory.md`         | 记忆入口、跨域事实、领域路由索引             | 大段单一领域细则、聊天流水、历史版本 |
| `project-memory/*.md`       | 单一业务域的 v0.2 事实数据块                 | 跨域结论、与其他分册重复的完整事实 |
| 代码/测试/API 规范          | 可直接验证的稳定 contract                    | 重复的记忆副本                     |

同一完整结论只能有一个 owner，其他文件最多保留摘要和链接。

## 默认新项目结构

```text
AGENTS.md
CLAUDE.md
.cursor/rules/project.mdc
docs/ai/project-context.md
docs/ai/coding-style.md
docs/ai/engineering-discipline.md
docs/ai/design-system.md
docs/ai/project-memory.md
docs/ai/project-memory/          # 仅在按域拆分后创建
docs/ai/skills/maintain-project-memory/SKILL.md
docs/ai/skills/maintain-project-memory/agents/openai.yaml
```

Existing Project 保留已有约定。若已经存在等价文档，将模板 contract 合并到现有 owner，不创建平行文件。

## 文件要求

### `AGENTS.md`

- 指向项目事实、coding style、engineering discipline、design system 和 memory owner。
- 定义读取顺序、最小变更、冲突处理、验证和 Git 边界。
- 定义 memory CRUD、正常结束边界、单一 owner 和写回验证。
- 定义 L0 轻路径：纯解释、单文件 typo、无关业务重命名时可跳过 engineering-discipline 全文、design-system 与完整项目记忆。
- 定义按域读取与写回：先读记忆入口，再只读相关分册；领域事实写入对应 `--memory` owner，禁止默认全量读取。
- 定义 UI 任务的 skill 路由与 PDCA 门禁：按页面用途选用 `design-taste-frontend` 和 `impeccable`，保留品牌与项目 Design System 优先级；L0 与非 UI 任务跳过。具体视觉目标和证据只保存在 design-system owner。

### `project-context.md`

- 所有路径和命令必须存在。
- 标记最后验证日期和证据范围。
- 不把临时分支状态写成长期事实。

### `coding-style.md`

- 从代表性代码、测试和配置归纳。
- 明确哪些是当前一致模式、哪些是新决策、哪些存在分歧。
- 作为 commit message 唯一 owner，记录规则来源、格式、type、scope、subject、body、例外和 G1/G2/G3 执行等级。
- 没有既有规则时使用 `references/git-governance.md` 的最小基线；现有规则与 hook/CI 冲突时标为 `BLOCKED`。
- 不主动升级依赖或引入未使用的架构。

### `engineering-discipline.md`

- 覆盖读后再写、显式假设、简单性、手术式修改、验证、目标驱动、调试、依赖、沟通和自审。
- 保持 tool-agnostic，不复制产品事实。
- L0 任务可不完整读取本文件。

### `design-system.md`

- Existing Project 记录证据支持的实现和偏差。
- Empty Project 记录用户确认的初始决策。
- 只有多个真实业务域或单文件明显影响按需读取时才拆分。
- L0 与非 UI 任务不读取本文件。
- 有 UI 时按 `ui-design-quality.md` 记录页面用途、视觉目标、两个 skill 的实际入口/可用性、适用范围、冲突及视觉验收证据；无 UI 时标为 `NOT_APPLICABLE`，不生成虚构规范。
- 已有 `DESIGN.md` 或等价视觉规范时合并到该 owner 并调整引用，不另建平行文件；已有 `PRODUCT.md` 和 surface brief 保留其职责并引用。外部 skill 的 context/document 输出同样遵守此 owner 边界。

### `project-memory.md`

- 使用 `project-memory-data` 标记包围唯一 JSON 数据块，`protocolVersion` 为 `0.2`。
- 根文件是统一入口与路由索引；未拆分前可持有全部事实，拆分后只保留跨域事实和领域路由表。
- 只保存当前有效、已确认、跨会话复用的事实；类型限定为 requirement、api-contract、architecture、root-cause 和 environment。
- 每条事实包含稳定 ID、owner、statement、evidence 和 updatedAt；owner 必须是实际持有该事实的数据文件。
- Agent 不直接修改数据块；所有 CRUD 经过统一 CLI。新事实替代旧事实时使用 `UPDATE` 或 `DELETE`。
- 旧格式只在用户确认迁移后一次性转换，不长期双写。

### 领域记忆分册 `project-memory/*.md`

- 仅在选择性读取已受影响，或用户明确要求按域拆分时创建。
- 每个分册有独立 `project-memory-data` 数据块；CRUD 使用 `--memory <分册相对路径>`。
- 使用稳定业务域名；禁止按年份、月份、序号或会话拆分。
- 根入口路由表必须能定位到每个分册；分册之间不得重复完整结论。

### `project-memory` runtime

- 项目在 `project-context.md` 记录固定版本且已验证的 CLI 命令。
- `propose` 只生成候选和 baseHash；`apply` 校验最新 hash 后原子写入。
- `lint` 是每次写回门禁；多个记忆文件时使用 `lint --all`。
- `doctor` 用于初始化、Adapter 或协议变化；多个记忆文件时使用 `doctor --all`。
- 本地事件位于 Git metadata，不复制到正式记忆；正式写回率需要独立分母。

### Agent 适配入口

- `CLAUDE.md` 仅 import `AGENTS.md` 和项目记忆入口。
- Cursor rule 使用 `alwaysApply: true` 并要求先读 `AGENTS.md`。
- 其他工具只增加相同语义的薄入口，并按 L1/L2/L3 记录真实支持等级。
