# 文档 Contract

## Owner 模型

| Owner                       | 职责                                         | 禁止内容                     |
| --------------------------- | -------------------------------------------- | ---------------------------- |
| `AGENTS.md`                 | Agent 路由、执行纪律、记忆协议、验证门禁     | 大段项目事实和工具专属复制   |
| `project-context.md`        | 当前技术栈、目录、命令、模块边界             | 编码偏好和历史流水           |
| `coding-style.md`           | 已确认的代码、类型、API、测试和 Git 规范     | 产品需求和页面视觉细节       |
| `engineering-discipline.md` | 通用执行、验证和自审准则                     | 项目特有事实                 |
| `design-system.md`          | 视觉 token、布局、组件、状态、页面模式和偏差 | 无证据的理想化规范           |
| `project-memory.md`         | 当前有效、跨会话复用的事实和必要路由         | 协议复制、聊天流水和历史版本 |
| 代码/测试/API 规范          | 可直接验证的稳定 contract                    | 重复的记忆副本               |

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
docs/ai/skills/maintain-project-memory/SKILL.md
docs/ai/skills/maintain-project-memory/agents/openai.yaml
```

Existing Project 保留已有约定。若已经存在等价文档，将模板 contract 合并到现有 owner，不创建平行文件。

## 文件要求

### `AGENTS.md`

- 指向项目事实、coding style、engineering discipline、design system 和 memory owner。
- 定义读取顺序、最小变更、冲突处理、验证和 Git 边界。
- 定义 memory CRUD、正常结束边界、单一 owner 和写回验证。

### `project-context.md`

- 所有路径和命令必须存在。
- 标记最后验证日期和证据范围。
- 不把临时分支状态写成长期事实。

### `coding-style.md`

- 从代表性代码、测试和配置归纳。
- 明确哪些是当前一致模式、哪些是新决策、哪些存在分歧。
- 不主动升级依赖或引入未使用的架构。

### `engineering-discipline.md`

- 覆盖读后再写、显式假设、简单性、手术式修改、验证、目标驱动、调试、依赖、沟通和自审。
- 保持 tool-agnostic，不复制产品事实。

### `design-system.md`

- Existing Project 记录证据支持的实现和偏差。
- Empty Project 记录用户确认的初始决策。
- 只有多个真实业务域或单文件明显影响按需读取时才拆分。

### `project-memory.md`

- 只保存当前有效、已确认、跨会话复用的事实。
- 默认章节：需求与期望、API 与数据、架构决策、已知偏差与根因、环境与验证经验。
- 首次 `ADD` 删除“暂无。”；新事实替代旧事实时原位 `UPDATE` 或 `DELETE`。

### Agent 适配入口

- `CLAUDE.md` 仅 import `AGENTS.md` 和项目记忆。
- Cursor rule 使用 `alwaysApply: true` 并要求先读 `AGENTS.md`。
- 其他工具只增加相同语义的薄入口。
