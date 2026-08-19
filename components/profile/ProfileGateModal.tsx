"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { MISSING_LABEL, MISSING_TO_SECTION, type MissingKey, } from "@/lib/profile-constants";

export default function ProfileGateModal({
  missing,
  weak,
  from,
  onSkip,
  onClose,
}: {
  missing: MissingKey[];
  weak: MissingKey[];
  from: string;
  onSkip: () => void;
  onClose: () => void;
}) {
  const blocking = missing.length > 0;
  const keys = blocking ? missing : weak;
  const sections = Array.from(new Set(keys.map((k) => MISSING_TO_SECTION[k])));
  const href = `/p?from=${from}&need=${sections.join(",")}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-md rounded-2xl border border-(--start-card-border) bg-(--bg) p-7"
      >
        <Sparkles size={22} className="text-(--start-accent)" />

        <h2 className="mt-4 text-lg font-semibold text-(--start-title)">
          {blocking
            ? "먼저 내 정보를 입력해 주세요"
            : "정보를 조금 더 채우면 훨씬 정확해져요"}
        </h2>

        <p className="mt-2.5 text-[15px] leading-relaxed text-(--start-description)">
          {blocking
            ? "이 정보가 없으면 AI가 경험을 지어내지 않고 계속 되묻게 됩니다."
            : "지금 시작해도 되지만, 아래 항목이 있으면 더 구체적으로 써 드릴 수 있어요."}
        </p>

        <ul className="mt-4 space-y-1.5">
          {keys.map((k) => (
            <li key={k} className="text-sm text-(--start-title)">
              · {MISSING_LABEL[k]}
            </li>
          ))}
        </ul>

        <div className="mt-7 flex flex-col gap-2.5">
          <a
            href={href}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-(--start-accent) px-5 py-3.5 text-sm font-semibold text-(--bg) transition-opacity hover:opacity-90"
          >
            정보 입력하기
            <ArrowRight size={15} />
          </a>

          <button
            type="button"
            onClick={onSkip}
            className="rounded-lg px-5 py-3 text-sm font-semibold text-(--start-description) transition-colors hover:text-(--start-title)"
          >
            그냥 시작하기
          </button>
        </div>
      </motion.div>
    </div>
  );
}