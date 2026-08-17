"use client";

import { motion } from "framer-motion";
import { ArrowLeft, CalendarCheck, Check, Loader2, Sparkles, Trophy, User, } from "lucide-react";
import type { SectionKey } from "@/types/profile";

export const SECTIONS: {
  key: SectionKey;
  label: string;
  icon: typeof User;
  hint: string;
}[] = [
  { key: "basic", label: "기본 정보", icon: User, hint: "학과 · 성적 · 진로" },
  { key: "attendance", label: "출결", icon: CalendarCheck, hint: "학년별 기록" },
  { key: "activity", label: "활동", icon: Trophy, hint: "수상 · MDP · 프로젝트" },
];

export function ProfileHeader({ savedAt, doneCount, onBack, }: {
  savedAt: Date | null;
  doneCount: number;
  onBack: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-(--start-card-border) bg-(--bg)/85 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-4">
        <button
          type="button"
          onClick={onBack}
          aria-label="시작 화면으로"
          className="grid size-9 place-items-center rounded-lg text-(--start-icon) transition-colors hover:bg-(--start-card-hover) hover:text-(--start-accent)"
        >
          <ArrowLeft size={19} />
        </button>
        <div className="flex-1">
          <h1 className="text-[15px] font-semibold text-(--start-title)">내 정보</h1>
          <p className="text-[13px] text-(--start-description)">
            {savedAt
              ? `${savedAt.getHours()}:${String(savedAt.getMinutes()).padStart(2, "0")}에 저장됨`
              : "여기에 입력한 내용만 AI가 참고합니다"}
          </p>
        </div>
        <span className="text-sm font-semibold tabular-nums text-(--start-description)">
          {doneCount}/{SECTIONS.length}
        </span>
      </div>
    </header>
  );
}

export function ProfileNav({ current, done, needed, onSelect, }: {
  current: SectionKey;
  done: Record<SectionKey, boolean>;
  needed: string[];
  onSelect: (k: SectionKey) => void;
}) {
  return (
    <nav className="lg:sticky lg:top-24 lg:h-fit lg:w-60 lg:shrink-0">
      <ul className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          const active = current === s.key;
          const complete = done[s.key];
          const required = needed.includes(s.key);

          return (
            <li key={s.key} className="shrink-0 lg:shrink">
              <button
                type="button"
                onClick={() => onSelect(s.key)}
                className={`group flex w-full items-center gap-3 rounded-lg border px-4 py-3.5 text-left transition-all ${
                  active
                    ? "border-(--start-accent) bg-(--start-card-hover)"
                    : "border-transparent hover:bg-(--start-card-hover)"
                }`}
              >
                <span
                  className={`grid size-7 shrink-0 place-items-center rounded-full border transition-colors ${
                    complete
                      ? "border-(--start-accent) bg-(--start-accent)/10 text-(--start-accent)"
                      : "border-(--start-card-border) text-(--start-icon)"
                  }`}
                >
                  {complete ? <Check size={14} strokeWidth={3} /> : <Icon size={14} />}
                </span>
                <span className="min-w-0">
                  <span
                    className={`block text-sm font-semibold ${
                      active ? "text-(--start-accent)" : "text-(--start-title)"
                    }`}
                  >
                    {s.label}
                    {required && !complete && (
                      <span className="ml-1.5 text-(--start-accent)">•</span>
                    )}
                  </span>
                  <span className="hidden truncate text-[13px] text-(--start-description) lg:block">
                    {s.hint}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <p className="mt-6 hidden border-t border-(--start-card-border) pt-6 text-[13px] leading-relaxed text-(--start-description) lg:block">
        비워둔 항목은 AI가 추측하지 않습니다.
      </p>
    </nav>
  );
}

export function ReturnNotice({ from }: { from: string }) {
  const message =
    from === "write"
      ? "자소서를 쓰기 전에 아래 항목을 채워 주세요. "
      : from === "interview"
        ? "면접 예상 질문을 만들기 전에 아래 항목이 필요합니다. "
        : "첨삭 정확도를 높이려면 아래 항목을 채워 주세요. ";

  return (
    <div className="mx-auto mt-6 max-w-5xl px-6">
      <div className="flex items-start gap-3 rounded-xl border border-(--start-accent)/30 bg-(--start-accent)/5 px-5 py-4">
        <Sparkles size={17} className="mt-0.5 shrink-0 text-(--start-accent)" />
        <p className="text-[15px] leading-relaxed text-(--start-title)">
          {message}
          <span className="text-(--start-description)">
            채운 뒤 하단 버튼으로 돌아갈 수 있어요.
          </span>
        </p>
      </div>
    </div>
  );
}

export function SaveBar({ dirty, saving, showReturn, reduce, onSave, onReturn, }: {
  dirty: boolean;
  saving: boolean;
  showReturn: boolean;
  reduce: boolean | null;
  onSave: () => void;
  onReturn: () => void;
}) {
  return (
    <motion.div
      initial={reduce ? undefined : { y: 90 }}
      animate={reduce ? undefined : { y: 0 }}
      exit={reduce ? undefined : { y: 90 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-(--start-card-border) bg-(--bg)/90 backdrop-blur"
    >
      <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-4">
        <p className="flex-1 text-[13px] text-(--start-description)">
          {dirty ? "저장하지 않은 변경이 있습니다" : "변경 내용이 모두 저장되었습니다"}
        </p>

        {!dirty && showReturn && (
          <button
            type="button"
            onClick={onReturn}
            className="text-sm font-semibold text-(--start-description) transition-colors hover:text-(--start-accent)"
          >
            이어서 시작하기
          </button>
        )}

        <button
          type="button"
          onClick={onSave}
          disabled={saving || !dirty}
          className="inline-flex items-center gap-2 rounded-lg bg-(--start-accent) px-6 py-3 text-sm font-semibold text-(--bg) transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {saving && <Loader2 size={15} className="animate-spin" />}
          {saving ? "저장 중" : "변경 사항 저장"}
        </button>
      </div>
    </motion.div>
  );
}