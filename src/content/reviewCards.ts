import type { ReviewCard } from "@/types/domain";

/**
 * 复习卡组种子。
 * 卡片在其关联任务完成后进入卡组（学过才复习）；
 * 当前任务的关联卡会作为“热身回顾”出现在任务页（学前检索）。
 */

export const REVIEW_CARDS: ReviewCard[] = [
  // ---- R0 ----
  {
    id: "card_r0_project",
    prompt: "当前的主线项目是什么？它的核心命题（thesis）是？",
    answer:
      "Unity Native Boundary Lab。命题：native C++ 不自动等于更快——边界设计、批处理、内存布局、生命周期与诊断决定 interop 是助力还是拖累。",
    questId: "q_r0",
    skillId: "skill_career_north_star",
    difficulty: 1,
  },
  {
    id: "card_r0_rule",
    prompt: "『No artifact, no mastery XP（无证据，无精通）』是什么意思？",
    answer:
      "看视频、读文章只能算热身；真正的技能进度只来自可验证的产物——代码提交、文档、截图、基准输出、答辩文本。做不出证据，就还不算掌握。",
    questId: "q_r0",
    skillId: "skill_evidence_progression",
    difficulty: 1,
  },
  // ---- M1 ----
  {
    id: "card_export_macro",
    prompt: "导出宏（export macro）做了什么？为什么需要它？",
    answer:
      "它按平台展开为 __declspec(dllexport)（Windows）或 __attribute__((visibility(\"default\")))（Linux/macOS），把符号标记为对外可见。没有它，符号不会出现在动态库的导出表里，DllImport 找不到函数。",
    questId: "m1",
    skillId: "skill_symbol_export",
    difficulty: 2,
  },
  {
    id: "card_build_outside",
    prompt: "为什么要先在 Unity 之外独立构建并验证 native 库？",
    answer:
      "把『构建问题』与『加载问题』分离：先用 CMake + 冒烟测试（dumpbin/nm 验证符号）确认二进制本身正确，Unity 侧再出问题就只剩加载与声明两类原因，排查空间减半。",
    questId: "m1",
    skillId: "skill_cmake",
    difficulty: 1,
  },
  {
    id: "card_debug_release",
    prompt: "Debug 与 Release 构建的区别？基准测试应该用哪个？",
    answer:
      "Debug 保留符号、关闭优化、带运行时检查，适合排错；Release 开启优化（O2 等）代表真实性能。冒烟验证可用 Debug，任何性能结论必须来自 Release。",
    questId: "m1",
    skillId: "skill_compilation",
    difficulty: 1,
  },
  {
    id: "card_extern_c",
    prompt: "为什么要在 managed/native 边界使用 extern \"C\"？",
    answer: "避免 C++ name mangling，暴露稳定的 C ABI 符号，让 C# DllImport 能够发现它们。",
    questId: "m2",
    skillId: "skill_extern_c",
    difficulty: 1,
  },
  {
    id: "card_no_cpp_abi",
    prompt: "为什么 C++ 类不应该跨越 ABI 边界？",
    answer:
      "C++ ABI 是编译器/平台特定的。应把 C++ 类保留在内部，对外暴露 POD 结构体、opaque handle 和 C 兼容函数。",
    questId: "m3",
    skillId: "skill_opaque_handle",
    difficulty: 2,
  },
  {
    id: "card_per_agent",
    prompt: "为什么 per-agent P/Invoke 是反模式？",
    answer:
      "它让每个 agent 都穿越一次 managed/native 边界，把转换开销乘以 N，常常抹掉任何 native 性能优势。",
    questId: "m6",
    skillId: "skill_tradeoff",
    difficulty: 1,
  },
  {
    id: "card_blittable",
    prompt: "什么样的 struct 是 blittable 的？",
    answer: "只包含在 managed/unmanaged 内存中二进制表示相同的字段，且不含任何托管引用。",
    questId: "m4",
    skillId: "skill_blittable",
    difficulty: 1,
  },
  {
    id: "card_burst_baseline",
    prompt: "为什么 Burst 基线是必要的？",
    answer: "为了避免天真的『C++ 更快』结论，让 native 代码与 Unity 自己的高性能 C# 路径公平对比。",
    questId: "m8",
    skillId: "skill_burst",
    difficulty: 1,
  },
  {
    id: "card_median_p95",
    prompt: "为什么 benchmark 应该报告 median 和 p95？",
    answer: "避免只挑最好的帧数据，同时展示典型性能（median）与尾部性能（p95）。",
    questId: "m7",
    skillId: "skill_bench_method",
    difficulty: 1,
  },
  {
    id: "card_idisposable",
    prompt: "为什么 native 资源的 C# 封装要实现 IDisposable？",
    answer:
      "GC 不了解 native 资源的成本与时机。IDisposable 提供确定性释放，配合 using 保证异常路径也能清理。",
    questId: "m3",
    skillId: "skill_idisposable",
    difficulty: 2,
  },
  {
    id: "card_double_dispose",
    prompt: "为什么 Dispose 必须幂等（可安全调用多次）？",
    answer:
      "调用方无法保证 Dispose 只被调用一次（using 嵌套、手动调用、终结器）。二次释放 native 句柄可能导致崩溃或未定义行为。",
    questId: "m3",
    skillId: "skill_raii",
    difficulty: 2,
  },
  {
    id: "card_entrypoint",
    prompt: "EntryPointNotFoundException 最常见的原因是什么？",
    answer:
      "native 侧缺少 extern \"C\"（符号被 mangle）、函数名拼写不一致、库文件或架构不匹配导致符号不可见。",
    questId: "m2",
    skillId: "skill_dllimport",
    difficulty: 1,
  },
  {
    id: "card_pinvoke",
    prompt: "什么是 P/Invoke？",
    answer:
      "Platform Invocation Services：.NET 运行时提供的机制，让 managed 代码通过 DllImport 声明调用动态库里导出的 unmanaged 函数，运行时负责查找符号、封送参数与切换调用栈。",
    questId: "m2",
    skillId: "skill_dllimport",
    difficulty: 1,
  },
  {
    id: "card_dllnotfound",
    prompt: "DllNotFoundException 最常见的原因是什么？",
    answer:
      "Unity 找不到或加载不了库文件：文件名/扩展名不对（lib 前缀）、不在插件搜索路径、架构不匹配（x64 vs ARM64）、平台导入设置未启用，或库自身的依赖缺失。",
    questId: "m2",
    skillId: "skill_plugin_loading",
    difficulty: 1,
  },
  {
    id: "card_centralize",
    prompt: "为什么 DllImport 声明应集中在一个 wrapper 类，而不是散落在 MonoBehaviour 里？",
    answer:
      "边界应该是一个可审计的窄面：集中声明便于统一签名规范、错误处理与替换实现；散落声明会让边界失控，签名不一致的 bug 难以定位。",
    questId: "m2",
    skillId: "skill_dllimport",
    difficulty: 2,
  },
  {
    id: "card_gc_native",
    prompt: "为什么 C# GC 不会自动释放 native memory？",
    answer:
      "GC 只跟踪 managed 堆上的对象；native 侧 malloc/new 出来的内存对它不可见。native 资源必须通过显式 destroy API 或 IDisposable 模式释放，不能指望终结器时序。",
    questId: "m3",
    skillId: "skill_idisposable",
    difficulty: 2,
  },
  // ---- 生产经验营地 ----
  {
    id: "card_b2_mainthread",
    prompt: "Unity 的主线程规则是什么？",
    answer:
      "绝大多数 UnityEngine API（GameObject、Transform、组件访问等）只能在主线程调用；后台线程只能做纯计算，结果必须回到主线程再触碰引擎对象。",
    questId: "b2",
    skillId: "skill_unity_runtime_model",
    difficulty: 1,
  },
  {
    id: "card_b4_boxing",
    prompt: "什么是 boxing？为什么热路径要避免它？",
    answer:
      "值类型转成 object / 接口时被装进新的堆对象。每次装箱都是一次堆分配 + 未来的 GC 压力；在每帧执行的热路径里会累积成卡顿。",
    questId: "b4",
    skillId: "skill_hot_path",
    difficulty: 1,
  },
  {
    id: "card_b5_split",
    prompt: "为什么确定性仿真核心不应该住在 MonoBehaviour 里？",
    answer:
      "MonoBehaviour 与帧率、引擎生命周期和平台耦合：Update 节拍不固定、难以 headless 测试、状态散落在场景里。确定性内核需要固定步长、纯数据状态与可重放输入，Unity 应只做呈现层。",
    questId: "b5",
    skillId: "skill_sim_split",
    difficulty: 2,
  },
  {
    id: "card_seed_warmup",
    prompt: "benchmark 为什么要固定 seed 并排除 warmup 帧？",
    answer:
      "固定 seed 保证各模式处理相同输入，可对比；排除 warmup 剔除 JIT/缓存预热等一次性成本，测量稳态性能。",
    questId: "m7",
    skillId: "skill_benchmarking",
    difficulty: 2,
  },
  {
    id: "card_pack1",
    prompt: "为什么 Pack=1 不是免费的优化？",
    answer:
      "紧凑布局可能导致未对齐访问，在部分平台上更慢甚至非法。对齐是 CPU 访问效率的契约，压缩尺寸要以测量为依据。",
    questId: "m9",
    skillId: "skill_memory_layout",
    difficulty: 3,
  },
  {
    id: "card_batching",
    prompt: "批处理为什么能降低边界成本？",
    answer:
      "每次 P/Invoke 穿越有固定开销（封送、栈切换、安全检查）。批处理把 N 次穿越合并为 1 次，让固定开销被 N 个实体摊薄。",
    questId: "m5",
    skillId: "skill_hot_path",
    difficulty: 1,
  },
  {
    id: "card_result_code",
    prompt: "跨 ABI 的错误处理为什么用 ResultCode 而不是异常？",
    answer:
      "C++ 异常机制是编译器特定的，跨 ABI 抛出是未定义行为。返回码 + LastError 查询是稳定且可预测的失败通道。",
    questId: "m10",
    skillId: "skill_result_code",
    difficulty: 2,
  },
  {
    id: "card_borrowed_ptr",
    prompt: "native 侧借用 Unity 传入的指针时，最重要的规则是什么？",
    answer:
      "不得在调用结束后保留（retain）借来的指针。托管内存可能被 GC 移动或释放，越界持有会导致悬垂指针。",
    questId: "m9",
    skillId: "skill_unsafe_ptr",
    difficulty: 3,
  },
];

export const CARD_BY_ID: Record<string, ReviewCard> = Object.fromEntries(REVIEW_CARDS.map((c) => [c.id, c]));
