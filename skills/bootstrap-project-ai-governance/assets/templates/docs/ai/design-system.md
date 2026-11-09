# {{PROJECT_NAME}} — Design System

> 状态：{{IMPLEMENTATION_SUMMARY_OR_INITIAL_DECISION}}；最后验证：{{YYYY-MM-DD}}。

## 产品与视觉原则

- 产品类型：{{PRODUCT_TYPE}}
- 目标用户：{{TARGET_USERS}}
- 信息密度：{{INFORMATION_DENSITY}}
- 视觉原则：{{VISUAL_PRINCIPLES}}

## 证据

| 类型        | 路径或来源                  | 覆盖范围  |
| ----------- | --------------------------- | --------- |
| Token/Style | {{STYLE_EVIDENCE}}          | {{SCOPE}} |
| Component   | {{COMPONENT_EVIDENCE}}      | {{SCOPE}} |
| Page/Design | {{PAGE_OR_DESIGN_EVIDENCE}} | {{SCOPE}} |

## UI 美感目标与 Skill 接入

> 生成时沿用项目既有视觉 owner（包括等价 `DESIGN.md`），不保留平行规范；下表按实际页面和安装情况填写。无 UI 的项目将本节标为 `NOT_APPLICABLE`，不虚构页面或视觉目标。

| 页面/流程 | Mode | 视觉目标与保留项 | 验收标准 | 证据/状态 |
| --------- | ---- | --------------- | -------- | --------- |
| {{SURFACE}} | {{PERSUADE_OPERATE_READ_OR_EXPERIENCE}} | {{VISUAL_GOAL_AND_CONSTRAINTS}} | {{OBSERVABLE_CRITERIA}} | {{EVIDENCE_AND_STATUS}} |

| Skill | 可用性 | 实际入口 | 适用范围/限制 |
| ----- | ------ | -------- | ------------- |
| `design-taste-frontend` | {{AVAILABLE_MISSING_OR_NOT_APPLICABLE}} | {{VERIFIED_PATH_OR_MISSING_REASON}} | {{WEBSITE_SCOPE_AND_CONFLICTS}} |
| `impeccable` | {{AVAILABLE_MISSING_OR_NOT_APPLICABLE}} | {{VERIFIED_PATH_OR_MISSING_REASON}} | {{UI_REVIEW_AND_REFINEMENT_SCOPE}} |

- Skill 选择与执行协议见 `AGENTS.md`；只记录目标环境实际存在的入口，缺失时写原因，不填写假链接或来源机器路径。
- 视觉目标应能观察，例如主操作层级、字体与间距节奏、信息密度、品牌辨识度；记录适用页面，不把装饰数量作为质量指标。
- 已有 `PRODUCT.md`、surface brief 或等价文档时引用其事实与范围，不重复维护。外部 skill 的默认偏好不替代本项目已确认设计决策。

## Colors

| Token           | Value     | Usage     | 状态                       |
| --------------- | --------- | --------- | -------------------------- |
| {{COLOR_TOKEN}} | {{VALUE}} | {{USAGE}} | {{IMPLEMENTED_OR_DECIDED}} |

## Typography 与 Spacing

| 项目       | 规则             | 状态       |
| ---------- | ---------------- | ---------- |
| Font       | {{FONT_RULE}}    | {{STATUS}} |
| Type Scale | {{TYPE_SCALE}}   | {{STATUS}} |
| Spacing    | {{SPACING_RULE}} | {{STATUS}} |

## Layout 与 Responsive

- {{LAYOUT_RULE}}
- {{RESPONSIVE_RULE}}

## Components

| Component     | Default     | Interactive     | Loading/Empty/Error | Evidence     |
| ------------- | ----------- | --------------- | ------------------- | ------------ |
| {{COMPONENT}} | {{DEFAULT}} | {{INTERACTIVE}} | {{FEEDBACK}}        | {{EVIDENCE}} |

## Accessibility

- {{ACCESSIBILITY_RULE}}

## 业务页面模式

| 页面或流程 | 模式        | Evidence     |
| ---------- | ----------- | ------------ |
| {{PAGE}}   | {{PATTERN}} | {{EVIDENCE}} |

## 视觉验收记录

| 页面/Viewport/状态 | 改前/改后证据 | 视觉评审与适用检查 | 结果/未执行原因 |
| ----------------- | ------------- | ------------------ | --------------- |
| {{SURFACE_VIEWPORT_STATE}} | {{SCREENSHOTS_OR_OBSERVATIONS}} | {{HIERARCHY_RESPONSIVE_ACCESSIBILITY_PERFORMANCE_CHECKS}} | {{RESULT_OR_NOT_RUN_REASON}} |

仅治理初始化时记录后续验收要求及“未执行”，不把规则接入或自动 gate 通过写成 UI 美感已验证。

## 已知偏差

- 期望行为：{{EXPECTED}}
- 当前实现：{{ACTUAL}}
- 验证方式：{{VALIDATION}}

## 未定义

- {{UNKNOWN}}
