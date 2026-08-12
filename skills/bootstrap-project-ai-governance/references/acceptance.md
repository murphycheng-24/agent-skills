# 验收标准

## 修改前矩阵

| 文件 | 动作 | 当前 owner | 目标 owner | 证据 | 风险 | 验证 |
| ---- | ---- | ---------- | ---------- | ---- | ---- | ---- |

动作只使用：`ADD`、`MERGE`、`KEEP`、`DELETE`、`BLOCKED`。

## 必须通过

1. 所有模板占位符均已替换，不存在 `{{...}}`、TODO 或示例项目名。
2. 所有引用路径存在，大小写与仓库一致。
3. manifest、lockfile、包管理器和执行命令一致。
4. 目录说明只包含真实目录；Empty Project 的规划目录明确标记为决策。
5. coding-style 至少抽样三个代表性源码或全部现有源码（取较小者）验证。
6. design system 的现状结论有 token、样式、组件、页面、截图或设计稿证据。
7. 已实现、已确认期望、实际 bug 和未知项没有混写。
8. `AGENTS.md` 是协议 owner，Claude/Cursor/其他入口没有复制完整规则。
9. `coding-style.md` 是 commit message 唯一 owner，规则有仓库证据或最小基线，不与其他文件重复。
10. commit contract 明确格式、type、scope、subject、body、例外和 G1/G2/G3；执行等级不高于 hook/CI 实际验证结果。
11. Existing Project 的既有 Git 规则未被静默覆盖；文档、hook 或 CI 冲突时结果为 `BLOCKED`。
12. 不自动增加 Git 校验依赖，不自动 stage、commit、push 或改写历史，不覆盖无关未提交改动。
13. 针对修改文件运行 formatter 和 `git diff --check`。
14. 修改代码、测试或构建配置时执行项目规定的最小门禁。
15. `project-memory lint` 通过；存在多个记忆文件时 `lint --all` 通过；初始化、迁移、Adapter 或协议变化时 `project-memory doctor`（或多个文件时 `--all`）通过。
16. baseHash 冲突、重复 ID、重复 statement、越界路径和高置信 secret 都能失败。
17. 每个 Agent 标明 L1/L2/L3，支持声明不高于实际 E2E 结果。
18. `AGENTS.md` 定义 L0 轻路径，以及「入口 + 相关分册」的按域读取/写回协议；未命中 L0 时不得默认要求读全部分册。
19. 若已按域拆分：根入口是路由索引且不含大段单一领域细则；每个分册有独立数据块；路由表链接有效；跨分册无重复完整结论。
20. 维护 Skill 要求输出事实数、估算 token 和按域体积；用户明确要求拆分时允许未超阈值拆分。

## Smoke Test

使用临时仓库或可回滚 fixture 执行 CLI E2E：

1. `ADD` 一个带 evidence 的虚拟事实并能被 `query` 读取。
2. 创建两个相同 baseHash 的 `UPDATE` proposal；应用一个后另一个必须冲突失败。
3. secret 和重复事实必须被拒绝。
4. `DELETE` 后查询结果为空；`NOOP` 不改变文件 hash。
5. `lint` 和 `doctor` 通过，事件中存在 proposal、apply 和 conflict。
6. 删除 fixture，禁止把模拟事实留在项目记忆。

## 最终输出

| 输出       | 内容                                       |
| ---------- | ------------------------------------------ |
| 完成率     | 每个治理组成部分的完成比例                 |
| 迁移矩阵   | 文件、动作、owner、证据、结果              |
| 设计系统   | 实现、决策、偏差、未知                     |
| 记忆系统   | protocol、CRUD、冲突、安全、事件、E2E、按域读取/拆分、L0 |
| Git 治理   | contract、owner、证据、G1/G2/G3、冲突      |
| Agent 接入 | Codex、Claude、Cursor、其他工具及 L1/L2/L3 |
| 验证       | formatter、链接、测试、构建、diff          |
| 未决项     | `BLOCKED` 项和最小确认方式                 |

任何未执行的验证必须说明原因，不得声称通过。
