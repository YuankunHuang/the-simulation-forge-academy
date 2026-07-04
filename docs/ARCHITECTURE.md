# 架构说明 · The Simulation Forge Academy

## 设计原则

1. **内容与逻辑分离**：`content/` 只有数据，`engine/` 只有纯函数，`features/` 只做渲染与交互。改任务文案不碰逻辑，改解锁规则不碰内容。
2. **引擎纯函数化**：六个引擎不依赖 React、不读全局状态。输入是「已完成任务 id 集合 + 当天日期」，输出是可见性/资格/奖励。这使 50 个单元测试可以在 node 环境下毫秒级运行。
3. **单一存档**：全部玩家状态收敛为一个 `PlayerState`，由 Zustand persist 写入 localStorage。没有散落的布尔开关——进度全部从 `questCompletions` 推导。
4. **无证据，无精通 XP**：完成按钮的禁用状态、`canCompleteQuest` 的资格校验、store 的最终防线，三层共同执行这一规则。

## 数据流

```
content/*.ts（静态种子）
        │
        ▼
engine/*（纯函数：可见性 / 推荐 / 奖励 / 间隔重复 / 校验 / 冲刺）
        ▲                                   │
        │ completedIds, today               │ 计算结果
        │                                   ▼
store/playerStore.ts（Zustand + persist → localStorage）
        ▲                                   │
        │ 动作（completeQuest…）             │ 订阅切片
        │                                   ▼
features/*（页面组件） ←──────────── components/*（通用 UI）
```

## 核心引擎职责

| 引擎 | 输入 | 输出 | 关键规则 |
| --- | --- | --- | --- |
| `unlockEngine` | completedIds | 区域三态、任务状态、Boss 清单 | 线性区域门控 `REGION_GATES`；第一个未解锁区域 = 剪影预览，其后全部迷雾；Act II/III 无门 = 永锁 |
| `questEngine` | completedIds, fields | 推荐任务、完成资格、下一任务 | 可选任务（M13）只在主线清空后推荐；资格 = 状态可接 ∧ 必填证据齐全 |
| `rewardEngine` | quest, fields | RewardBundle、神器、称号、等级 | 反思 ≥60/200 字 → +1/+2 洞察；展示型证据 ≥80 字 → +5 声望；称号阶梯由里程碑驱动 |
| `reviewEngine` | states, completedIds, today | 到期卡、评分后的新状态、热身卡 | SM-2 简化版；卡片在关联任务完成后入组；热身优先「到期老卡 > 本任务预习卡」 |
| `evidenceEngine` | quest, fields | 校验结果、展示 prompts | 必填字段非空白；commit hash ≥6 字符；神器 → 五类展示内容 |
| `sprintEngine` | session, completedIds | SessionRecap | 冲刺只是记账，不改变任何解锁规则 |

## 状态模型（要点）

```ts
PlayerState {
  wallet: { xp, gold, skillPoints, reputation, insight }
  questCompletions: Record<questId, { completedAt, evidence }>  // 一切进度之源
  unlockedSkillIds / purchasedDungeonIds / completedDungeonIds
  reviewStates: Record<cardId, { nextReviewDate, intervalDays, ease, reps, lapses }>
  journal / recaps / sprint
  activeDates（近 60 天）→ 动量之火
  warmupClaims / lowEnergyDoneDate（每日小奖励防重复）
}
```

`ceremony`（奖励仪式载荷）存在于 store 但被 `partialize` 排除在持久化之外。

## 关键决策记录

- **HashRouter + `base: "./"`**：GitHub Pages 子路径部署零配置。
- **技能两段式解锁**：任务完成 → 节点「证据就绪」；花 1 技能点 → 正式点亮。既满足「解锁必须基于证据」，又让技能点有意义。
- **Boss 之门即任务**：Boss 是 `type: "boss"` 的任务，证据是总结与答辩文本。区域门控 `REGION_GATES` 直接引用 boss 任务 id，规则与内容自然对齐。
- **热身回顾双模式**：有到期老卡 → 检索练习（retrieval practice）；无 → 用本任务的卡做预习提问（pretesting）。两者都是学习科学的正统用法。
- **动量之火不惩罚**：只计算连续活跃与离开天数，离开 ≥3 天触发的是欢迎回归台词，不是断签惩罚。
- **每日小奖励幂等**：热身金币按「卡 × 天」去重，低能量签到按天去重，防刷金。

## 测试策略

`src/tests/` 共 50 个用例，覆盖：

- 迷雾推导（新玩家 / 中期 / 全通关三个切面）；
- 防跳级（凭空完成 M3 也进不了 M4）；
- 奖励结算（基础 + 洞察/声望加成边界值）；
- 间隔重复（四档评分的单调性、ease 下限、到期筛选）；
- 证据校验（空白、commit hash 长度、可选字段）；
- 冲刺回顾与存档导入的损坏防护。

UI 层不做单测（MVP 范围），由 TypeScript strict 模式与引擎测试兜底。
