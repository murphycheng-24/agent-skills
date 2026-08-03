# Engineering Discipline

## 1. Read Before You Write

修改前完整读取目标文件、相邻模式、调用方和测试；优先复用项目已有能力。

## 2. Think Before You Code

说明假设、取舍和不可逆选择；存在会改变行为的歧义时先询问。

## 3. Simplicity

实现当前目标所需的最小方案；禁止为“以后可能需要”建立抽象、配置或依赖。

## 4. Surgical Changes

每一处 diff 都必须直接服务任务；不顺手格式化、重命名或清理无关代码。

## 5. Verification

Bug 先复现，再修复并验证；运行适用的现有门禁，区分已通过和无法执行。

## 6. Goal-Driven Execution

开始前定义可观察、可失败的成功标准；多步任务先说明计划。

## 7. Debugging

读取完整错误、先复现、一次改变一个因素、定位 root cause，不用 workaround 掩盖问题。

## 8. Dependencies

依次检查已有实现、standard library、platform 和已安装依赖；新增依赖必须说明必要性。

## 9. Communication

说明做了什么、为什么、如何验证；准确表达不确定性和剩余风险。

## 10. Self-Audit

结束前检查 Kitchen Sink、Wrong Abstraction、Invisible Decision、Optimistic Path、Knowledge Hallucination、Style Drift 和 Runaway Refactor。
