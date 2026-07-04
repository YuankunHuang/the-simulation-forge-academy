import type { NPCDialogue } from "@/types/domain";

/**
 * 米拉导师（Professor Mira）的台词库。
 * 语气：温暖、直接、精确、鼓励、温柔地严格。绝不贩卖焦虑，绝不油腻。
 */

export const NPC_NAME = "米拉导师";
export const NPC_NAME_EN = "Professor Mira";
export const NPC_ROLE = "熔炉导师 · Forge Mentor";

export const NPC_DIALOGUES: NPCDialogue[] = [
  // ---- 时段问候 ----
  {
    id: "d_morning_1",
    context: "greeting_morning",
    text: "早上好。炉火已经生起来了。今天不需要理解整个 C++ 世界——只需要往前铸一小块。",
  },
  {
    id: "d_morning_2",
    context: "greeting_morning",
    text: "早。你已经有五年的生产直觉了，我们要做的只是给它配上显性的证据。从今天的任务开始。",
  },
  {
    id: "d_afternoon_1",
    context: "greeting_afternoon",
    text: "下午好。碎片时间也能烧热一块铁——看看今天的任务，哪怕只推进一条 DoD。",
  },
  {
    id: "d_afternoon_2",
    context: "greeting_afternoon",
    text: "欢迎回炉。记住我们的规矩：没有证据，就没有精通。但一小份证据，就足够今天了。",
  },
  {
    id: "d_evening_1",
    context: "greeting_evening",
    text: "晚上好。夜里的炉火最稳。如果今天只剩一点力气，就把它花在一件能留下痕迹的事上。",
  },
  {
    id: "d_evening_2",
    context: "greeting_evening",
    text: "晚风正好。完成一步，记录一次失败，提交一条证据——这就是今天的胜利。",
  },

  // ---- 离开后回归（绝不愧疚式） ----
  {
    id: "d_back_1",
    context: "welcome_back",
    text: "欢迎回来。炉火一直为你留着——离开的日子不需要解释，回来的这一步才算数。",
  },
  {
    id: "d_back_2",
    context: "welcome_back",
    text: "你回来了，这很好。铁凉了可以再烧，路还在原处。我们从上次停下的地方继续。",
  },

  // ---- 低能量模式 ----
  {
    id: "d_low_1",
    context: "low_energy",
    text: "累的日子有累的打法：一张复习卡，一句反思，读一眼当前任务。这不是偷懒，这是让火不灭。",
  },
  {
    id: "d_low_2",
    context: "low_energy",
    text: "今天走小步。翻一张卡，写一行字，然后休息。明天的你会感谢今天没有熄火的你。",
  },

  // ---- 深度冲刺 ----
  {
    id: "d_deep_1",
    context: "deep_start",
    text: "状态好的日子值得庆祝——那就多推几关。规矩不变：每一关都要证据。我在终点给你算总账。",
  },
  {
    id: "d_deep_2",
    context: "deep_start",
    text: "冲刺开始。别忘了每完成一关就提交证据，Boss 之门依然只认实力。祝你今天铸得痛快。",
  },

  // ---- 任务感知台词（quest_focus：按当前推荐任务说话） ----
  {
    id: "d_focus_r0",
    context: "quest_focus",
    questId: "q_r0",
    text: "先点燃炉火。今天的目标不是推进技术，而是确认你已经进入这条转职路线。",
  },
  {
    id: "d_focus_m0",
    context: "quest_focus",
    questId: "m0",
    text: "今天不是写复杂代码，而是给整个边界实验室打地基。repo、README、docs skeleton，就是你的第一块证据。",
  },
  {
    id: "d_focus_m1",
    context: "quest_focus",
    questId: "m1",
    text: "native runtime 必须先能独立构建，Unity 才有东西可以连接。今天让 C++ 侧发出第一枚版本信号。",
  },
  {
    id: "d_focus_m2",
    context: "quest_focus",
    questId: "m2",
    text: "现在 native runtime 已经能说话了。今天让 Unity 通过 P/Invoke 听见它。",
  },
  {
    id: "d_focus_m3",
    context: "quest_focus",
    questId: "m3",
    text: "桥能通还不够。今天要定义谁拥有 native context，谁负责释放，谁不该碰 raw IntPtr。",
  },
  {
    id: "d_focus_boss_bridge",
    context: "quest_focus",
    questId: "boss_bridge",
    text: "你已经打通第一道信号桥。现在证明你能解释它，而不是只跑通它。",
  },
  {
    id: "d_focus_m4",
    context: "quest_focus",
    questId: "m4",
    text: "平原的第一块石碑：让 C# 和 C++ 对同一块内存说出同一句话。契约要写进编译器，不是注释里。",
  },
  {
    id: "d_focus_m5",
    context: "quest_focus",
    questId: "m5",
    text: "一次渡桥，运送整支军团。今天把 N 次边界穿越合并成 1 次。",
  },

  // ---- Boss 之门在前 ----
  {
    id: "d_boss_1",
    context: "boss_ahead",
    text: "前面是一道门，不是一堵墙。它只问你能不能把学到的东西亲口讲出来。慢慢说，说清楚。",
  },
  {
    id: "d_boss_2",
    context: "boss_ahead",
    text: "Boss 之门不考新东西，它考沉淀。把这个区域的旅程压缩成你自己的语言，门就会开。",
  },

  // ---- 任务完成 ----
  {
    id: "d_complete_1",
    context: "quest_complete",
    text: "很好。这一块铁成型了——证据已入库。休息一下，或者，继续冒险？",
  },
  {
    id: "d_complete_2",
    context: "quest_complete",
    text: "又一份证据入库。你的转型不是一句愿望了，它正在变成一排可以指给别人看的东西。",
  },

  // ---- 全部清空 ----
  {
    id: "d_clear_1",
    context: "all_clear",
    text: "当前能做的都做完了——这是值得骄傲的状态。去休息，或翻翻宝库里的战利品。",
  },

  // ---- 区域风味 ----
  {
    id: "d_region_hearth",
    context: "region_flavor",
    regionId: "hearth_hall",
    text: "这里是炉火大厅，你的家。地图、工坊、宝库都从这里出发。",
  },
  {
    id: "d_region_bridge",
    context: "region_flavor",
    regionId: "bridge_village",
    text: "今天不需要理解整个 C++ 世界。今天只需要让 Unity 听见 native runtime 的第一句回应。",
  },
  {
    id: "d_region_plains",
    context: "region_flavor",
    regionId: "benchmark_plains",
    text: "平原的风只尊重数据。固定 seed，剔除 warmup，让 median 和 p95 替你说话。",
  },
  {
    id: "d_region_archives",
    context: "region_flavor",
    regionId: "layout_archives",
    text: "档案馆的规矩：数据的形状决定它旅行的速度。对齐不是细节，是契约。",
  },
  {
    id: "d_region_clinic",
    context: "region_flavor",
    regionId: "safety_clinic",
    text: "诊所信条：失败不可怕，不可恢复的失败才可怕。让每个错误都有名字、有出口。",
  },
  {
    id: "d_region_harbor",
    context: "region_flavor",
    regionId: "package_harbor",
    text: "港口标准很简单：换一台船还能开，换一个工程还能跑。",
  },
  {
    id: "d_region_gate",
    context: "region_flavor",
    regionId: "mobile_gate",
    text: "这是你最熟悉的战场。带着新的武器回去，让老经验和新能力握手。",
  },
  {
    id: "d_region_observatory",
    context: "region_flavor",
    regionId: "observatory_annex",
    text: "望远镜可以看很远，但脚要站在稳固的桥上。可选的风景，克制地欣赏。",
  },
  {
    id: "d_region_basecamp",
    context: "region_flavor",
    regionId: "production_basecamp",
    text: "营地不赶路。这里只做一件事：把五年生产直觉，变成有名字的证据。",
  },
];

export function pickDialogue(context: NPCDialogue["context"], seed: number, regionId?: string): NPCDialogue | null {
  const pool = NPC_DIALOGUES.filter((d) => d.context === context && (!d.regionId || d.regionId === regionId));
  if (pool.length === 0) return null;
  return pool[Math.abs(seed) % pool.length];
}

/** 当前推荐任务的专属台词；没有专属台词时返回 null（回退到时段问候）。 */
export function pickQuestFocusDialogue(questId: string): NPCDialogue | null {
  return NPC_DIALOGUES.find((d) => d.context === "quest_focus" && d.questId === questId) ?? null;
}
