---
name: maintain-project-memory
description: Maintain project-memory protocol v0.2 by deleting superseded facts, merging duplicate conclusions under one owner, promoting stable facts into canonical specifications or tests, removing facts already encoded by code and tests, and splitting oversized memory by business boundary. Use when users ask to clean, compact, deduplicate, migrate, or split repository-shared project memory.
---

# 整理项目记忆

## 执行前

1. 完整读取项目 Agent 指令、项目记忆入口、相关分册、`project-memory` runtime contract 和适用工程规范。
2. 运行 `project-memory lint`；存在多个记忆文件时运行 `project-memory lint --all`。检查 Git 状态并保留用户及其他 Agent 的修改。
3. 读取候选事实涉及的代码、测试、API 文档和业务规范。
4. 输出假设、范围、风险、前后指标和迁移矩阵。前后指标至少包含：文件数、事实数、估算 token、按域体积、重复数。

审查请求保持只读；只有整理、清理、压缩、迁移或拆分请求才修改文件。旧格式迁移必须先确认，不得静默双写。

## 分类

| 动作                | 条件                                        |
| ------------------- | ------------------------------------------- |
| `KEEP`              | 当前有效、可复用且没有更合适 owner          |
| `DELETE`            | 已被最新确认需求或决策替代                  |
| `MERGE`             | 与其他事实表达同一结论                      |
| `PROMOTE`           | 应由 API、测试、coding-style 或业务规范承载 |
| `REMOVE_AS_ENCODED` | 代码和测试已完整表达，且无额外理由或限制    |
| `BLOCKED`           | 证据冲突、owner 不明或需要确认              |

不得只因条目较旧、文件较长或措辞不同而删除。

## 固定顺序

1. `DELETE`：找到替代证据后通过 CLI 删除，历史由 Git 保存。
2. `MERGE`：选择一个 owner，保留一个事实 ID，其他位置最多保留链接。
3. `PROMOTE`：迁入已有正式规范或最小行为测试，再通过 CLI 删除记忆副本。
4. `REMOVE_AS_ENCODED`：同时找到代码入口和目标行为测试后删除重复事实。
5. 重新统计事实数、token 和业务域，再决定是否拆分：
   - 选择性读取已经受到影响时，按真实业务边界拆分；
   - 用户明确要求按域拆分时，即使未超过体量阈值也可以拆分；
   - 禁止按年份、月份、序号或会话拆分；
   - 拆分后根入口只保留跨域事实与路由表，领域事实写入 `docs/ai/project-memory/<domain>.md`（或项目等价路径），并通过 `--memory` 维护；
   - 同步检查 `AGENTS.md` 的按域读取/写回规则与路由表一致。

代码行为与已确认期望不一致时标记为实际 bug，不得用 bug 覆盖期望。

## 写入与并发

- 每个事实使用 `project-memory propose` 产生 proposal，再使用 `project-memory apply` 应用；领域分册必须带正确 `--memory`。
- 每次成功 apply 后重新 propose 下一项，避免复用旧 baseHash。
- baseHash 冲突时停止，重新读取并输出冲突；禁止自动语义合并。
- 不得直接编辑结构化数据块，不得自动 stage、commit 或 push。

## 验证与输出

1. 运行 `project-memory lint` 或 `lint --all`；接入或协议改变时运行 `doctor` 或 `doctor --all`。
2. 重读修改文件并检查入口链接、重复 ID、重复 statement、跨分册重复 owner 和路由表。
3. 运行 formatter、`git diff --check` 和适用测试。
4. 输出事实数、token、按域体积、重复数、失效数、迁移矩阵、拆分结果、冲突、验证结果和 `BLOCKED` 项。
