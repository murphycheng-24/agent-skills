# Git 提交治理

## Owner 与边界

`coding-style.md` 是 commit message 规则唯一 owner；`AGENTS.md` 只提供入口和 Git 操作边界。不得自动 stage、commit、push 或改写 Git history。

## 证据与迁移

按以下来源识别当前规则：正式规范、commitlint 配置、Git hook、CI、package scripts、Git history。用户最新确认优先；其余来源冲突时标为 `BLOCKED`，不得静默选择或覆盖。

| 当前情况           | 动作      |
| ------------------ | --------- |
| 已有完整一致规则   | `KEEP`    |
| 已有部分一致规则   | `MERGE`   |
| 没有规则或提交历史 | `ADD`     |
| 文档与执行规则冲突 | `BLOCKED` |

Existing Project 不重写历史提交。新增或合并规则只约束后续提交。

## 最小基线

没有既有规则时采用：

```text
<type>(<scope>): <subject>
```

- `type` 必须是 `feat`、`fix`、`refactor`、`docs`、`test`、`chore`、`style`、`perf` 或 `revert`。
- `scope` 可选，从仓库中的真实业务域或模块名选择；不得预建 scope 清单。
- `subject` 必填，使用项目工作语言，不超过 72 个字符，不以句号结尾。
- 多文件行为变化、架构调整或迁移补充 body，说明核心变化、兼容性影响和验证方式。
- Agent 生成 message 前读取 staged diff，不只根据用户口头描述推断。
- commit message 禁止署名 AI、模型名、Agent 工具名或“由 AI 生成”。
- Merge、Revert、`fixup!` 和 `squash!` 等自动消息只在项目工作流实际使用时放行。

采用本节基线时，将规则来源记录为“方法论默认基线”，并标记为初始决策；不得描述为仓库既有事实或用户历史决策。

## 执行等级

| 等级 | 能力                       | 声明条件                          |
| ---- | -------------------------- | --------------------------------- |
| G1   | `coding-style.md` 文档规则 | 规则完整且 owner 唯一             |
| G2   | G1 + `commit-msg` hook     | 合法与非法样例均已实际验证        |
| G3   | G2 + CI 校验               | hook 与 CI 使用一致规则并通过验证 |

优先复用现有 hook、commitlint、package script 和 CI。项目没有相关工具时保持 G1；只有用户确认需要更高等级后才增加脚本、配置或依赖。

## 验证

至少检查一个合法 message 和以下适用的非法情况：未知 type、空 subject、超长 subject、句号结尾。G2/G3 还必须验证执行入口确实阻断非法 message；只存在配置文件不能算已执行。
