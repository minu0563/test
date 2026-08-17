"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import {
  ACTIVITY_FIELDS_BY_TYPE,
  ACTIVITY_TYPES,
  isNewId,
  normalizeActivity,
} from "@/lib/profile-constants";
import type { Activity, ActivityType } from "@/types/profile";
import { Chip, Field, TextArea, TextInput } from "./FormControls";

export default function ActivitySheet({ value, isNew, onClose, onSubmit, onDelete, }: {
  value: Activity;
  isNew: boolean;
  onClose: () => void;
  onSubmit: (a: Activity) => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState<Activity>(value);
  const reduce = useReducedMotion();
  const firstRef = useRef<HTMLInputElement>(null);

  const cfg = ACTIVITY_FIELDS_BY_TYPE[draft.type];

  useEffect(() => {
    firstRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const set = <K extends keyof Activity>(k: K, v: Activity[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const changeType = (type: ActivityType) =>
    setDraft((d) => normalizeActivity(d, type));

  const canSubmit =
    draft.title.trim() !== "" && (!cfg.content.required || draft.content.trim() !== "");

  const twoUp = Boolean(cfg.organization && cfg.award);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={isNew ? "활동 추가" : "활동 편집"}
        initial={reduce ? undefined : { x: "100%" }}
        animate={reduce ? undefined : { x: 0 }}
        exit={reduce ? undefined : { x: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 34 }}
        className="relative flex h-full w-full max-w-xl flex-col border-l border-(--start-card-border) bg-(--bg)"
      >
        <div className="flex items-center gap-3 border-b border-(--start-card-border) px-6 py-5">
          <h2 className="flex-1 text-base font-semibold text-(--start-title)">
            {isNew ? "활동 추가" : "활동 편집"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="grid size-9 place-items-center rounded-lg text-(--start-icon) transition-colors hover:bg-(--start-card-hover)"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-7 overflow-y-auto px-6 py-7">
          <Field label="종류">
            <div className="flex flex-wrap gap-2">
              {ACTIVITY_TYPES.map((t) => (
                <Chip
                  key={t.key}
                  active={draft.type === t.key}
                  onClick={() => changeType(t.key)}
                >
                  {t.label}
                </Chip>
              ))}
            </div>
          </Field>

          <Field label={cfg.title.label} hint={cfg.title.hint} required>
            <TextInput
              ref={firstRef}
              value={draft.title}
              placeholder={cfg.title.placeholder}
              onChange={(e) => set("title", e.target.value)}
            />
          </Field>

          {/* 주최 · 소속 / 수상 내역 */}
          {(cfg.organization || cfg.award) && (
            <div className={`grid gap-6 ${twoUp ? "sm:grid-cols-2" : ""}`}>
              {cfg.organization && (
                <Field label={cfg.organization.label} hint={cfg.organization.hint}>
                  <TextInput
                    value={draft.organization}
                    placeholder={cfg.organization.placeholder}
                    onChange={(e) => set("organization", e.target.value)}
                  />
                </Field>
              )}
              {cfg.award && (
                <Field label={cfg.award.label} hint={cfg.award.hint}>
                  <TextInput
                    value={draft.award}
                    placeholder={cfg.award.placeholder}
                    onChange={(e) => set("award", e.target.value)}
                  />
                </Field>
              )}
            </div>
          )}

          {/* 날짜 */}
          {cfg.dateMode === "single" && (
            <Field label={cfg.singleDateLabel ?? "날짜"}>
              <TextInput
                type="date"
                value={draft.startDate}
                onChange={(e) => set("startDate", e.target.value)}
              />
            </Field>
          )}

          {cfg.dateMode === "range" && (
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="시작일">
                <TextInput
                  type="date"
                  value={draft.startDate}
                  onChange={(e) => set("startDate", e.target.value)}
                />
              </Field>
              <Field label="종료일">
                <TextInput
                  type="date"
                  value={draft.endDate}
                  onChange={(e) => set("endDate", e.target.value)}
                />
                <p className="mt-1.5 text-[13px] leading-relaxed text-(--start-description)">
                  진행 중이면 비워 두세요.
                  </p>
              </Field>
            </div>
          )}

          {/* 역할 / 팀 인원 */}
          {cfg.role && (
            <div className={`grid gap-6 ${cfg.teamSize ? "sm:grid-cols-[1fr_7.5rem]" : ""}`}>
              <Field label={cfg.role.label} hint={cfg.role.hint}>
                <TextInput
                  value={draft.role}
                  placeholder={cfg.role.placeholder}
                  onChange={(e) => set("role", e.target.value)}
                />
              </Field>
              {cfg.teamSize && (
                <Field label="팀 인원">
                  <TextInput
                    type="number"
                    min={1}
                    value={draft.teamSize ?? ""}
                    placeholder="4"
                    onChange={(e) =>
                      set("teamSize", e.target.value === "" ? null : Number(e.target.value))
                    }
                  />
                </Field>
              )}
            </div>
          )}

          {cfg.techStack && (
            <Field label="사용 기술" hint="쉼표로 구분해 주세요.">
              <TextInput
                value={draft.techStack}
                placeholder="예: Python, Java, C"
                onChange={(e) => set("techStack", e.target.value)}
              />
            </Field>
          )}

          <Field
            label={cfg.content.label}
            hint={cfg.content.hint}
            required={cfg.content.required}
          >
            <TextArea
              value={draft.content}
              placeholder={cfg.content.placeholder}
              onChange={(e) => set("content", e.target.value)}
            />
          </Field>

          {cfg.result && (
            <Field label={cfg.result.label} hint={cfg.result.hint}>
              <TextArea
                value={draft.result}
                placeholder={cfg.result.placeholder}
                onChange={(e) => set("result", e.target.value)}
              />
            </Field>
          )}

          {cfg.link && (
            <Field label="링크" hint="GitHub, 영상, 발표 자료 등">
              <TextInput
                value={draft.link}
                placeholder="https://"
                onChange={(e) => set("link", e.target.value)}
              />
            </Field>
          )}
        </div>

        <div className="flex items-center gap-3 border-t border-(--start-card-border) px-6 py-5">
          {!isNew && (
            <button
              type="button"
              onClick={onDelete}
              className="text-sm font-semibold text-(--start-description) transition-colors hover:text-red-400"
            >
              삭제
            </button>
          )}
          <div className="flex-1" />
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-3 text-sm font-semibold text-(--start-description) transition-colors hover:text-(--start-title)"
          >
            취소
          </button>
          <button
            type="button"
            onClick={() => onSubmit(draft)}
            disabled={!canSubmit}
            className="rounded-lg bg-(--start-accent) px-6 py-3 text-sm font-semibold text-(--bg) transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {isNew ? "추가" : "변경 사항 적용"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}