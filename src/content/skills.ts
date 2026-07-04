import type { SkillNode, SkillTree } from "@/types/domain";

/**
 * 六棵技能树。
 * 规则：技能解锁必须基于证据 —— sourceQuestIds 中任一任务完成后，节点变为“证据就绪”，
 * 再花费技能点正式点亮。sourceQuestIds 为空 = 未来篇章内容（迷雾）。
 */

export const SKILL_TREES: SkillTree[] = [
  { id: "tree_cpp", name: "C++ 运行时", nameEn: "C++ Runtime", order: 1, accent: "ember" },
  { id: "tree_interop", name: "Unity 互操作", nameEn: "Unity Interop", order: 2, accent: "skyblue" },
  { id: "tree_csharp", name: "C# 运行时 / 性能", nameEn: "C# Runtime / Performance", order: 3, accent: "moss" },
  { id: "tree_foundation", name: "CS 系统基础", nameEn: "CS Systems Foundation", order: 4, accent: "wood" },
  { id: "tree_determinism", name: "确定性仿真", nameEn: "Deterministic Simulation", order: 5, accent: "plum" },
  { id: "tree_interview", name: "面试 / 表达", nameEn: "Interview / Communication", order: 6, accent: "stone" },
];

export const SKILL_NODES: SkillNode[] = [
  // ---- A. C++ Runtime ----
  { id: "skill_cmake", treeId: "tree_cpp", name: "CMake Basics", description: "用 CMake 描述并构建 native 工程。", sourceQuestIds: ["m1"], cost: 1, tier: 1 },
  { id: "skill_header_source", treeId: "tree_cpp", name: "Header/Source Organization", description: "头文件与实现分离的边界纪律。", sourceQuestIds: ["m1"], cost: 1, tier: 1 },
  { id: "skill_symbol_export", treeId: "tree_cpp", name: "Symbol Export", description: "导出宏与符号可见性控制。", sourceQuestIds: ["m1"], cost: 1, tier: 2 },
  { id: "skill_extern_c", treeId: "tree_cpp", name: "extern \"C\"", description: "关闭 name mangling，暴露稳定 C 符号。", sourceQuestIds: ["m2"], cost: 1, tier: 2 },
  { id: "skill_c_abi", treeId: "tree_cpp", name: "C ABI", description: "跨编译器/语言的二进制契约。", sourceQuestIds: ["m1", "m2"], cost: 1, tier: 2 },
  { id: "skill_opaque_handle", treeId: "tree_cpp", name: "Opaque Handle", description: "以不透明指针隐藏实现、稳定边界。", sourceQuestIds: ["m3"], cost: 1, tier: 3 },
  { id: "skill_raii", treeId: "tree_cpp", name: "RAII", description: "资源生命周期绑定作用域。", sourceQuestIds: ["m3"], cost: 1, tier: 3 },
  { id: "skill_unique_ptr", treeId: "tree_cpp", name: "std::unique_ptr", description: "独占所有权的标准表达。", sourceQuestIds: ["m3"], cost: 1, tier: 3 },
  { id: "skill_span", treeId: "tree_cpp", name: "std::span 内部使用", description: "native 内部安全地借用连续内存。", sourceQuestIds: ["m5"], cost: 1, tier: 4 },
  { id: "skill_result_code", treeId: "tree_cpp", name: "ResultCode", description: "以返回码表达可恢复失败。", sourceQuestIds: ["m10"], cost: 1, tier: 4 },
  { id: "skill_no_exceptions", treeId: "tree_cpp", name: "No Exceptions Across ABI", description: "异常止步于边界之内。", sourceQuestIds: ["m10"], cost: 1, tier: 4 },

  // ---- B. Unity Interop ----
  { id: "skill_plugin_loading", treeId: "tree_interop", name: "Native Plugin Loading", description: "Unity 如何定位并加载原生插件。", sourceQuestIds: ["m2"], cost: 1, tier: 1 },
  { id: "skill_dllimport", treeId: "tree_interop", name: "DllImport", description: "P/Invoke 声明与封送基础。", sourceQuestIds: ["m2"], cost: 1, tier: 1 },
  { id: "skill_import_settings", treeId: "tree_interop", name: "Plugin Import Settings", description: "平台/架构级插件导入配置。", sourceQuestIds: ["m2", "m12"], cost: 1, tier: 2 },
  { id: "skill_intptr", treeId: "tree_interop", name: "IntPtr Boundary", description: "句柄在 managed 侧的安全持有。", sourceQuestIds: ["m3"], cost: 1, tier: 2 },
  { id: "skill_idisposable", treeId: "tree_interop", name: "IDisposable Wrapper", description: "确定性释放 native 资源。", sourceQuestIds: ["m3"], cost: 1, tier: 2 },
  { id: "skill_nativearray", treeId: "tree_interop", name: "NativeArray Boundary", description: "零拷贝批量数据传递。", sourceQuestIds: ["m5"], cost: 1, tier: 3 },
  { id: "skill_hud", treeId: "tree_interop", name: "Runtime HUD", description: "运行时可视化诊断面板。", sourceQuestIds: ["m7"], cost: 1, tier: 3 },
  { id: "skill_editor_diag", treeId: "tree_interop", name: "Editor Diagnostics", description: "Editor 侧诊断与日志通道。", sourceQuestIds: ["m10"], cost: 1, tier: 4 },
  { id: "skill_upm", treeId: "tree_interop", name: "UPM Package", description: "可分发的 Unity 包工程。", sourceQuestIds: ["m11"], cost: 1, tier: 4 },

  // ---- C. C# Runtime / Performance ----
  { id: "skill_value_ref", treeId: "tree_csharp", name: "Value vs Reference", description: "值类型/引用类型的内存语义。", sourceQuestIds: ["m4"], cost: 1, tier: 1 },
  { id: "skill_blittable", treeId: "tree_csharp", name: "Blittable Types", description: "两侧位模式一致的可直传类型。", sourceQuestIds: ["m4"], cost: 1, tier: 1 },
  { id: "skill_structlayout", treeId: "tree_csharp", name: "StructLayout", description: "显式控制托管结构布局。", sourceQuestIds: ["m4"], cost: 1, tier: 2 },
  { id: "skill_gc_alloc", treeId: "tree_csharp", name: "GC Allocation", description: "识别与测量托管堆分配。", sourceQuestIds: ["m7"], cost: 1, tier: 2 },
  { id: "skill_hot_path", treeId: "tree_csharp", name: "Hot Path Rules", description: "热路径上的分配与调用纪律。", sourceQuestIds: ["m5"], cost: 1, tier: 3 },
  { id: "skill_benchmarking", treeId: "tree_csharp", name: "Benchmarking", description: "固定 seed、warmup、统计口径。", sourceQuestIds: ["m7"], cost: 1, tier: 3 },
  { id: "skill_burst", treeId: "tree_csharp", name: "Jobs/Burst Baseline", description: "Unity 高性能路径作为公平基线。", sourceQuestIds: ["m8"], cost: 1, tier: 4 },
  { id: "skill_unsafe_ptr", treeId: "tree_csharp", name: "Unsafe Pointer Contract", description: "受约束的指针路径与借用规则。", sourceQuestIds: ["m9"], cost: 1, tier: 4 },

  // ---- D. CS Systems Foundation ----
  { id: "skill_compilation", treeId: "tree_foundation", name: "Compilation", description: "从源码到目标文件。", sourceQuestIds: ["m1"], cost: 1, tier: 1 },
  { id: "skill_linking", treeId: "tree_foundation", name: "Linking", description: "符号解析与库链接。", sourceQuestIds: ["m1"], cost: 1, tier: 1 },
  { id: "skill_dynlib", treeId: "tree_foundation", name: "Dynamic Library", description: "动态库的加载与符号查找。", sourceQuestIds: ["m2"], cost: 1, tier: 2 },
  { id: "skill_stack_heap", treeId: "tree_foundation", name: "Stack vs Heap", description: "两种内存区域的语义与代价。", sourceQuestIds: ["m4"], cost: 1, tier: 2 },
  { id: "skill_memory_layout", treeId: "tree_foundation", name: "Memory Layout", description: "对齐、padding 与布局策略。", sourceQuestIds: ["m9"], cost: 1, tier: 3 },
  { id: "skill_abi", treeId: "tree_foundation", name: "ABI", description: "应用二进制接口的本质。", sourceQuestIds: ["m2", "m4"], cost: 1, tier: 3 },
  { id: "skill_process", treeId: "tree_foundation", name: "Process Basics", description: "进程、崩溃与隔离边界。", sourceQuestIds: ["m10"], cost: 1, tier: 4 },
  { id: "skill_thread", treeId: "tree_foundation", name: "Thread Basics", description: "线程与并行执行基础。", sourceQuestIds: ["m8"], cost: 1, tier: 4 },
  { id: "skill_profiling", treeId: "tree_foundation", name: "Profiling", description: "用工具而非直觉定位成本。", sourceQuestIds: ["m7"], cost: 1, tier: 4 },

  // ---- E. Deterministic Simulation（Act II 迷雾） ----
  { id: "skill_fixed_timestep", treeId: "tree_determinism", name: "Fixed Timestep", description: "固定节拍是确定性的前提。", sourceQuestIds: [], cost: 1, tier: 1 },
  { id: "skill_input_log", treeId: "tree_determinism", name: "Input Log", description: "把所有输入写成可回放的日志。", sourceQuestIds: [], cost: 1, tier: 1 },
  { id: "skill_state_hash", treeId: "tree_determinism", name: "State Hash", description: "为每帧状态生成指纹。", sourceQuestIds: [], cost: 1, tier: 2 },
  { id: "skill_snapshot", treeId: "tree_determinism", name: "Snapshot", description: "状态的完整封存与恢复。", sourceQuestIds: [], cost: 1, tier: 2 },
  { id: "skill_replay", treeId: "tree_determinism", name: "Replay", description: "同输入必得同历史。", sourceQuestIds: [], cost: 1, tier: 3 },
  { id: "skill_event_ordering", treeId: "tree_determinism", name: "Event Ordering", description: "事件顺序的确定性保证。", sourceQuestIds: [], cost: 1, tier: 3 },
  { id: "skill_float_caveats", treeId: "tree_determinism", name: "Floating Point Caveats", description: "浮点不确定性的陷阱与对策。", sourceQuestIds: [], cost: 1, tier: 4 },
  { id: "skill_validation_harness", treeId: "tree_determinism", name: "Validation Harness", description: "自动验证确定性的测试装置。", sourceQuestIds: [], cost: 1, tier: 4 },

  // ---- F. Interview / Communication ----
  { id: "skill_arch_explain", treeId: "tree_interview", name: "Architecture Explanation", description: "把架构讲成清晰的故事。", sourceQuestIds: ["m3"], cost: 1, tier: 1 },
  { id: "skill_tradeoff", treeId: "tree_interview", name: "Trade-off Explanation", description: "用正反证据表达取舍。", sourceQuestIds: ["m6"], cost: 1, tier: 1 },
  { id: "skill_bench_method", treeId: "tree_interview", name: "Benchmark Methodology", description: "为你的数字辩护。", sourceQuestIds: ["m7"], cost: 1, tier: 2 },
  { id: "skill_failure_explain", treeId: "tree_interview", name: "Failure Mode Explanation", description: "把失败讲成设计。", sourceQuestIds: ["m10"], cost: 1, tier: 2 },
  { id: "skill_resume_bullet", treeId: "tree_interview", name: "Resume Bullet", description: "一行简历句承载一个证据。", sourceQuestIds: ["boss_benchmark"], cost: 1, tier: 3 },
  { id: "skill_linkedin", treeId: "tree_interview", name: "LinkedIn Post", description: "面向同行的公开表达。", sourceQuestIds: ["m7"], cost: 1, tier: 3 },
  { id: "skill_blog", treeId: "tree_interview", name: "Blog Post", description: "长文沉淀技术叙事。", sourceQuestIds: ["m9"], cost: 1, tier: 4 },
  { id: "skill_interview_defense", treeId: "tree_interview", name: "Interview Defense", description: "在追问下守住你的设计。", sourceQuestIds: ["boss_bridge"], cost: 1, tier: 4 },
];

export const SKILL_BY_ID: Record<string, SkillNode> = Object.fromEntries(SKILL_NODES.map((s) => [s.id, s]));

export const SKILLS_BY_TREE: Record<string, SkillNode[]> = SKILL_TREES.reduce(
  (acc, tree) => {
    acc[tree.id] = SKILL_NODES.filter((n) => n.treeId === tree.id).sort((a, b) => a.tier - b.tier);
    return acc;
  },
  {} as Record<string, SkillNode[]>,
);
