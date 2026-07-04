import type { ChangeEvent } from "react";

/** 证据表单字段：label + input/textarea + 校验状态。 */
export function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
  optional = false,
  valid = true,
  hint,
  disabled = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  optional?: boolean;
  valid?: boolean;
  hint?: string;
  disabled?: boolean;
}) {
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value);
  const base = `w-full rounded-xl border bg-white/70 px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint/70 transition-colors focus:border-ember focus:bg-white disabled:bg-cream-200/50 disabled:text-ink-faint ${
    valid ? "border-wood-light/40" : "border-ember/60"
  }`;
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="flex items-center gap-2 text-sm font-medium text-ink">
        {label}
        {optional && <span className="text-xs font-normal text-ink-faint">（可选）</span>}
      </label>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          rows={3}
          disabled={disabled}
          className={`${base} resize-y min-h-[72px] scrollbar-thin`}
        />
      ) : (
        <input id={id} value={value} onChange={handleChange} placeholder={placeholder} disabled={disabled} className={base} />
      )}
      {hint && <p className="text-xs text-ink-faint">{hint}</p>}
    </div>
  );
}
