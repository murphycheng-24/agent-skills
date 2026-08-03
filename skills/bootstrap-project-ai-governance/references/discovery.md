# 项目发现规则

## 项目模式

| 模式         | 判定                         | 处理原则                     |
| ------------ | ---------------------------- | ---------------------------- |
| `EXISTING`   | 已有业务代码、配置或正式文档 | 以仓库证据为准，合并而非覆盖 |
| `SCAFFOLDED` | 有框架和基础目录，但业务尚少 | 保留 scaffold 约定，只补缺口 |
| `EMPTY`      | 空目录或只有需求说明         | 以用户确认的初始决策为准     |

## 必查证据

| 维度       | 优先证据                                     | 不足时的动作                       |
| ---------- | -------------------------------------------- | ---------------------------------- |
| 技术栈     | manifest、lockfile、构建配置、源码 imports   | 标为未知，不凭依赖名称扩展         |
| 目录边界   | 实际跟踪目录、路由、模块入口                 | 不创建不存在的分层                 |
| 命令       | package scripts、CI、hooks                   | 不编造 formatter、test、build 命令 |
| 代码风格   | 多个代表性源码和测试文件                     | 记录差异，不把单文件当全局规则     |
| Git 治理   | 正式规范、commitlint、hooks、CI、Git history | 无规则时采用最小基线；冲突则阻断   |
| API        | wrapper、contract、mock、调用方              | 区分服务端 contract 与 UI model    |
| 状态管理   | store、context、composable、组件状态         | 只记录实际使用模式                 |
| 设计系统   | token、全局样式、组件库、页面、设计稿、截图  | 区分已实现、期望、偏差和未知       |
| Agent 治理 | AGENTS、CLAUDE、Cursor rules、已有 skills    | 确定 owner，删除重复规则           |
| 记忆       | 项目记忆、ADR、规范、Git history             | 只保留当前有效事实和必要路由       |
| Runtime    | CLI、MCP、hooks、CI、secret scanner          | 标明 L1/L2/L3，不虚构硬保障        |

README 可用于理解项目意图，但涉及路径、命令和实现的结论必须用当前仓库复核。

## Git 提交治理审计

按顺序检查 `CONTRIBUTING.md` 或等价规范、commitlint 配置、`.git/hooks` 或 hook 管理目录、CI、package scripts 和近期 Git history。记录 commit message 格式、type、scope、subject 语言与长度、body 要求、自动生成消息例外和实际执行位置。

- 文档、hook、CI 或历史模式相互冲突时标为 `BLOCKED`，不得猜测目标规则。
- 没有提交历史不视为异常；按 `references/git-governance.md` 使用新项目基线。
- 只有规则文档是 G1；hook 已验证是 G2；hook 与 CI 均验证才是 G3。
- 不因发现缺口而自动安装 Husky、commitlint 或其他依赖。

## Agent 能力审计

对每个目标 Agent 检查：项目级指令入口、shell/CLI 或 MCP、正常完成 hook、可用版本、跨 Agent E2E。只有指令入口是 L1；能调用统一 CLI 并通过 `doctor` 是 L2；具有正常完成 hook 并通过 E2E 才是 L3。

检查 Git worktree、CI artifact、现有 secret scanner 和文档 formatter。没有运行证据的能力标为 `BLOCKED`，不得因为工具宣传页声称支持就写成当前事实。

## Design System 提取

至少检查：

1. 颜色 token、语义颜色及硬编码色值。
2. 字体家族、字号、行高和字重。
3. spacing、圆角、边框、阴影和层级。
4. 页面宽度、栅格、侧栏、表格和表单密度。
5. Button、Input、Select、Dialog、Drawer、Table、Tabs 等组件状态。
6. loading、empty、error、disabled、success、warning 等反馈。
7. responsive breakpoints、keyboard、focus、contrast 和非颜色状态表达。
8. 业务页面和复用组件之间的差异。

每条现状结论保留文件路径或设计证据；没有证据时写入“未定义”，不要补成最佳实践。

## Empty Project 阻断输入

以下输入会改变生成结果，缺少时必须询问：

- 项目名称和产品类型；
- 目标用户、核心流程和信息密度；
- 技术栈、包管理器和部署目标；
- 品牌色、字体、设计稿、参考产品或“无品牌基线”的明确选择；
- 目标 Agent 工具；
- 必须执行的 test、build、lint、format 门禁。

用户明确允许使用最小默认值时，将它们记录为“初始决策”，不得描述为现有事实。

## 冲突处理

优先级：用户最新确认 > 正式 contract/规范 > 目标行为测试 > 当前代码 > 旧文档。当前代码与已确认期望不一致时记录为实际 bug，不用 bug 覆盖期望。
