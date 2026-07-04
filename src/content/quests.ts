import type { Quest } from "@/types/domain";

/**
 * Unity Native Boundary Lab — 全部任务种子内容。
 * R0 引导任务 + M0–M13 里程碑 + 6 座 Boss 之门。
 */

function forgePrompt(code: string, title: string, goal: string, extra?: string): string {
  return `你是我的结对工程师。现在只帮我完成 Unity Native Boundary Lab ${code} — ${title}。

不要跳到后续里程碑，不要引入 XR、Android、SIMD、render-thread 或完整确定性仿真内核。

我的目标：
${goal}

请按以下结构引导我：
1. 概念图（这一步涉及哪些概念，它们如何关联）
2. 文件改动清单
3. 实现步骤
4. 验证方法
5. 调试检查清单
6. 性能注意事项
7. 面试解释（我该如何讲述这一步）
8. Commit message 建议

保持范围克制。${extra ?? ""}`;
}

const EARLY_FORBIDDEN = [
  "不要做 XR。",
  "不要做 Android。",
  "不要做 SIMD。",
  "不要做 render thread。",
  "不要做 Unreal mirror。",
  "不要做完整 deterministic simulation kernel。",
  "不要随机打开新课程，除非它解决当前任务卡点。",
];

export const QUESTS: Quest[] = [
  // ------------------------------------------------------------
  // R0 — 点燃炉火（引导任务）
  // ------------------------------------------------------------
  {
    id: "q_r0",
    code: "R0",
    title: "点燃炉火",
    regionId: "hearth_hall",
    type: "reflection",
    order: 0,
    narrativeHook: "每一位铸造者入学的第一天，都要亲手点燃属于自己的炉火。火焰记得你为什么来。",
    objective: "写下你的转型宣言：你从哪里来，要去哪里，以及你的学习信条。",
    whyItMatters:
      "转型是一场长跑。当未来某天你在 ABI 边界的调试泥潭里怀疑自己时，这段宣言是你回来的路标。它也是学院为你定制推荐的依据。",
    prerequisites: [],
    definitionOfDone: [
      "写下 3 行转型宣言（现在的我 / 要成为的我 / 我的信条）。",
      "写下本周现实可投入的时间（诚实即可，不需要豪言）。",
    ],
    evidenceRequired: [
      {
        id: "manifesto",
        type: "text_reflection",
        label: "转型宣言（3 行）",
        placeholder: "现在的我是……\n我要成为……\n我的信条是：What I cannot create, I do not understand.",
        multiline: true,
      },
      {
        id: "weekly_time",
        type: "text_reflection",
        label: "本周可投入时间",
        placeholder: "例如：工作日每晚 1 小时，周六上午 3 小时",
      },
    ],
    skills: [],
    artifactIds: [],
    rewards: { xp: 40, gold: 40, skillPoints: 0, reputation: 0, insight: 0 },
    aiPrompt: forgePrompt(
      "R0",
      "点燃炉火",
      "梳理我的职业转型路径：Unity Mobile Production Engineer → Unity/C++ Boundary & Runtime Tooling Engineer → Headless C++ Deterministic Simulation Builder → Deterministic Realtime Simulation Infrastructure Engineer。帮我把这条路径压缩成 3 行个人宣言。",
    ),
    resources: [
      { label: "roadmap.sh / C++", url: "https://roadmap.sh/cpp", note: "只看地图全貌，不要开始学习" },
    ],
    commonTraps: ["把宣言写成一篇长文。三行就够。", "在第一天就制定完美计划。计划由任务系统承担。"],
    interviewExplanation: "我把职业转型当作一个工程项目来管理：有目标、有里程碑、有证据。",
    nextRisk: "仪式感之后最怕停留。明天直接创建仓库脚手架（M0），不要再『准备』。",
    unlocks: ["m0"],
    estimate: "10–15 分钟",
  },

  // ------------------------------------------------------------
  // M0 — 项目脚手架
  // ------------------------------------------------------------
  {
    id: "m0",
    code: "M0",
    title: "项目脚手架",
    regionId: "bridge_village",
    type: "main",
    order: 1,
    narrativeHook: "在桥能够承载信号之前，它需要地基。",
    objective: "创建 Unity Native Boundary Lab 的仓库脚手架。",
    whyItMatters:
      "这一步证明你把项目定位为严肃的边界研究（boundary research），而不是一个随手的 native DLL demo。清晰的结构会在后续 13 个里程碑里持续回报你。",
    prerequisites: ["q_r0"],
    definitionOfDone: [
      "GitHub 仓库存在，或本地 repo 已初始化。",
      "目录存在：native/、unity/、docs/。",
      "README 包含一段论文式 thesis（一段话）。",
      "docs 骨架存在。",
      "Unity 工程目录存在。",
      "UPM 包目录存在。",
      "完成第一次 commit。",
    ],
    evidenceRequired: [
      { id: "commit", type: "commit_hash", label: "Commit Hash", placeholder: "例如 a1b2c3d" },
      {
        id: "tree",
        type: "screenshot_note",
        label: "仓库结构（截图路径或文本树）",
        placeholder: "粘贴 tree 输出或截图路径",
        multiline: true,
      },
      {
        id: "thesis",
        type: "doc_section",
        label: "README thesis 段落",
        placeholder: "粘贴你的一段话 thesis",
        multiline: true,
      },
      {
        id: "reflection",
        type: "text_reflection",
        label: "3 行反思",
        placeholder: "今天做对了什么 / 卡在哪里 / 明天第一步",
        multiline: true,
      },
    ],
    skills: [],
    artifactIds: ["art_m0"],
    rewards: { xp: 80, gold: 60, skillPoints: 2, reputation: 5, insight: 0 },
    aiPrompt: forgePrompt(
      "M0",
      "项目脚手架",
      "创建 Unity Native Boundary Lab 仓库：native/、unity/、docs/ 三个顶层目录，README 一段话 thesis（Native C++ 不自动等于更快；边界设计、批处理、布局、生命周期与诊断决定 interop 是助力还是拖累），docs 骨架，Unity 工程目录与 UPM 包目录，并完成首次 commit。",
    ),
    resources: [
      { label: "GitHub — 新建仓库", url: "https://docs.github.com/repositories/creating-and-managing-repositories" },
      { label: "Unity — 自定义包结构", url: "https://docs.unity3d.com/Manual/cus-layout.html", note: "只看目录约定" },
    ],
    commonTraps: ["写代码之前写太多文档。", "过早启动 XR、Android、SIMD 或 render-thread。", "做成一个普通 Unity demo。"],
    interviewExplanation: "我把项目定位为边界研究，而不是随手的 native DLL demo。",
    nextRisk: "脚手架的整洁会诱惑你继续『完善结构』。到此为止，明天写 CMake。",
    unlocks: ["m1"],
    forbiddenForNow: EARLY_FORBIDDEN,
    estimate: "30–60 分钟",
  },

  // ------------------------------------------------------------
  // M1 — CMake 原生库
  // ------------------------------------------------------------
  {
    id: "m1",
    code: "M1",
    title: "CMake 原生库",
    regionId: "bridge_village",
    type: "main",
    order: 2,
    narrativeHook: "在 Unity 能听见之前，native runtime 必须先学会说话。",
    objective: "用 CMake 构建一个导出 NblGetVersionMajor/Minor/Patch 的原生库。",
    whyItMatters:
      "能在 Unity 之外独立构建 native 二进制，是『边界工程师』与『只会拖 DLL 的人』的分水岭。你将第一次直面编译、链接与符号导出。",
    prerequisites: ["m0"],
    definitionOfDone: [
      "CMake 工程可构建。",
      "产出原生库 artifact（.dll / .dylib / .so）。",
      "nbl_api.h 与 nbl_api.cpp 存在。",
      "NblGetVersionMajor/Minor/Patch 已导出。",
      "native 冒烟测试或手动验证确认版本函数存在。",
      "Unity plugin 文件位置已准备好。",
    ],
    evidenceRequired: [
      { id: "commit", type: "commit_hash", label: "Commit Hash", placeholder: "例如 a1b2c3d" },
      {
        id: "build_log",
        type: "screenshot_note",
        label: "构建输出（截图路径或日志片段）",
        placeholder: "粘贴构建成功的关键日志",
        multiline: true,
      },
      {
        id: "debug_release",
        type: "text_reflection",
        label: "Debug vs Release 简要说明",
        placeholder: "两种配置差异是什么？基准测试应该用哪个？",
        multiline: true,
      },
      {
        id: "failure_note",
        type: "text_reflection",
        label: "一条失败/调试记录（如有）",
        placeholder: "记录一次报错与你的解法",
        multiline: true,
        optional: true,
      },
    ],
    skills: ["skill_cmake", "skill_header_source", "skill_symbol_export", "skill_c_abi", "skill_compilation", "skill_linking"],
    artifactIds: ["art_m1"],
    rewards: { xp: 120, gold: 70, skillPoints: 3, reputation: 0, insight: 0 },
    aiPrompt: forgePrompt(
      "M1",
      "CMake 原生库",
      "创建一个 CMake 工程，构建名为 nbl 的共享库；nbl_api.h 声明并导出 NblGetVersionMajor/Minor/Patch 三个 C 函数（注意导出宏与 extern \"C\"）；nbl_api.cpp 实现它们；提供一个最小的 native 冒烟测试（可执行文件或脚本）验证符号存在。",
    ),
    resources: [
      { label: "CMake 官方教程", url: "https://cmake.org/cmake/help/latest/guide/tutorial/index.html", note: "只看 Step 1–2" },
      { label: "learncpp — 编译与链接", url: "https://www.learncpp.com/cpp-tutorial/introduction-to-the-compiler-linker-and-libraries/" },
    ],
    commonTraps: ["过早硬编码平台相关假设。", "头文件与实现不分离。", "忘记导出宏（__declspec(dllexport) / visibility）。"],
    interviewExplanation: "我可以在 Unity 之外构建 native 库，并对二进制产物进行推理。",
    nextRisk: "构建成功的兴奋会让你想立刻加功能。先让 Unity 听见它（M2），再谈其他。",
    unlocks: ["m2"],
    forbiddenForNow: EARLY_FORBIDDEN,
    estimate: "60–120 分钟",
  },

  // ------------------------------------------------------------
  // M2 — 第一次 P/Invoke 调用
  // ------------------------------------------------------------
  {
    id: "m2",
    code: "M2",
    title: "第一次 P/Invoke 调用",
    regionId: "bridge_village",
    type: "main",
    order: 3,
    narrativeHook: "native runtime 已经开口。今天，Unity 必须听见它。",
    objective: "在 Unity C# 中通过 DllImport 调用 NblGetVersionMajor/Minor/Patch。",
    whyItMatters:
      "这是 managed 世界与 unmanaged 世界的第一次握手。理解 Unity 如何发现并调用非托管函数，是后面一切边界工作的地基。",
    prerequisites: ["m1"],
    definitionOfDone: [
      "C# DllImport 声明可编译。",
      "原生库放置在 Unity 能加载的位置。",
      "Unity Editor 场景打印出 native 版本号。",
      "失败案例被干净地记录下来。",
      "你能解释为什么 extern \"C\" 是必要的。",
    ],
    evidenceRequired: [
      { id: "commit", type: "commit_hash", label: "Commit Hash", placeholder: "例如 a1b2c3d" },
      {
        id: "editor_shot",
        type: "screenshot_note",
        label: "Unity Editor 截图（路径或说明）",
        placeholder: "Console 打印版本号的截图路径",
      },
      {
        id: "debug_note",
        type: "text_reflection",
        label: "DLL 加载或符号问题的调试记录",
        placeholder: "例如 EntryPointNotFoundException 的排查过程",
        multiline: true,
      },
      {
        id: "explain_90s",
        type: "text_reflection",
        label: "90 秒文字讲解",
        placeholder: "向面试官解释：Unity 是如何找到并调用这个 native 函数的？",
        multiline: true,
      },
    ],
    skills: ["skill_extern_c", "skill_plugin_loading", "skill_dllimport", "skill_dynlib", "skill_abi"],
    artifactIds: ["art_m2"],
    rewards: { xp: 140, gold: 80, skillPoints: 3, reputation: 0, insight: 0 },
    aiPrompt: forgePrompt(
      "M2",
      "第一次 P/Invoke 调用",
      "Unity C# 通过 DllImport 调用 native 的 NblGetVersionMajor/Minor/Patch，并在 Unity Editor 中打印版本号。",
    ),
    resources: [
      { label: "Unity — Native plug-ins", url: "https://docs.unity3d.com/Manual/NativePlugins.html" },
      { label: "Microsoft — P/Invoke", url: "https://learn.microsoft.com/dotnet/standard/native-interop/pinvoke" },
    ],
    commonTraps: [
      "缺少 extern \"C\" 导致 EntryPointNotFoundException。",
      "plugin 文件名错误。",
      "架构不匹配（x64 vs ARM64）。",
      "Unity 导入设置未配置。",
    ],
    interviewExplanation: "我理解 managed Unity 代码如何发现并调用 unmanaged 函数。",
    nextRisk: "一次成功调用不等于契约。下一步（M3）要建立生命周期与所有权规则。",
    unlocks: ["m3"],
    forbiddenForNow: EARLY_FORBIDDEN,
    estimate: "60–120 分钟",
  },

  // ------------------------------------------------------------
  // M3 — 上下文生命周期
  // ------------------------------------------------------------
  {
    id: "m3",
    code: "M3",
    title: "上下文生命周期",
    regionId: "bridge_village",
    type: "main",
    order: 4,
    narrativeHook: "一个信号还不够。桥需要所有权的规则。",
    objective: "实现 NblCreateContext / NblDestroyContext 与 C# 侧的 NativeBoundaryContext : IDisposable 封装。",
    whyItMatters:
      "跨 ABI 泄漏 C++ 对象是无数事故的源头。opaque handle + 显式生命周期 + IDisposable，是把 native 资源装进 managed 世界的标准安全容器。",
    prerequisites: ["m2"],
    definitionOfDone: [
      "native context 可创建、可销毁。",
      "C# wrapper 私有持有 IntPtr。",
      "gameplay 层碰不到裸 native handle。",
      "双重 Dispose 是安全的。",
      "无效 handle 行为已测试或已文档化。",
      "所有权模型已写成文档。",
    ],
    evidenceRequired: [
      { id: "commit", type: "commit_hash", label: "Commit Hash", placeholder: "例如 a1b2c3d" },
      {
        id: "wrapper_code",
        type: "code_snippet",
        label: "IDisposable wrapper 代码片段或截图",
        placeholder: "粘贴 NativeBoundaryContext 关键代码",
        multiline: true,
      },
      {
        id: "ownership",
        type: "doc_section",
        label: "所有权表",
        placeholder: "谁创建 / 谁持有 / 谁销毁 / 谁不允许触碰",
        multiline: true,
      },
      {
        id: "double_dispose",
        type: "text_reflection",
        label: "双重 Dispose 验证记录",
        placeholder: "你如何验证 Dispose 两次不会崩溃？",
        multiline: true,
      },
      {
        id: "interview",
        type: "text_reflection",
        label: "简短面试回答",
        placeholder: "为什么用 opaque handle 而不是把 C++ 对象暴露给 C#？",
        multiline: true,
      },
    ],
    skills: ["skill_opaque_handle", "skill_raii", "skill_unique_ptr", "skill_intptr", "skill_idisposable", "skill_arch_explain"],
    artifactIds: ["art_m3"],
    rewards: { xp: 160, gold: 90, skillPoints: 3, reputation: 0, insight: 0 },
    aiPrompt: forgePrompt(
      "M3",
      "上下文生命周期",
      "native 侧实现 NblCreateContext / NblDestroyContext（内部用 std::unique_ptr 管理），C# 侧实现 NativeBoundaryContext : IDisposable，私有持有 IntPtr，保证双重 Dispose 安全，并写出所有权表。",
    ),
    resources: [
      { label: "Microsoft — IDisposable 模式", url: "https://learn.microsoft.com/dotnet/standard/garbage-collection/implementing-dispose" },
      { label: "learncpp — RAII / 智能指针", url: "https://www.learncpp.com/cpp-tutorial/introduction-to-smart-pointers-move-semantics/" },
    ],
    commonTraps: [
      "让 MonoBehaviour 直接持有裸 IntPtr。",
      "Dispose 不幂等。",
      "假设 native 内存 bug 无害。",
      "让 C++ 对象跨越 ABI。",
    ],
    interviewExplanation: "我使用 opaque handle 与显式生命周期，而不是让 C++ 对象跨 ABI 泄漏。",
    nextRisk: "新手村只差最后一道门：把 M0–M3 的理解压缩成能讲出来的语言。",
    unlocks: ["boss_bridge"],
    forbiddenForNow: EARLY_FORBIDDEN,
    estimate: "90–150 分钟",
  },

  // ------------------------------------------------------------
  // BOSS — 初次信号之门
  // ------------------------------------------------------------
  {
    id: "boss_bridge",
    code: "BOSS",
    title: "初次信号之门",
    regionId: "bridge_village",
    type: "boss",
    order: 5,
    narrativeHook: "石门上刻着三个问题。只有能亲口回答的人，才配走向平原。",
    objective: "汇总 Bridge Village 的全部证据，并回答三个边界之问。",
    whyItMatters:
      "Boss 之门不是新代码，而是理解的凝结。能把 C ABI、opaque handle、IDisposable 讲清楚的人，才真正拥有了这些技能——面试官也是这么想的。",
    prerequisites: ["m0", "m1", "m2", "m3"],
    definitionOfDone: [
      "M0–M3 全部完成且证据齐全。",
      "写出 5 句话的 Bridge Village 总结。",
      "回答：为什么用 C ABI？",
      "回答：为什么用 opaque handle？",
      "回答：为什么用 IDisposable？",
    ],
    evidenceRequired: [
      {
        id: "summary",
        type: "text_reflection",
        label: "Bridge Village 五句总结",
        placeholder: "用 5 句话讲完从脚手架到生命周期契约的旅程",
        multiline: true,
      },
      {
        id: "why_c_abi",
        type: "text_reflection",
        label: "为什么用 C ABI？",
        placeholder: "你的回答……",
        multiline: true,
      },
      {
        id: "why_opaque",
        type: "text_reflection",
        label: "为什么用 opaque handle？",
        placeholder: "你的回答……",
        multiline: true,
      },
      {
        id: "why_idisposable",
        type: "text_reflection",
        label: "为什么用 IDisposable？",
        placeholder: "你的回答……",
        multiline: true,
      },
    ],
    skills: ["skill_interview_defense"],
    artifactIds: [],
    rewards: { xp: 300, gold: 150, skillPoints: 1, reputation: 25, insight: 2 },
    aiPrompt: forgePrompt(
      "BOSS",
      "初次信号之门",
      "帮我演练三个面试问题：为什么用 C ABI？为什么用 opaque handle？为什么用 IDisposable？对我的回答提出改进建议，并帮我把 Bridge Village 的旅程压缩成 5 句话。",
      "\n你扮演一位友善但严格的系统工程面试官。",
    ),
    resources: [],
    commonTraps: ["用背诵代替理解。", "回答太长。面试回答的黄金长度是 60–90 秒。"],
    interviewExplanation: "我能在 90 秒内讲清 managed/unmanaged 边界的三大契约：ABI、句柄、生命周期。",
    nextRisk: "平原上的数据契约（blittable）比看起来更严格。别带着'大概匹配'的心态过去。",
    unlocks: ["m4"],
    estimate: "30–45 分钟",
  },

  // ------------------------------------------------------------
  // M4 — Agent 数据契约
  // ------------------------------------------------------------
  {
    id: "m4",
    code: "M4",
    title: "Agent 数据契约",
    regionId: "benchmark_plains",
    type: "main",
    order: 6,
    narrativeHook: "平原上的第一块测量石碑：两个世界必须对同一块内存达成一致。",
    objective: "在 C++ 中定义 blittable 的 NblAgent，并在 C# 中定义完全匹配的 Agent struct。",
    whyItMatters:
      "跨边界传递数据的前提是两侧对字节布局的共识。static_assert 与 size check 是把这份共识写进编译器的方式——它们比任何注释都可靠。",
    prerequisites: ["boss_bridge"],
    definitionOfDone: [
      "C++ NblAgent 存在。",
      "C# 匹配的 Agent struct 存在。",
      "C++ static_assert 校验 size 与 offsets。",
      "C# size check 校验布局。",
      "README 或 docs 解释了 blittable 边界。",
    ],
    evidenceRequired: [
      { id: "commit", type: "commit_hash", label: "Commit Hash", placeholder: "例如 a1b2c3d" },
      {
        id: "cpp_assert",
        type: "code_snippet",
        label: "C++ static_assert 片段或截图",
        placeholder: "粘贴 static_assert(sizeof(NblAgent) == ...) 等",
        multiline: true,
      },
      {
        id: "cs_check",
        type: "code_snippet",
        label: "C# size check 片段或截图",
        placeholder: "粘贴 Marshal.SizeOf / sizeof 校验代码",
        multiline: true,
      },
      {
        id: "blittable_explain",
        type: "text_reflection",
        label: "blittable 的简短解释",
        placeholder: "什么样的 struct 是 blittable 的？为什么重要？",
        multiline: true,
      },
    ],
    skills: ["skill_blittable", "skill_structlayout", "skill_value_ref", "skill_stack_heap"],
    artifactIds: ["art_m4"],
    rewards: { xp: 140, gold: 80, skillPoints: 3, reputation: 0, insight: 0 },
    aiPrompt: forgePrompt(
      "M4",
      "Agent 数据契约",
      "定义 C++ NblAgent（position、velocity 等字段）与 C# [StructLayout(LayoutKind.Sequential)] Agent struct，使两者字节布局完全一致；C++ 用 static_assert 校验 size/offset，C# 侧加 size check；并解释为什么这个 struct 是 blittable 的。",
    ),
    resources: [
      { label: "Microsoft — Blittable 类型", url: "https://learn.microsoft.com/dotnet/framework/interop/blittable-and-non-blittable-types" },
      { label: "Microsoft — StructLayout", url: "https://learn.microsoft.com/dotnet/api/system.runtime.interopservices.structlayoutattribute" },
    ],
    commonTraps: [
      "在边界 struct 里使用 string、object、托管数组或引用。",
      "把 Pack=1 当成默认优化。",
      "假设 C# Vector3 与 C++ struct 永远匹配。",
    ],
    interviewExplanation: "我能设计可以安全跨越 managed/unmanaged 边界的数据结构。",
    nextRisk: "契约建立后，别急着逐个传 Agent——下一步的重点恰恰是批处理。",
    unlocks: ["m5"],
    estimate: "60–90 分钟",
  },

  // ------------------------------------------------------------
  // M5 — 原生批处理步进
  // ------------------------------------------------------------
  {
    id: "m5",
    code: "M5",
    title: "原生批处理步进",
    regionId: "benchmark_plains",
    type: "main",
    order: 7,
    narrativeHook: "一次渡桥，运送整支军团——而不是让每个士兵单独排队过桥。",
    objective: "实现 NblStepAgents，一次调用批量更新整个 agent 数组。",
    whyItMatters:
      "边界穿越本身有固定成本。批处理是 interop 性能的第一原则：把 N 次穿越变成 1 次。这也是后面 anti-pattern 对照实验的正面样本。",
    prerequisites: ["m4"],
    definitionOfDone: [
      "NblStepAgents 可更新一个 agent 数组。",
      "100 个 agent 更新结果正确。",
      "checksum 校验通过。",
      "每批次 native 调用次数为 1。",
      "Unity 可视化样例能展示 agent 移动或简化可视化。",
    ],
    evidenceRequired: [
      { id: "commit", type: "commit_hash", label: "Commit Hash", placeholder: "例如 a1b2c3d" },
      {
        id: "visual",
        type: "screenshot_note",
        label: "agent 运动截图/GIF 或调试输出",
        placeholder: "路径或粘贴调试输出",
      },
      {
        id: "checksum",
        type: "text_reflection",
        label: "checksum 校验记录",
        placeholder: "你如何计算并核对 checksum？",
        multiline: true,
      },
      {
        id: "batch_explain",
        type: "text_reflection",
        label: "批处理的 3 行解释",
        placeholder: "为什么一次批量调用优于 N 次单独调用？",
        multiline: true,
      },
    ],
    skills: ["skill_span", "skill_nativearray", "skill_hot_path"],
    artifactIds: ["art_m5"],
    rewards: { xp: 180, gold: 90, skillPoints: 3, reputation: 0, insight: 0 },
    aiPrompt: forgePrompt(
      "M5",
      "原生批处理步进",
      "实现 NblStepAgents(context, agents*, count, dt)：一次 P/Invoke 调用批量更新全部 agent；C# 侧用 NativeArray 或 pinned 数组传递；用 checksum 验证 100 个 agent 的更新正确性；在 Unity 中做最简可视化。",
    ),
    resources: [
      { label: "Unity — NativeArray", url: "https://docs.unity3d.com/ScriptReference/Unity.Collections.NativeArray_1.html" },
      { label: "cppreference — std::span", url: "https://en.cppreference.com/w/cpp/container/span", note: "native 内部使用" },
    ],
    commonTraps: ["每个实体一次 P/Invoke。", "渲染成本淹没仿真测量。", "没有 checksum 校验。"],
    interviewExplanation: "我刻意使用批量调用来避免逐实体的边界开销。",
    nextRisk: "下一步要故意写『坏代码』（per-agent 反模式）。记住它存在的唯一意义是对照。",
    unlocks: ["m6"],
    estimate: "90–150 分钟",
  },

  // ------------------------------------------------------------
  // M6 — 逐 Agent 反模式
  // ------------------------------------------------------------
  {
    id: "m6",
    code: "M6",
    title: "逐 Agent 反模式",
    regionId: "benchmark_plains",
    type: "main",
    order: 8,
    narrativeHook: "平原博物馆需要一个反面标本：让每个士兵单独排队过桥，然后测量队伍有多长。",
    objective: "实现 native per-agent 模式，作为基准对照的刻意反模式。",
    whyItMatters:
      "『native 不一定更快』需要证据。一个输出正确但性能糟糕的 per-agent 模式，是你论文里最有说服力的反面论据。",
    prerequisites: ["m5"],
    definitionOfDone: [
      "native per-agent 模式存在。",
      "每帧 native 调用次数 == agent 数量。",
      "输出与批处理模式在容差内一致。",
      "UI 明确标注它是反模式。",
    ],
    evidenceRequired: [
      { id: "commit", type: "commit_hash", label: "Commit Hash", placeholder: "例如 a1b2c3d" },
      {
        id: "calls_shot",
        type: "screenshot_note",
        label: "native calls/frame 截图",
        placeholder: "显示每帧调用次数的截图路径",
      },
      {
        id: "why_bad",
        type: "text_reflection",
        label: "为什么它刻意是坏的？",
        placeholder: "边界穿越成本 × N 的机制解释",
        multiline: true,
      },
      {
        id: "compare_note",
        type: "text_reflection",
        label: "与批处理路径的对照记录",
        placeholder: "相同输入下两种模式的输出一致性与调用次数对比",
        multiline: true,
      },
    ],
    skills: ["skill_tradeoff"],
    artifactIds: ["art_m6"],
    rewards: { xp: 160, gold: 90, skillPoints: 2, reputation: 5, insight: 0 },
    aiPrompt: forgePrompt(
      "M6",
      "逐 Agent 反模式",
      "实现 per-agent 模式：每帧对每个 agent 单独做一次 P/Invoke（NblStepSingleAgent）；统计每帧 native 调用次数；用相同输入数据验证输出与批处理模式在容差内一致；在 UI 上明确标注 ANTI-PATTERN。",
    ),
    resources: [
      { label: "Microsoft — 原生互操作性能", url: "https://learn.microsoft.com/dotnet/standard/native-interop/best-practices" },
    ],
    commonTraps: ["把 per-agent P/Invoke 当成推荐做法展示。", "不同模式使用不同输入数据做对比。", "忘记容差校验。"],
    interviewExplanation: "我能演示为什么天真的 native 集成可能比 C# 更糟。",
    nextRisk: "有了正反两个样本，下一步必须让测量方法本身经得起质疑（M7）。",
    unlocks: ["m7"],
    estimate: "60–90 分钟",
  },

  // ------------------------------------------------------------
  // M7 — 基准运行器 + HUD
  // ------------------------------------------------------------
  {
    id: "m7",
    code: "M7",
    title: "基准运行器 + HUD",
    regionId: "benchmark_plains",
    type: "main",
    order: 9,
    narrativeHook: "平原中央的大石碑终于立起：从此测量有了仪式，数字有了尊严。",
    objective: "实现固定 seed、warmup、测量帧窗口、median/p95、GC alloc、运行时 HUD 与 CSV/JSON 导出。",
    whyItMatters:
      "没有方法论的 benchmark 只是轶事。固定 seed、剔除 warmup、报告中位数与尾部延迟——这是把'我觉得更快'变成'数据显示'的全部分量。",
    prerequisites: ["m6"],
    definitionOfDone: [
      "基准运行器支持 1k / 5k / 10k agents。",
      "所有模式使用相同固定 seed。",
      "warmup 帧被排除。",
      "报告 median 与 p95。",
      "记录 GC allocation。",
      "运行时 HUD 显示：mode、agent count、native calls/frame、ms/frame、GC alloc、checksum。",
      "CSV 或 JSON 导出可用。",
    ],
    evidenceRequired: [
      { id: "commit", type: "commit_hash", label: "Commit Hash", placeholder: "例如 a1b2c3d" },
      { id: "hud_shot", type: "screenshot_note", label: "HUD 截图", placeholder: "截图路径" },
      {
        id: "export_sample",
        type: "benchmark_file",
        label: "导出的 CSV/JSON 样本",
        placeholder: "粘贴前几行或文件路径",
        multiline: true,
      },
      {
        id: "methodology",
        type: "doc_section",
        label: "基准方法论笔记",
        placeholder: "seed / warmup / 测量窗口 / 统计口径 / 渲染隔离",
        multiline: true,
      },
      {
        id: "linkedin_seed",
        type: "linkedin_draft",
        label: "LinkedIn 草稿种子",
        placeholder: "为这个 benchmark 写 3-5 句展示草稿",
        multiline: true,
      },
    ],
    skills: ["skill_benchmarking", "skill_gc_alloc", "skill_hud", "skill_profiling", "skill_bench_method", "skill_linkedin"],
    artifactIds: ["art_m7"],
    rewards: { xp: 220, gold: 120, skillPoints: 3, reputation: 15, insight: 0 },
    aiPrompt: forgePrompt(
      "M7",
      "基准运行器 + HUD",
      "构建 benchmark runner：固定 seed 初始化 1k/5k/10k agents；跳过 warmup 帧后测量 N 帧；对每模式统计 ms/frame 的 median 与 p95、GC alloc、native calls/frame、checksum；运行时 HUD 展示以上指标；支持导出 CSV 或 JSON。",
    ),
    resources: [
      { label: "Unity — Profiler", url: "https://docs.unity3d.com/Manual/Profiler.html" },
      { label: "Unity — ProfilerRecorder", url: "https://docs.unity3d.com/ScriptReference/Unity.Profiling.ProfilerRecorder.html" },
    ],
    commonTraps: [
      "只报告最好的一帧。",
      "把渲染成本混进仿真测量。",
      "对比输出不一致的模式。",
      "跑 native Debug 构建却假装是最终结果。",
    ],
    interviewExplanation: "我测量 interop，而不是猜测。",
    nextRisk: "在没有 Burst 基线之前，任何'native 更快'的结论都是提前庆祝。",
    unlocks: ["m8"],
    estimate: "120–180 分钟",
  },

  // ------------------------------------------------------------
  // M8 — Burst 基线
  // ------------------------------------------------------------
  {
    id: "m8",
    code: "M8",
    title: "Burst 基线",
    regionId: "benchmark_plains",
    type: "main",
    order: 10,
    narrativeHook: "公平的审判需要最强的辩方证人：Unity 自己的高性能路径。",
    objective: "加入 C# Jobs + Burst 模式，形成公平对比。",
    whyItMatters:
      "跳过 Burst 直接吹捧 C++，会让整个研究失去可信度。承认并测量 Unity 的高性能路径，你的结论才有资格被引用。",
    prerequisites: ["m7"],
    definitionOfDone: [
      "Burst 模式存在。",
      "Burst 输出与其他模式校验一致。",
      "基准报告包含 Burst 模式。",
      "文档明确说明：这不是 C++ 崇拜。",
    ],
    evidenceRequired: [
      { id: "commit", type: "commit_hash", label: "Commit Hash", placeholder: "例如 a1b2c3d" },
      {
        id: "report",
        type: "benchmark_file",
        label: "含 Burst 的基准报告",
        placeholder: "粘贴报告关键行或文件路径",
        multiline: true,
      },
      {
        id: "fairness",
        type: "text_reflection",
        label: "公平性简短说明",
        placeholder: "为什么必须有 Burst 基线？",
        multiline: true,
      },
      {
        id: "readme_para",
        type: "doc_section",
        label: "更新后的 README 段落",
        placeholder: "粘贴'这不是 C++ 崇拜'的段落",
        multiline: true,
      },
    ],
    skills: ["skill_burst", "skill_thread"],
    artifactIds: ["art_m8"],
    rewards: { xp: 200, gold: 100, skillPoints: 2, reputation: 10, insight: 0 },
    aiPrompt: forgePrompt(
      "M8",
      "Burst 基线",
      "用 C# Job System + Burst 实现与 native 相同的 agent 步进逻辑；验证输出与其他模式一致（checksum）；把 Burst 模式纳入基准报告；在 README 明确写下'本项目不是 C++ 崇拜'的公平性声明。",
    ),
    resources: [
      { label: "Unity — Burst", url: "https://docs.unity3d.com/Packages/com.unity.burst@latest" },
      { label: "Unity — Job System", url: "https://docs.unity3d.com/Manual/JobSystem.html" },
    ],
    commonTraps: ["Burst 编译未生效（没看 Inspector 确认）。", "Jobs 并行度与 native 单线程不对等却直接对比。", "输出未校验就宣布结论。"],
    interviewExplanation: "我不宣称 C++ 自动更快；我拿它与 Unity 自己的高性能路径对比。",
    nextRisk: "四种模式齐备，Boss 之门在等你把方法论讲成一个 90 秒的故事。",
    unlocks: ["boss_benchmark"],
    estimate: "90–150 分钟",
  },

  // ------------------------------------------------------------
  // BOSS — 边界成本试炼
  // ------------------------------------------------------------
  {
    id: "boss_benchmark",
    code: "BOSS",
    title: "边界成本试炼",
    regionId: "benchmark_plains",
    type: "boss",
    order: 11,
    narrativeHook: "试炼官只问一个问题：你的数字，凭什么让人相信？",
    objective: "汇总 Benchmark Plains 的证据，完成公开展示的第一步。",
    whyItMatters:
      "这是 Act I 的公开 demo 切片（Agent Swarm Boundary Benchmark）成型的时刻。它将成为你的第一件可对外展示的边界工程证据。",
    prerequisites: ["m4", "m5", "m6", "m7", "m8"],
    definitionOfDone: [
      "M4–M8 全部完成。",
      "基准输出已导出。",
      "HUD 截图存在。",
      "写出 90 秒讲解：如何设计 benchmark 使其测量边界成本而不是渲染成本？",
      "起草第一篇 LinkedIn/GitHub 展示笔记。",
    ],
    evidenceRequired: [
      {
        id: "export_confirm",
        type: "benchmark_file",
        label: "基准导出（路径或关键数据）",
        placeholder: "四种模式在 5k agents 下的 median/p95",
        multiline: true,
      },
      { id: "hud_confirm", type: "screenshot_note", label: "HUD 截图路径", placeholder: "截图路径" },
      {
        id: "explain_90s",
        type: "text_reflection",
        label: "90 秒方法论讲解",
        placeholder: "我如何把边界成本与渲染成本分离……",
        multiline: true,
      },
      {
        id: "showcase_draft",
        type: "linkedin_draft",
        label: "首篇 LinkedIn/GitHub 展示草稿",
        placeholder: "完整草稿（可此后润色）",
        multiline: true,
      },
    ],
    skills: ["skill_resume_bullet"],
    artifactIds: [],
    rewards: { xp: 400, gold: 200, skillPoints: 1, reputation: 40, insight: 2 },
    aiPrompt: forgePrompt(
      "BOSS",
      "边界成本试炼",
      "扮演严格的性能工程面试官，围绕我的 Agent Swarm Benchmark 追问：seed 固定了吗？warmup 怎么处理？为什么用 median/p95？渲染成本如何隔离？GC alloc 怎么测的？然后帮我把回答打磨成 90 秒版本，并润色我的第一篇 LinkedIn 展示草稿。",
    ),
    resources: [],
    commonTraps: ["把展示草稿写成流水账。聚焦一个反直觉结论：native 不一定更快。", "在草稿里夸大结论。"],
    interviewExplanation: "我设计了隔离渲染成本的基准方法论，并用 median/p95、GC alloc 与 checksum 支撑结论。",
    nextRisk: "档案馆的内存布局实验容易发散。记住每个实验都要产出可对比的表格。",
    unlocks: ["m9"],
    estimate: "45–60 分钟",
  },

  // ------------------------------------------------------------
  // M9 — 内存布局实验室
  // ------------------------------------------------------------
  {
    id: "m9",
    code: "M9",
    title: "内存布局实验室",
    regionId: "layout_archives",
    type: "main",
    order: 12,
    narrativeHook: "档案馆的卷轴上写着：数据的形状，决定它旅行的速度。",
    objective: "构建 AoS/SoA、natural/packed、copy/pointer 路径的对照实验。",
    whyItMatters:
      "布局是性能与契约的交汇点。理解 AoS 与 SoA、对齐与 padding、复制与借用指针的边界约束，你才真正拥有'数据视角'。",
    prerequisites: ["boss_benchmark"],
    definitionOfDone: [
      "AoS 与 SoA 两种变体存在。",
      "natural 与 packed 布局对比存在。",
      "布局尺寸被报告。",
      "pointer 路径被文档化为高级且受约束的路径。",
      "native 不在调用结束后保留借来的 Unity 指针。",
      "产出内存布局报告。",
    ],
    evidenceRequired: [
      { id: "commit", type: "commit_hash", label: "Commit Hash", placeholder: "例如 a1b2c3d" },
      {
        id: "layout_report",
        type: "doc_section",
        label: "布局报告",
        placeholder: "粘贴报告关键结论或文件路径",
        multiline: true,
      },
      { id: "table_shot", type: "screenshot_note", label: "对比表截图", placeholder: "截图路径" },
      {
        id: "pack1",
        type: "text_reflection",
        label: "为什么 Pack=1 不是魔法？",
        placeholder: "对齐、未对齐访问代价、平台差异……",
        multiline: true,
      },
    ],
    skills: ["skill_memory_layout", "skill_unsafe_ptr", "skill_blog"],
    artifactIds: ["art_m9"],
    rewards: { xp: 220, gold: 110, skillPoints: 3, reputation: 10, insight: 0 },
    aiPrompt: forgePrompt(
      "M9",
      "内存布局实验室",
      "设计布局实验：AoS vs SoA 的 agent 数据（两侧一致）、natural vs packed（Pack=1）布局的 sizeof/offset 报告、copy 路径 vs pinned pointer 路径的约束对比；明确规则：native 不得在调用结束后保留借来的指针；产出一份 Markdown 布局报告。",
    ),
    resources: [
      { label: "cppreference — 对齐", url: "https://en.cppreference.com/w/cpp/language/object#Alignment" },
      { label: "Microsoft — Marshalling", url: "https://learn.microsoft.com/dotnet/standard/native-interop/type-marshalling" },
    ],
    commonTraps: ["把 Pack=1 当优化默认值。", "SoA 实验只做一半（native 侧没改）。", "borrowed pointer 生命周期越界。"],
    interviewExplanation: "我理解数据布局与边界契约，而不只是语法。",
    nextRisk: "布局之后是失败处理。别把'能跑'当作'安全'。",
    unlocks: ["boss_layout"],
    estimate: "120–180 分钟",
  },

  // ------------------------------------------------------------
  // BOSS — Blittable 契约
  // ------------------------------------------------------------
  {
    id: "boss_layout",
    code: "BOSS",
    title: "Blittable 契约之印",
    regionId: "layout_archives",
    type: "boss",
    order: 13,
    narrativeHook: "档案馆长合上卷轴：把你学到的布局法则，盖上你自己的印章。",
    objective: "汇总布局实验成果，完成 Blittable 契约的答辩。",
    whyItMatters: "布局知识只有在能被清晰转述时才算资产。这道门把实验数据变成你的语言。",
    prerequisites: ["m9"],
    definitionOfDone: ["M9 完成且布局报告存在。", "能在 60 秒内回答 AoS/SoA 的选择依据。"],
    evidenceRequired: [
      {
        id: "report_loc",
        type: "doc_section",
        label: "布局报告位置",
        placeholder: "docs/layout-report.md 或链接",
      },
      {
        id: "aos_soa",
        type: "text_reflection",
        label: "60 秒回答：什么时候选 AoS，什么时候选 SoA？",
        placeholder: "访问模式、缓存行、边界传输……",
        multiline: true,
      },
    ],
    skills: [],
    artifactIds: [],
    rewards: { xp: 300, gold: 140, skillPoints: 0, reputation: 20, insight: 2 },
    aiPrompt: forgePrompt(
      "BOSS",
      "Blittable 契约之印",
      "扮演面试官，就 AoS vs SoA、对齐与 padding、blittable 约束对我进行 5 个问题的快问快答，并对我的回答给出改进版本。",
    ),
    resources: [],
    commonTraps: ["答辩时罗列术语而不给判断标准。"],
    interviewExplanation: "我能基于访问模式与边界传输成本，为具体场景选择数据布局。",
    nextRisk: "诊所里的失败注入需要耐心。安全边界的价值恰恰在'不崩溃'这种看不见的地方。",
    unlocks: ["m10"],
    estimate: "20–30 分钟",
  },

  // ------------------------------------------------------------
  // M10 — 安全与错误边界
  // ------------------------------------------------------------
  {
    id: "m10",
    code: "M10",
    title: "安全与错误边界",
    regionId: "safety_clinic",
    type: "main",
    order: 14,
    narrativeHook: "诊所的守则写在门口：失败不可怕，不可恢复的失败才可怕。",
    objective: "实现 ResultCode、LastError、native catch 边界、日志回调与无效输入测试。",
    whyItMatters:
      "生产级 wrapper 与 demo 的区别在失败路径。让 native 异常止步于 ABI、让每个失败可查询可恢复，gameplay 团队才敢用你的库。",
    prerequisites: ["boss_layout"],
    definitionOfDone: [
      "可恢复失败返回 result code。",
      "LastError 可查询。",
      "存在无效 handle 测试。",
      "存在 buffer-too-small 测试。",
      "双重 Dispose 依然安全。",
      "native 异常不会有意跨越 C ABI。",
      "文档警告：内存损坏仍可能使进程崩溃。",
    ],
    evidenceRequired: [
      { id: "commit", type: "commit_hash", label: "Commit Hash", placeholder: "例如 a1b2c3d" },
      { id: "diag_shot", type: "screenshot_note", label: "诊断信息截图", placeholder: "截图路径" },
      {
        id: "injection_note",
        type: "text_reflection",
        label: "失败注入记录",
        placeholder: "你注入了哪些失败？系统如何反应？",
        multiline: true,
      },
      {
        id: "safety_explain",
        type: "text_reflection",
        label: "安全边界解释",
        placeholder: "为什么异常不能跨 C ABI？wrapper 能保证什么、不能保证什么？",
        multiline: true,
      },
    ],
    skills: ["skill_result_code", "skill_no_exceptions", "skill_editor_diag", "skill_process", "skill_failure_explain"],
    artifactIds: ["art_m10"],
    rewards: { xp: 220, gold: 110, skillPoints: 3, reputation: 0, insight: 0 },
    aiPrompt: forgePrompt(
      "M10",
      "安全与错误边界",
      "设计 NblResultCode 枚举与所有 API 的返回码化；实现 NblGetLastError；native 边界统一 try/catch 并转换为 result code；提供日志回调注册；编写无效 handle 与 buffer-too-small 的失败注入测试；文档写明 wrapper 的安全边界与局限。",
    ),
    resources: [
      { label: "Microsoft — 互操作最佳实践", url: "https://learn.microsoft.com/dotnet/standard/native-interop/best-practices" },
    ],
    commonTraps: ["让 C++ 异常穿过 ABI。", "错误码没有配套的 LastError 细节。", "只测试快乐路径。"],
    interviewExplanation: "wrapper 让 native 代码可以被 gameplay 代码更安全地消费。",
    nextRisk: "安全完成后，警惕'再加一个功能'的冲动——下一步是打包，不是扩展。",
    unlocks: ["boss_safety"],
    estimate: "120–180 分钟",
  },

  // ------------------------------------------------------------
  // BOSS — 可恢复失败试炼
  // ------------------------------------------------------------
  {
    id: "boss_safety",
    code: "BOSS",
    title: "可恢复失败试炼",
    regionId: "safety_clinic",
    type: "boss",
    order: 15,
    narrativeHook: "主治医师递来最后一份病历：请描述一次你亲手治愈的失败。",
    objective: "完成安全边界的答辩与失败案例总结。",
    whyItMatters: "能条理清晰地讲述失败处理设计，是系统工程师面试中最值钱的能力之一。",
    prerequisites: ["m10"],
    definitionOfDone: ["M10 完成。", "总结全部失败注入实验。", "能回答：为什么异常不能跨 C ABI？"],
    evidenceRequired: [
      {
        id: "injection_summary",
        type: "text_reflection",
        label: "失败注入实验总结",
        placeholder: "列出注入的失败类型与系统表现",
        multiline: true,
      },
      {
        id: "defense",
        type: "text_reflection",
        label: "安全边界答辩（90 秒）",
        placeholder: "result code 设计、LastError、异常边界、已知局限",
        multiline: true,
      },
    ],
    skills: [],
    artifactIds: [],
    rewards: { xp: 300, gold: 140, skillPoints: 0, reputation: 20, insight: 2 },
    aiPrompt: forgePrompt(
      "BOSS",
      "可恢复失败试炼",
      "扮演面试官，围绕我的错误边界设计追问：为什么不用异常跨 ABI？result code 与 LastError 如何配合？哪些失败可恢复、哪些不可？帮我打磨出 90 秒答辩版本。",
    ),
    resources: [],
    commonTraps: ["把'没崩溃'当成'安全'的全部定义。"],
    interviewExplanation: "我能设计并讲清 native 库的失败模型：可恢复、可诊断、有边界。",
    nextRisk: "打包是面向他人的工程。港口的标准比你想象的更严格。",
    unlocks: ["m11"],
    estimate: "20–30 分钟",
  },

  // ------------------------------------------------------------
  // M11 — UPM 打包
  // ------------------------------------------------------------
  {
    id: "m11",
    code: "M11",
    title: "UPM 打包",
    regionId: "package_harbor",
    type: "main",
    order: 16,
    narrativeHook: "港口的规矩：货物必须装箱、贴标、可追溯，才能登船。",
    objective: "把 runtime/editor 代码移入干净的 UPM 包，带 Samples~ 与 asmdef。",
    whyItMatters:
      "从'我的场景里能跑'到'任何人 import 就能跑'，是从 demo 作者到工具工程师的一跃。UPM 包是 Unity 生态里开发者工具的通用语言。",
    prerequisites: ["boss_safety"],
    definitionOfDone: [
      "包目录结构存在。",
      "Runtime asmdef 存在。",
      "Editor asmdef 存在。",
      "Samples~ 包含 HelloNative 与 AgentSwarmBenchmark。",
      "全新 Unity 工程可导入包并运行 sample。",
      "包 README 存在。",
    ],
    evidenceRequired: [
      { id: "commit", type: "commit_hash", label: "Commit Hash", placeholder: "例如 a1b2c3d" },
      { id: "pkg_shot", type: "screenshot_note", label: "包目录截图", placeholder: "截图路径" },
      {
        id: "fresh_validate",
        type: "text_reflection",
        label: "全新工程验证记录",
        placeholder: "新工程 import 的步骤与结果",
        multiline: true,
      },
      {
        id: "quickstart",
        type: "doc_section",
        label: "包 README quickstart",
        placeholder: "粘贴 quickstart 段落",
        multiline: true,
      },
    ],
    skills: ["skill_upm"],
    artifactIds: ["art_m11"],
    rewards: { xp: 260, gold: 130, skillPoints: 2, reputation: 20, insight: 0 },
    aiPrompt: forgePrompt(
      "M11",
      "UPM 打包",
      "把 Native Boundary Lab 的 runtime/editor 代码整理成 UPM 包：package.json、Runtime/ 与 Editor/ 各配 asmdef、Samples~ 下放 HelloNative 与 AgentSwarmBenchmark 两个样例、native 插件按平台放置、写包 README 与 quickstart；并在一个全新 Unity 工程验证 import。",
    ),
    resources: [
      { label: "Unity — 自定义包", url: "https://docs.unity3d.com/Manual/CustomPackages.html" },
      { label: "Unity — Assembly Definitions", url: "https://docs.unity3d.com/Manual/ScriptCompilationAssemblyDefinitionFiles.html" },
    ],
    commonTraps: ["Samples 直接放在 Runtime 里。", "asmdef 引用关系混乱。", "包 README 假设读者了解你的项目背景。"],
    interviewExplanation: "我能交付面向开发者的 Unity 工具，而不只是场景 demo。",
    nextRisk: "移动端之门的构建链路更长。给自己预留完整的一块时间，不要碎片化推进。",
    unlocks: ["boss_package"],
    estimate: "120–180 分钟",
  },

  // ------------------------------------------------------------
  // BOSS — 面向开发者的包
  // ------------------------------------------------------------
  {
    id: "boss_package",
    code: "BOSS",
    title: "面向开发者的包",
    regionId: "package_harbor",
    type: "boss",
    order: 17,
    narrativeHook: "港务长在放行单上只写一句话：换一台船，还能开吗？",
    objective: "用全新工程验证包的可用性，完成开发者视角的答辩。",
    whyItMatters: "工具的价值由陌生使用者定义。这道门强制你切换到用户视角。",
    prerequisites: ["m11"],
    definitionOfDone: ["M11 完成。", "全新工程 import 验证通过。", "quickstart 能让陌生人 10 分钟跑通。"],
    evidenceRequired: [
      {
        id: "fresh_proof",
        type: "screenshot_note",
        label: "全新工程运行 sample 的截图",
        placeholder: "截图路径",
      },
      {
        id: "quickstart_final",
        type: "doc_section",
        label: "最终版 quickstart 段落",
        placeholder: "粘贴 quickstart",
        multiline: true,
      },
    ],
    skills: [],
    artifactIds: [],
    rewards: { xp: 350, gold: 160, skillPoints: 0, reputation: 30, insight: 1 },
    aiPrompt: forgePrompt(
      "BOSS",
      "面向开发者的包",
      "以'第一次接触本包的 Unity 开发者'身份审查我的 quickstart 与包结构，指出所有会让新用户卡住的地方。",
    ),
    resources: [],
    commonTraps: ["quickstart 里省略'显而易见'的步骤——对新用户没有显而易见。"],
    interviewExplanation: "我交付过通过全新工程验证的 UPM 包，quickstart 面向零上下文用户。",
    nextRisk: "Android 构建的失败往往在链路末端才暴露。记录每一步，失败也是里程碑。",
    unlocks: ["m12"],
    estimate: "30–45 分钟",
  },

  // ------------------------------------------------------------
  // M12 — Android IL2CPP 验证
  // ------------------------------------------------------------
  {
    id: "m12",
    code: "M12",
    title: "Android IL2CPP 验证",
    regionId: "mobile_gate",
    type: "main",
    order: 18,
    narrativeHook: "石门缓缓开启：这是你最熟悉的战场，带着新的武器回来。",
    objective: "构建 Android ARM64 .so，配置插件导入设置，运行 IL2CPP development build。",
    whyItMatters:
      "这一步把边界工程连接回你的移动端老本行——也是最能打动 Unity 移动团队面试官的组合：既懂移动生产，又懂 native 边界。",
    prerequisites: ["boss_package"],
    definitionOfDone: [
      "Android ARM64 原生库已生成或已规划。",
      "插件导入设置已文档化。",
      "IL2CPP development build 已尝试。",
      "成功或失败都被记录。",
      "Android 笔记解释了阻塞点与修复路径。",
    ],
    evidenceRequired: [
      { id: "commit", type: "commit_hash", label: "Commit Hash", placeholder: "例如 a1b2c3d" },
      {
        id: "build_result",
        type: "screenshot_note",
        label: "构建截图或错误日志",
        placeholder: "截图路径或粘贴关键日志",
        multiline: true,
      },
      {
        id: "il2cpp_notes",
        type: "doc_section",
        label: "Android IL2CPP 笔记",
        placeholder: "工具链、ABI 目录、导入设置、坑点",
        multiline: true,
      },
      {
        id: "mobile_reflection",
        type: "text_reflection",
        label: "移动端打包反思",
        placeholder: "与桌面端相比多了哪些约束？",
        multiline: true,
      },
    ],
    skills: ["skill_import_settings"],
    artifactIds: ["art_m12"],
    rewards: { xp: 260, gold: 130, skillPoints: 2, reputation: 15, insight: 0 },
    aiPrompt: forgePrompt(
      "M12",
      "Android IL2CPP 验证",
      "用 NDK/CMake 工具链交叉编译 ARM64 的 libnbl.so；配置 Unity 插件导入设置（Android/ARM64）；运行 IL2CPP development build 并在真机或模拟器验证版本函数调用；无论成败，写下阻塞点与修复路径。",
    ),
    resources: [
      { label: "Unity — Android native 插件", url: "https://docs.unity3d.com/Manual/android-native-plugins-import.html" },
      { label: "Android NDK — CMake", url: "https://developer.android.com/ndk/guides/cmake" },
    ],
    commonTraps: ["ABI 目录放错（arm64-v8a）。", "IL2CPP 与 Mono 行为差异没验证。", "只在 Editor 验证就宣布成功。"],
    interviewExplanation: "我验证了移动端 native 打包，这与我的 Unity 移动端背景直接相连。",
    nextRisk: "主线到此已完整。观测台是可选的甜点——别让甜点变成新的主食。",
    unlocks: ["boss_mobile"],
    estimate: "120–240 分钟",
  },

  // ------------------------------------------------------------
  // BOSS — ARM64 通道
  // ------------------------------------------------------------
  {
    id: "boss_mobile",
    code: "BOSS",
    title: "ARM64 通道",
    regionId: "mobile_gate",
    type: "boss",
    order: 19,
    narrativeHook: "门后是你来时的世界——如今你带着完全不同的眼睛回望它。",
    objective: "完成移动端验证的总结答辩，为 Act I 画上句号。",
    whyItMatters: "Act I 的终点。从这里开始，你的简历上可以写下'Unity/C++ Boundary & Runtime Tooling'。",
    prerequisites: ["m12"],
    definitionOfDone: ["M12 完成。", "IL2CPP 构建结果（成或败）有完整记录。", "能讲清移动端 native 边界的特殊约束。"],
    evidenceRequired: [
      {
        id: "result_note",
        type: "screenshot_note",
        label: "IL2CPP 构建结果记录",
        placeholder: "截图路径或结果描述",
      },
      {
        id: "blocker_path",
        type: "text_reflection",
        label: "阻塞点与修复路径讲解",
        placeholder: "遇到什么，为什么，怎么解（或计划怎么解）",
        multiline: true,
      },
    ],
    skills: [],
    artifactIds: [],
    rewards: { xp: 350, gold: 160, skillPoints: 0, reputation: 30, insight: 2 },
    aiPrompt: forgePrompt(
      "BOSS",
      "ARM64 通道",
      "帮我把 Android IL2CPP 验证的经历整理成一个 STAR 结构的面试故事（情境-任务-行动-结果），突出移动端 native 边界的特殊约束。",
    ),
    resources: [],
    commonTraps: ["把失败的构建藏起来。失败记录 + 修复路径比顺利成功更有面试价值。"],
    interviewExplanation: "我完成了从桌面到 Android IL2CPP 的完整 native 边界验证闭环。",
    nextRisk: "Act II 的确定性内核在迷雾后等你。休整、展示、然后启程。",
    unlocks: ["m13"],
    estimate: "20–30 分钟",
  },

  // ------------------------------------------------------------
  // M13 — 可选：XR 或渲染线程
  // ------------------------------------------------------------
  {
    id: "m13",
    code: "M13",
    title: "可选：XR 或渲染线程",
    regionId: "observatory_annex",
    type: "main",
    order: 20,
    optional: true,
    narrativeHook: "观测台的望远镜并不通向主路——但从这里能看见引擎更深处的风景。",
    objective: "在核心桥梁稳固之后，添加 XR 模拟器位姿诊断或 render-thread 事件示例。",
    whyItMatters:
      "这是一次受控的好奇心释放：探索 engine/XR 相邻扩展点，同时证明你能守住架构边界——它不重写核心，也不取代主线。",
    prerequisites: ["boss_mobile"],
    definitionOfDone: [
      "可选 demo 可运行。",
      "文档解释局限性。",
      "没有重写核心架构。",
      "没有取代主线确定性仿真路径。",
    ],
    evidenceRequired: [
      { id: "commit", type: "commit_hash", label: "Commit Hash", placeholder: "例如 a1b2c3d" },
      { id: "demo_shot", type: "screenshot_note", label: "截图/GIF 路径", placeholder: "路径" },
      {
        id: "limitation",
        type: "text_reflection",
        label: "局限性说明",
        placeholder: "这个 demo 能做什么、不能做什么",
        multiline: true,
      },
      {
        id: "linkedin_opt",
        type: "linkedin_draft",
        label: "可选 LinkedIn 草稿",
        placeholder: "如果值得展示，写 3 句草稿",
        multiline: true,
        optional: true,
      },
    ],
    skills: [],
    artifactIds: ["art_m13"],
    rewards: { xp: 200, gold: 100, skillPoints: 1, reputation: 15, insight: 0 },
    aiPrompt: forgePrompt(
      "M13",
      "可选：XR 或渲染线程",
      "在不改动核心架构的前提下，二选一：A) XR 模拟器位姿诊断 HUD（读取头显/手柄位姿并通过 native 通道记录）；B) GL.IssuePluginEvent / CommandBuffer.IssuePluginEvent 的 render-thread 事件最小示例。先帮我评估哪个与我的目标更相关。",
    ),
    resources: [
      { label: "Unity — 底层 native 插件接口", url: "https://docs.unity3d.com/Manual/NativePluginInterface.html" },
      { label: "Unity — XR", url: "https://docs.unity3d.com/Manual/XR.html" },
    ],
    commonTraps: ["把可选探索变成新的大项目。", "为了 demo 重构核心架构。"],
    interviewExplanation: "我在核心桥梁稳固之后，探索了 engine/XR 相邻的扩展点。",
    nextRisk: "Act I 全部完成。下一幕的入口将在学院公告中开启。",
    unlocks: [],
    estimate: "120–180 分钟",
  },
];

export const QUEST_BY_ID: Record<string, Quest> = Object.fromEntries(QUESTS.map((q) => [q.id, q]));

export const ORDERED_QUESTS: Quest[] = QUESTS.slice().sort((a, b) => a.order - b.order);
