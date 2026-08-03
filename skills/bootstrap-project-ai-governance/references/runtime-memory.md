# Project Memory Runtime v0.2

## 边界

`bootstrap-project-ai-governance` 负责初始化和迁移治理文件；`project-memory` CLI 负责长期运行。Markdown 仍是事实 owner，CLI 只修改 `project-memory-data` 标记内的 JSON，不生成第二份事实副本。

v0.2 不自动迁移旧记忆。发现无结构化数据块的 Existing Project 时，先输出迁移矩阵，确认后一次性转换；禁止长期双写新旧格式。

## 事实 Contract

```json
{
  "protocolVersion": "0.2",
  "facts": [
    {
      "id": "req-example",
      "kind": "requirement",
      "owner": "docs/ai/project-memory.md",
      "statement": "Current confirmed fact.",
      "evidence": [{ "type": "user-confirmed", "reference": "task:123" }],
      "updatedAt": "2026-08-03"
    }
  ]
}
```

允许的 `kind`：`requirement`、`api-contract`、`architecture`、`root-cause`、`environment`。

允许的证据类型：`user-confirmed`、`contract`、`test`、`code`、`runtime`。代码现状默认不进入记忆；只有它还承载无法从代码直接恢复的限制或根因时才记录。

## 命令

项目必须在 `project-context.md` 中记录实际可执行且固定版本的命令。以下使用已安装的 `project-memory` binary：

```bash
project-memory query --project . --kind requirement
project-memory lint --project .
project-memory doctor --project . --json
```

写入分为提议和应用：

```bash
project-memory propose --project . --action ADD --id req-example --kind requirement --statement "Confirmed fact" --evidence-type user-confirmed --evidence-ref "task:123"
project-memory apply --project . --proposal proposal.json
```

支持把 proposal JSON 通过 stdin 交给 `apply --stdin`。`UPDATE` 必须提供完整替换事实；`DELETE` 必须提供证据；`NOOP` 必须提供原因。

## 一致性与安全

- proposal 保存创建时的整个记忆文件 SHA-256；`apply` 发现 hash 改变时拒绝覆盖，要求重新 `propose`。
- 非 `NOOP` 写入使用同目录临时文件和 rename；失败时保留原文件。
- CLI 拒绝逃逸项目根目录的 memory path、重复 ID、重复 statement、无证据事实、模板占位符和高置信 secret 模式。
- CLI 事件写入 Git metadata 下的 `project-memory/events.jsonl`，不进入项目历史；CI 可以收集 stdout/事件作为指标来源。
- 本地 observed write-back rate 只表示“已产生 proposal 的事实”应用比例，不能发现从未提出的漏写；正式指标仍需独立抽样或任务系统分母。

## Agent 支持等级

| 等级 | 能力                                                | 对外表述             |
| ---- | --------------------------------------------------- | -------------------- |
| L1   | 只有项目指令，依赖 Agent 自觉                       | Best Effort          |
| L2   | 能调用统一 CLI，并通过 `doctor`                     | Runtime Compatible   |
| L3   | 有读取和正常完成 lifecycle hook，并通过跨 Agent E2E | Production Supported |

不支持项目指令、shell/CLI、MCP 或 lifecycle hook 的 Agent，不得标记为 L3。进程强制终止和用户主动停止生成不要求写回。

## 运行指标

至少记录：已确认持久事实写回率、误写率、过期事实率、重复 owner 率、冲突率、检索命中率、读取 token p50/p95 和 Adapter 合规率。没有独立分母时必须将写回率标记为 `observed`，不得宣传为完整写回率。
