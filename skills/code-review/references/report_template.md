# 代码审查报告模板

---

# 📋 代码审查报告

**项目：** `{{PROJECT_NAME}}`
**分支：** `{{BRANCH_NAME}}`
**审查区间：** `{{START_COMMIT}}` → `{{END_COMMIT}}`
**生成时间：** `{{DATE}}`

---

## 一、提交概览

| 提交 Hash | 作者 | 时间 | 提交信息 |
|-----------|------|------|----------|
| `{{HASH}}` | {{AUTHOR}} | {{DATE}} | {{MESSAGE}} |

**汇总：** 共 {{N}} 次提交，涉及 {{FILE_COUNT}} 个文件，新增 {{ADDED}} 行，删除 {{DELETED}} 行。

---

## 二、核心变更摘要

> 按模块/功能域分组描述变更内容。

### {{MODULE_NAME}}
- `{{FILE_PATH}}`：{{CHANGE_DESCRIPTION}}

---

## 三、影响范围矩阵

| 被改动模块 | 直接依赖方 | 间接影响 | 风险等级 |
|-----------|-----------|---------|---------|
| {{MODULE}} | {{DEPENDENTS}} | {{INDIRECT}} | 🔴/🟠/🟡 |

---

## 四、隐藏范围

> 记录未直接修改、但可能受共享状态、API contract、事件、路由、持久化或间接调用链影响的范围。无发现时保留本节，填写“未发现隐藏范围”及已检查的调用链/搜索证据。

| 直接改动 | 隐藏影响对象 | 影响假设 | 调用链/搜索证据 | 结论与验证状态 |
|----------|--------------|----------|-----------------|----------------|
| `{{CHANGED_FILE_OR_MODULE}}` | `{{HIDDEN_CONSUMER_OR_ENTRY}}` | {{POTENTIAL_EFFECT}} | {{EVIDENCE}} | {{CONCLUSION}} |

---

## 五、行为迁移矩阵

> 每个关键业务行为都需对比改动前后；没有行为变化时填写“行为不变”并说明证据。

| 业务行为 | 改动前 | 触发条件 | 改动后 | 受影响消费者 | 兼容性/回归风险 | 证据 |
|----------|--------|----------|--------|--------------|-----------------|------|
| {{BEHAVIOR}} | {{BEFORE}} | {{TRIGGER}} | {{AFTER}} | {{CONSUMERS}} | {{RISK}} | {{EVIDENCE}} |

---

## 六、Bug 风险清单

### 🔴 P0 — 必须立即修复

#### P0-01：{{ISSUE_TITLE}}
- **涉及文件：** `{{FILE_PATH}}:{{LINE_NO}}`
- **问题描述：** {{DESCRIPTION}}
- **复现路径：** {{REPRODUCTION_STEPS}}
- **推荐修复：**
```typescript
// {{FIX_DESCRIPTION}}
{{FIX_CODE}}
```

---

### 🟠 P1 — 建议尽快修复

#### P1-01：{{ISSUE_TITLE}}
- **涉及文件：** `{{FILE_PATH}}:{{LINE_NO}}`
- **问题描述：** {{DESCRIPTION}}
- **推荐修复：**
```typescript
{{FIX_CODE}}
```

---

### 🟡 P2 — 迭代时修复

#### P2-01：{{ISSUE_TITLE}}
- **涉及文件：** `{{FILE_PATH}}`
- **问题描述：** {{DESCRIPTION}}

---

## 七、测试建议范围

> 覆盖行为迁移矩阵、隐藏范围和 P0/P1 风险点；无自动化测试必要时，说明原因、人工验证范围和验证命令。

| 覆盖范围/行为 | 关联迁移或隐藏范围 | 必测场景与边界 | 测试层级 | 优先级 | 建议框架/命令 |
|---------------|--------------------|----------------|----------|--------|----------------|
| `{{FUNCTION}}` | {{MIGRATION_OR_HIDDEN_SCOPE}} | {{SCENARIOS}} | 单元测试 | P0 | Vitest / {{COMMAND}} |
| `{{COMPONENT}}` | {{MIGRATION_OR_HIDDEN_SCOPE}} | {{SCENARIOS}} | 组件测试 | P1 | Vitest / {{COMMAND}} |
| `{{FLOW}}` | {{MIGRATION_OR_HIDDEN_SCOPE}} | {{SCENARIOS}} | E2E 测试 | P1 | Playwright / {{COMMAND}} |

---

## 八、总结与行动项

| 优先级 | 问题数 | 行动 |
|--------|--------|------|
| 🔴 P0 | {{P0_COUNT}} | 立即修复 |
| 🟠 P1 | {{P1_COUNT}} | 本 Sprint 内修复 |
| 🟡 P2 | {{P2_COUNT}} | 下次迭代处理 |

> **整体评估：** {{OVERALL_ASSESSMENT}}
