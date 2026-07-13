import type { Campaign, Region } from "@/types/domain";

/**
 * 世界结构：主线三幕 + 生产经验营地（Act 0 支线）。
 * Act II / III 在 MVP 中仅作为迷雾中的剪影存在（无任务内容）。
 * 营地是支线：不参与线性迷雾链，点燃炉火后即开放，永不阻塞主线。
 *
 * 战略修订（2026-07-12）：北极星修正为「可信仿真基础设施工程师」（确定性是核心方法，
 * 不是终局职位），对齐 documents/career-strategy.md。主线 Act I 在 benchmark_plains
 * 的试炼之门止步——即 Public Demo Slice / 项目冻结点。旧 M9-M13 的五个区域
 * （内存布局/安全边界/UPM 打包/Android/XR）已整体删除：它们服务于已废弃的
 * 「Unity native/SDK/tools 职业锚点」叙事。Act II 重铸为「应用物理学徒」，
 * Act III 重铸为「可复现性工匠」，对齐学习优先级：应用刚体物理 →
 * MuJoCo/Isaac Lab 实践 → 可复现性/回归工件 → Docker 容器化。
 */

export const CAMPAIGNS: Campaign[] = [
  {
    id: "act1",
    order: 1,
    name: "第一幕 · 边界学徒",
    nameEn: "ACT I: The Boundary Apprentice",
    tagline: "让 Unity 听见 native runtime 的声音，测量到诚实的数字，然后收工。",
    regionIds: ["hearth_hall", "bridge_village", "benchmark_plains"],
  },
  {
    id: "act0",
    order: 2,
    name: "营地 · 整理旧装备",
    nameEn: "BASECAMP: Production Experience",
    tagline: "把五年 Unity 生产直觉变成有名字的证据。可选支线，永不阻塞主线。",
    regionIds: ["production_basecamp"],
  },
  {
    id: "act2",
    order: 3,
    name: "第二幕 · 应用物理学徒",
    nameEn: "ACT II: The Applied Physics Apprentice",
    tagline: "在 Unity 之外，学会让仿真的数字站得住：积分、约束、稳定性与代价。",
    regionIds: [
      "fixed_timestep_garden",
      "integration_meadow",
      "constraint_canyon",
      "stability_marsh",
      "sensitivity_range",
      "fidelity_gate",
      "mujoco_outpost",
    ],
  },
  {
    id: "act3",
    order: 4,
    name: "第三幕 · 可复现性工匠",
    nameEn: "ACT III: The Reproducibility Engineer",
    tagline: "把一次仿真运行，铸造成一份别人敢信、能审、能重现的证据。",
    regionIds: [
      "variance_observatory",
      "docker_forge",
      "regression_gate_cathedral",
      "sim_infra_citadel",
      "portfolio_hall",
    ],
  },
];

