import type { ReviewCard } from "@/types/domain";

/**
 * 复习卡组种子。
 * 卡片在其关联任务完成后进入卡组（学过才复习）；
 * 当前任务的关联卡会作为“热身回顾”出现在任务页（学前检索）。
 */

export const REVIEW_CARDS: ReviewCard[] = [
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
