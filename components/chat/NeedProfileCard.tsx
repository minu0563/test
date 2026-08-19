"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { MISSING_LABEL, MISSING_TO_SECTION, type MissingKey } from "@/lib/profile-context";

export default function NeedProfileCard({ keys, promptType, blocking, chatId }: {
  keys: MissingKey[];
  promptType: string;
  blocking?: boolean;
  chatId: string;
}) {
  if (!keys.length) return null;

  const sections = Array.from(new Set(keys.map((k) => MISSING_TO_SECTION[k])));
  const href = `/p?from=${promptType}&need=${sections.join(",")}&back=${chatId}`;

  return (
    <div className="my-3 rounded-xl border border-(--start-accent)/30 bg-(--start-accent)/5 px-5 py-4">
      <div className="flex items-start gap-3">
        <Sparkles size={17} className="mt-0.5 shrink-0 text-(--start-accent)" />
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold text-(--start-title)">
            {blocking ? "먼저 채워야 할 정보가 있어요" : "이 정보가 있으면 더 정확해져요"}
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-(--start-description)">
            {keys.map((k) => MISSING_LABEL[k]).join(", ")}
          </p>

          <Link
            href={href}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-(--start-accent) hover:underline"
          >
            내 정보 입력하기
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}