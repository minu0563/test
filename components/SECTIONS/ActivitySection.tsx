"use client";

import { useState } from "react";
import { ACTIVITY_LABEL, ACTIVITY_TYPES, emptyActivity } from "@/lib/profile-constants";
import type { Activity, ActivityType } from "@/types/profile";
import { AddButton, Chip, EmptyState, SectionHead } from "./FormControls";

export default function ActivitySection({ activities, onEdit,}: {
  activities: Activity[];
  onEdit: (a: Activity) => void;
}) {
  const [filter, setFilter] = useState<ActivityType | "ALL">("ALL");

  const shown = filter === "ALL" ? activities : activities.filter((a) => a.type === filter);
  const addType: ActivityType = filter === "ALL" ? "PROJECT" : filter;

  return (
    <>
      <SectionHead
        title="활동"
        description="자소서 본문은 거의 여기서 나옵니다. 하나를 자세히 적는 게 다섯 개를 한 줄씩 적는 것보다 훨씬 도움이 돼요."
      />

      <div className="mb-7 flex flex-wrap items-center gap-2">
        <Chip active={filter === "ALL"} onClick={() => setFilter("ALL")}>
          전체
          <span className="ml-1.5 tabular-nums opacity-60">{activities.length}</span>
        </Chip>
        {ACTIVITY_TYPES.map((t) => {
          const n = activities.filter((a) => a.type === t.key).length;
          return (
            <Chip key={t.key} active={filter === t.key} onClick={() => setFilter(t.key)}>
              {t.label}
              {n > 0 && <span className="ml-1.5 tabular-nums opacity-60">{n}</span>}
            </Chip>
          );
        })}
      </div>

      {shown.length === 0 ? (
        <EmptyState
          message="아직 등록한 활동이 없어요. 수상, MDP, 개인 프로젝트를 적어두면 자소서를 쓸 때 그대로 재료가 됩니다."
          action="활동 추가"
          onAction={() => onEdit(emptyActivity(addType))}
        />
      ) : (
        <div className="space-y-3">
          {shown.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => onEdit(a)}
              className="group block w-full rounded-xl border border-(--start-card-border) bg-(--start-card-bg) p-6 text-left transition-all hover:border-(--start-accent) hover:bg-(--start-card-hover)"
            >
              <div className="flex items-center gap-2.5">
                <span className="rounded-md bg-(--start-card-hover) px-2.5 py-1 text-xs font-semibold text-(--start-description)">
                  {ACTIVITY_LABEL[a.type]}
                </span>
                {a.award && (
                  <span className="text-xs font-semibold text-(--start-accent)">{a.award}</span>
                )}
              </div>

              <h3 className="mt-3 text-base font-semibold text-(--start-title) group-hover:text-(--start-accent)">
                {a.title || "제목 없음"}
              </h3>

              {a.role && (
                <p className="mt-1.5 text-sm text-(--start-description)">{a.role}</p>
              )}
              {a.content && (
                <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-(--start-description)">
                  {a.content}
                </p>
              )}
            </button>
          ))}

          <div className="pt-1">
            <AddButton onClick={() => onEdit(emptyActivity(addType))}>활동 추가</AddButton>
          </div>
        </div>
      )}
    </>
  );
}