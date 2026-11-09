# UI 设计质量集成

本规则用于建立 UI 治理及后续 UI 任务路由；初始化治理只建立规则，不顺带修改页面。纯 backend 记录 `NOT_APPLICABLE`，不生成虚构视觉规范或要求 UI skills。

## 发现与 owner

- 从目标 Agent 的 skill 清单、项目级与用户级 skill 目录实际发现 `design-taste-frontend` 和 `impeccable`；读取安装版 `SKILL.md`，再按本次任务读取所需 references，不凭名称推断能力。
- 分别记录 skill、适用页面、`AVAILABLE` / `MISSING` / `NOT_APPLICABLE`、实际 `SKILL.md` 路径及执行依赖缺口。`AVAILABLE` 仅表示可读取，不表示 launcher、浏览器或检查已运行；缺失写文字说明，不生成死链接。
- 不把某台机器的绝对路径固化到方法论或模板；生成项目规则时引用目标环境中已验证的实际路径。
- 此集成不复制外部 scripts/assets，不默认安装、下载、启用 hook 或升级版本；安装版流程依赖这些操作时记录缺口及未执行步骤。
- `AGENTS.md` 持有 Agent 路由；项目既有 design-system 文档或 `DESIGN.md` 持有完整视觉规范，保持唯一 owner。已有 `PRODUCT.md` 作为产品 context 引用，不复制全文或自动新建平行规范。

## 按实际页面用途路由

同一产品逐页面判断，不能因为产品是 SaaS 就把后台当成营销网站。

| Mode | 访客目标与页面 | 最小路由 |
| ---- | -------------- | -------- |
| Persuade | 决策并行动：landing page、营销、定价 | 在安装版声明的营销/公司/产品网站范围内，由 design-taste-frontend 构建视觉方向；再按需使用 impeccable critique、audit、polish |
| Experience | 体验作品：作品集、gallery、showcase | 先核对是否属于 design-taste-frontend 的网站范围，适用才用其构建方向；其余由 impeccable 主导，再按需 critique、audit、polish |
| Operate | 完成任务：管理后台、dashboard、表单、设置 | impeccable 主导；优先可扫描性、密度、组件一致性和任务效率 |
| Read | 理解内容：文档、文章、指南、帮助 | impeccable 主导；优先结构、阅读层级、可读性与导航 |

按问题选择步骤，不强制每次执行全部命令：`critique` 用于设计评审，`audit` 用于 a11y、responsive、performance 等技术检查，`polish` 用于最后细节完善。调用前读取安装版对应 reference。

## 冲突与 context

- 用户最新确认的品牌/需求优先于外部 skill 偏好；任务内遵循项目视觉 owner，复用已有 tokens 与业务组件。现状与确认期望不一致时记录偏差，不把 bug 变成规范。
- 不因 taste 的禁紫规则替换已确认品牌紫色；禁止把整屏 section、强制动效、营销版式移植到后台。所有模式均保留功能、accessibility、performance 和既有框架约束。
- 治理初始化与纯 planning 直接读取已有产品/视觉 context；记录缺口，不运行可能创建文件、下载工具或启用 hook 的初始化流程。
- 实际 UI 实施遵循安装版 impeccable 的 launcher、平台适配及 context 指令；运行前核对 launcher 与依赖是否就绪，避免隐式下载。拒绝、不可用或失败时，先说明 context loading 未执行，再直接读取现有产品与视觉文档，继续其安装版 fallback 和适用 references；UI 编辑前读取安装版要求的质量基线。
- launcher 要求的文档缺失时，使用已确认的等价 owner 并记录差异；不以文件名缺失为由覆盖现有设计，或自动创建第二份 `DESIGN.md` / `PRODUCT.md`。需要改变 owner 的冲突先列入迁移矩阵。

## PDCA

| 阶段 | 输入 | 输出 | 验证标准 |
| ---- | ---- | ---- | -------- |
| Plan | 页面用途、用户目标、品牌、现有 tokens/组件、视觉证据、skill 状态 | Mode、范围、唯一 owner、技能路由、具体视觉目标与风险 | 区分事实/期望/偏差/未知，方向适用于实际页面且无品牌冲突 |
| Do | 确认方向、适用 references、现有工程约定 | 初始化时生成规则；获得 UI 实施授权后才做最小界面改动 | 复用现有组件，保持功能/a11y/performance，不扩大依赖或工具副作用 |
| Check | 生成规则；实际 UI 变更时另有可运行页面与前后证据 | 文档检查；适用的渲染、交互与工具检查结果 | 文档路径/owner 正确；实际视觉检查覆盖下节，未运行项有原因 |
| Act | 差异、缺口和检查结果 | 修复范围内问题，更新唯一 owner 或记录未决项 | 复核受影响项，保留真实限制，不用工具分数替代视觉判断 |

## 视觉验收与降级

- 仅治理初始化：验证路由、owner、证据和文档；UI 实测明确标为未执行，不声称美感已经提升。
- 实际 UI 变更：保留改前/改后的渲染或截图证据，注明 route、theme、viewport 与对应改动；检查代表性的 desktop/mobile 和项目 breakpoint，核对层级、排版、间距、对齐及品牌一致性。
- 同时验证 keyboard、focus、contrast、非颜色状态表达，以及适用的 loading、empty、error、disabled、success 状态；核对功能回归、动效/资源带来的 performance 变化，执行项目适用门禁。
- 交付记录目标、视觉差异、证据路径、已运行检查及结果、未执行项与原因；taste gate 只报告实际结果和限制，`PASS` 不等于美感合格，文档通过也不等于视觉通过。
- skill 缺失时继续基于现有视觉 owner、源码和可用截图进行设计评审，列出可做项与缺口；工具检查未执行就明确报告。无法渲染时用已核对新鲜度的现有截图作有限证据，并记录待验证项，不宣称真实交互通过。
