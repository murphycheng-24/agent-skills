# {{PROJECT_NAME}} — Coding Style

> 现状规则必须由代表性源码、测试或配置验证；新项目规则标记为初始决策。

## Language 与 Framework

- {{LANGUAGE_RULE}}
- {{FRAMEWORK_RULE}}

## 命名与目录

- {{NAMING_RULE}}
- {{DIRECTORY_RULE}}

## 类型与 Contract

- {{TYPE_RULE}}
- {{API_CONTRACT_RULE}}

## 状态与副作用

- {{STATE_RULE}}
- {{SIDE_EFFECT_RULE}}

## 错误处理

- {{ERROR_RULE}}

## UI 与样式

- 视觉规则以 `design-system.md` 为 owner。
- {{UI_CODE_RULE}}

## 测试与验证

- {{TEST_RULE}}
- {{VALIDATION_COMMANDS}}

## Git

- commit message 格式：`<type>(<scope>): <subject>`。
- `type` 使用 `feat`、`fix`、`refactor`、`docs`、`test`、`chore`、`style`、`perf` 或 `revert`。
- `scope` 可选，使用仓库中真实存在的业务域或模块名。
- `subject` 使用项目工作语言，不超过 72 个字符，不以句号结尾。
- 多文件行为变化、架构调整或迁移补充 body，说明核心变化、兼容性影响和验证方式。
- Agent 生成 message 前读取 staged diff；禁止在 message 中署名 AI、模型名或 Agent 工具名。
- 规则来源与项目差异：{{GIT_RULE_SOURCE_AND_DIFFERENCE}}
- 执行等级与证据：{{GIT_ENFORCEMENT_LEVEL_AND_EVIDENCE}}

## 已知分歧

- {{STYLE_DIVERGENCE}}