export const REGIONS: Region[] = [
  // ---- ACT I（主线，止步于平原试炼之门） ----
  {
    id: "hearth_hall",
    actId: "act1",
    order: 0,
    name: "炉火大厅",
    nameEn: "Hearth Hall",
    vibe: "温暖的炉火、木桌与地图，一切旅程从这里开始。",
    description: "学院的家。在这里点燃你的转型宣言，领取第一个任务。",
    icon: "hearth",
  },
  {
    id: "bridge_village",
    actId: "act1",
    order: 1,
    name: "边界新手村",
    nameEn: "Bridge Village",
    vibe: "一座横跨 managed 与 native 世界的石桥小村。",
    description: "搭好脚手架，让 native runtime 发出第一句回应，并建立所有权契约。",
    bossQuestId: "boss_bridge",
    icon: "bridge",
  },
  {
    id: "benchmark_plains",
    actId: "act1",
    order: 2,
    name: "基准测试平原",
    nameEn: "Benchmark Plains",
    vibe: "开阔的草原上竖立着测量石碑，风里都是数据。",
    description:
      "定义 blittable 数据契约，构建 Agent Swarm 基准，用数据代替猜测。这里是 Act I 的终点：通过试炼之门即完成公开切片，主线到此收工。",
    bossQuestId: "boss_benchmark",
    icon: "plains",
  },
  // ---- BASECAMP（Act 0 支线：整理旧装备） ----
  {
    id: "production_basecamp",
    actId: "act0",
    order: 0,
    name: "生产经验营地",
    nameEn: "Production Basecamp",
    vibe: "帐篷里摊开五年的旧装备——每一件都比你以为的更值钱。",
    description: "把 Unity 移动生产的隐性经验整理成显性证据：盘点、心智模型、热路径规则、职业叙事。可选，不阻塞主线。",
    icon: "camp",
    side: true,
  },
  // ---- ACT II（应用物理学徒：迷雾中的剪影，MVP 未开放内容） ----
  {
    id: "fixed_timestep_garden",
    actId: "act2",
    order: 0,
    name: "固定时间步花园",
    nameEn: "Fixed Timestep Garden",
    vibe: "每一片叶子都以完全相同的节拍生长。",
    description: "Act II 内容，完成第一幕后铸造。固定时间步是确定性与物理稳定性共同的地基。",
    icon: "garden",
  },
  {
    id: "integration_meadow",
    actId: "act2",
    order: 1,
    name: "数值积分草甸",
    nameEn: "Integration Meadow",
    vibe: "风吹草动，每一步位移都是上一步误差的继承者。",
    description: "Act II 内容。显式欧拉、半隐式欧拉、RK4——比较不同积分方法的精度与稳定性代价。",
    icon: "meadow",
  },
  {
    id: "constraint_canyon",
    actId: "act2",
    order: 2,
    name: "约束与接触峡谷",
    nameEn: "Constraint & Contact Canyon",
    vibe: "峡谷两壁互相挤压，却始终没有真正贴合。",
    description: "Act II 内容。约束求解、接触与摩擦为什么天生不稳定，以及常见的修正策略。",
    icon: "canyon",
  },
  {
    id: "stability_marsh",
    actId: "act2",
    order: 3,
    name: "稳定性沼泽",
    nameEn: "Stability & Drift Marsh",
    vibe: "看似平静的水面下，能量正在悄悄漂移。",
    description: "Act II 内容。能量漂移、数值爆炸与阻尼——测量一个仿真什么时候开始说谎。",
    icon: "marsh",
  },
  {
    id: "sensitivity_range",
    actId: "act2",
    order: 4,
    name: "参数敏感度荒野",
    nameEn: "Parameter Sensitivity Range",
    vibe: "同一片荒野，换一个参数就换了一个世界。",
    description: "Act II 内容。系统性改变时间步、质量、刚度等参数，观察结果如何漂移、何时失真。",
    icon: "range",
  },
  {
    id: "fidelity_gate",
    actId: "act2",
    order: 5,
    name: "精度与吞吐之门",
    nameEn: "Fidelity vs Throughput Gate",
    vibe: "门的两侧写着同一句话的两种翻译：更真实，或更快。",
    description: "Act II 内容。理解 fidelity/throughput 的权衡——为什么『grounded』的仿真才是未来最具护城河的方向。",
    icon: "fidelitygate",
  },
  {
    id: "mujoco_outpost",
    actId: "act2",
    order: 6,
    name: "MuJoCo 前哨站",
    nameEn: "MuJoCo Outpost",
    vibe: "荒野尽头的第一座真正的仿真器营地。",
    description: "Act II 内容，通向第三幕。以实践者视角无头运行标准 MuJoCo 环境，记录 seed、参数与轨迹。",
    icon: "outpost",
  },
  // ---- ACT III（可复现性工匠：深雾） ----
  {
    id: "variance_observatory",
    actId: "act3",
    order: 0,
    name: "方差观测台",
    nameEn: "Run-to-Run Variance Observatory",
    vibe: "同一份输入，望远镜里却映出微微不同的两条轨迹。",
    description: "Act III 内容。测量同一仿真重复运行的方差，定位非确定性的真正来源。",
    icon: "observatory3",
  },
  {
    id: "docker_forge",
    actId: "act3",
    order: 1,
    name: "Docker 铸造坊",
    nameEn: "Docker Forge",
    vibe: "熔炉把散乱的依赖，铸成一个随处可搬的容器。",
    description: "Act III 内容。用容器固定依赖与环境，让无头仿真在任何机器上都跑出同一个结论。",
    icon: "forge",
  },
  {
    id: "regression_gate_cathedral",
    actId: "act3",
    order: 2,
    name: "回归门大教堂",
    nameEn: "Regression Gate Cathedral",
    vibe: "彩窗上绘着一次退化被 CI 当场拦下的圣迹。",
    description: "Act III 内容。把可复现的运行工件接进 CI：定义容差、定义回归、让退化无法悄悄溜过。",
    icon: "cathedral",
  },
  {
    id: "sim_infra_citadel",
    actId: "act3",
    order: 3,
    name: "仿真基础设施城塞",
    nameEn: "Simulation Infrastructure Citadel",
    vibe: "为他人的仿真世界提供地基的城。",
    description: "Act III 内容。",
    icon: "citadel",
  },
  {
    id: "portfolio_hall",
    actId: "act3",
    order: 4,
    name: "作品集荣誉殿堂",
    nameEn: "Portfolio Hall of Fame",
    vibe: "你锻造过的一切证据在此陈列发光。",
    description: "Act III 内容。",
    icon: "hall",
  },
];

export const REGION_BY_ID: Record<string, Region> = Object.fromEntries(REGIONS.map((r) => [r.id, r]));

export const CAMPAIGN_BY_ID: Record<string, Campaign> = Object.fromEntries(CAMPAIGNS.map((c) => [c.id, c]));

/** 跨幕的全局区域顺序（迷雾推导用） */
export const ORDERED_REGIONS: Region[] = CAMPAIGNS.slice()
  .sort((a, b) => a.order - b.order)
  .flatMap((c) => REGIONS.filter((r) => r.actId === c.id).sort((a, b) => a.order - b.order));
