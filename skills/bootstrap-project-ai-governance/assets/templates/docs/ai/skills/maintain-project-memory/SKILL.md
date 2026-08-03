---
name: maintain-project-memory
description: Maintain repository-shared project memory by deleting superseded facts, merging duplicate conclusions under one owner, promoting stable facts into canonical specifications or tests, removing facts already encoded by code and tests, and splitting files over 300 lines by business boundary. Use when users ask to clean, organize, compact, deduplicate, migrate, or split project memory.
---

# 整理项目记忆

## 执行前

1. 完整读取项目 Agent 指令、项目记忆和适用工程规范。
2. 检查 Git 状态，保留用户及其他 Agent 的修改。
3. 读取候选事实涉及的代码、测试、API 文档和业务规范。
4. 先输出假设、范围、风险、前后指标和迁移矩阵。

审查请求保持只读；只有整理、清理、压缩、迁移或拆分请求才修改文件。

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

1. `DELETE`：找到替代证据后直接删除，历史由 Git 保存。
2. `MERGE`：选择一个 owner，其他位置最多保留链接。
3. `PROMOTE`：迁入已有正式规范或最小行为测试，不建立平行规范。
4. `REMOVE_AS_ENCODED`：同时找到代码入口和验证目标行为的测试后删除重复事实。
5. 重新计算物理行数；清理后仍超过 300 行才按真实业务边界拆分，禁止按年份、月份或序号拆分。

代码行为与已确认期望不一致时标记为实际 bug，不得用 bug 覆盖期望。

## 并发与 Git

写回前重读最新记忆并检查 diff。重叠修改时停止覆盖。不得自动 stage、commit 或 push。

## 验证与输出

1. 重读修改文件并检查链接。
2. 搜索重复 owner。
3. 运行 formatter、`git diff --check` 和适用测试。
4. 输出文件数、行数、事实数、重复数、失效数、迁移矩阵、拆分结果、验证结果和 `BLOCKED` 项。
