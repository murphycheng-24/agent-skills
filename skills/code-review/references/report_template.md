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

## 四、Bug 风险清单

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

## 五、自动化测试建议

> 针对 P0/P1 风险点，建议覆盖以下测试场景：

| 测试目标函数/组件 | 测试类型 | 优先级 | 测试框架 |
|----------------|---------|--------|---------|
| `{{FUNCTION}}` | 单元测试 | P0 | Vitest |
| `{{COMPONENT}}` | 组件测试 | P1 | Vitest |
| `{{FLOW}}` | E2E 测试 | P1 | Playwright |

---

## 六、总结与行动项

| 优先级 | 问题数 | 行动 |
|--------|--------|------|
| 🔴 P0 | {{P0_COUNT}} | 立即修复 |
| 🟠 P1 | {{P1_COUNT}} | 本 Sprint 内修复 |
| 🟡 P2 | {{P2_COUNT}} | 下次迭代处理 |

> **整体评估：** {{OVERALL_ASSESSMENT}}
