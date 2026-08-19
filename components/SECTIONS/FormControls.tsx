"use client";

import { forwardRef } from "react";
import { Minus, Plus, Check } from "lucide-react";

/* ------------------------------------------------------------------
 * 타입 스케일 (이 파일에서만 관리)
 *   섹션 제목    text-2xl
 *   섹션 설명    text-[15px]
 *   필드 라벨    text-[15px] semibold
 *   보조 설명    text-[13px]
 *   입력값       text-base  ← 16px 미만이면 iOS 사파리가 화면을 확대함
 * ------------------------------------------------------------------ */

export const inputClass =
  "w-full rounded-lg border border-(--start-card-border) bg-(--start-card-bg) px-4 py-3 text-base text-(--text) " +
  "placeholder:text-(--start-description)/60 outline-none transition-colors " +
  "hover:border-(--start-accent)/40 focus-visible:border-(--start-accent) focus-visible:ring-2 focus-visible:ring-(--start-accent)/20";

export function Field({ label, hint, required, children,}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-center gap-1.5 text-[15px] font-semibold text-(--start-title)">
        {label}
        {required && <span className="text-(--start-accent)">*</span>}
      </span>
      {hint && (
        <span className="mt-1.5 block text-[13px] leading-relaxed text-(--start-description)">
          {hint}
        </span>
      )}
      <div className="mt-2.5">{children}</div>
    </label>
  );
}

export const TextInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function TextInput(props, ref) {
    return <input ref={ref} {...props} className={inputClass} />;
  }
);

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputClass} min-h-32 resize-y leading-relaxed`} />;
}

export function Select({ value, onChange, options, placeholder, }: {
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  placeholder: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputClass} cursor-pointer appearance-none`}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

export function Stepper({ label, value, onChange, }: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-(--start-card-border) bg-(--start-card-bg) px-4 py-2.5">
      <span className="text-sm text-(--start-description)">{label}</span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label={`${label} 줄이기`}
          disabled={value === 0}
          onClick={() => onChange(Math.max(0, value - 1))}
          className="grid size-7 place-items-center rounded-md text-(--start-icon) transition-colors hover:bg-(--start-card-hover) hover:text-(--start-accent) disabled:opacity-30"
        >
          <Minus size={15} />
        </button>
        <input
          type="number"
          min={0}
          value={value}
          aria-label={label}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
          className="w-10 bg-transparent text-center text-base font-semibold tabular-nums text-(--text) outline-none [appearance:textfield] focus-visible:text-(--start-accent) [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button
          type="button"
          aria-label={`${label} 늘리기`}
          onClick={() => onChange(value + 1)}
          className="grid size-7 place-items-center rounded-md text-(--start-icon) transition-colors hover:bg-(--start-card-hover) hover:text-(--start-accent)"
        >
          <Plus size={15} />
        </button>
      </div>
    </div>
  );
}

export function Chip({ active, onClick, children, }: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
        active
          ? "border-(--start-accent) bg-(--start-accent)/10 text-(--start-accent)"
          : "border-(--start-card-border) text-(--start-description) hover:border-(--start-accent)/40 hover:text-(--start-title)"
      }`}
    >
      {children}
    </button>
  );
}

export function Checkbox({ checked, onChange, label, hint, }: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`flex w-full items-start gap-3 rounded-xl border px-5 py-4 text-left transition-all ${
        checked
          ? "border-(--start-accent) bg-(--start-accent)/5"
          : "border-(--start-card-border) hover:border-(--start-accent)/40"
      }`}
    >
      <span
        className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border transition-colors ${
          checked
            ? "border-(--start-accent) bg-(--start-accent) text-(--bg)"
            : "border-(--start-card-border)"
        }`}
      >
        {checked && <Check size={13} strokeWidth={3} />}
      </span>
      <span>
        <span className="block text-[15px] font-semibold text-(--start-title)">{label}</span>
        {hint && (
          <span className="mt-1 block text-[13px] leading-relaxed text-(--start-description)">
            {hint}
          </span>
        )}
      </span>
    </button>
  );
}

export function SectionHead({ title, description, }: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-9">
      <h2 className="text-2xl font-semibold tracking-tight text-(--start-title)">{title}</h2>
      <p className="mt-2.5 max-w-xl text-[15px] leading-relaxed text-(--start-description)">
        {description}
      </p>
    </div>
  );
}

export function EmptyState({ message, action, onAction, }: {
  message: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <div className="rounded-xl border border-dashed border-(--start-card-border) px-6 py-14 text-center">
      <p className="mx-auto max-w-sm text-[15px] leading-relaxed text-(--start-description)">
        {message}
      </p>
      <button
        type="button"
        onClick={onAction}
        className="mt-5 inline-flex items-center gap-1.5 text-[15px] font-semibold text-(--start-accent) hover:underline"
      >
        <Plus size={16} />
        {action}
      </button>
    </div>
  );
}

export function AddButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-(--start-card-border) px-5 py-3 text-sm font-semibold text-(--start-description) transition-colors hover:border-(--start-accent) hover:text-(--start-accent)"
    >
      <Plus size={15} />
      {children}
    </button>
  );
}