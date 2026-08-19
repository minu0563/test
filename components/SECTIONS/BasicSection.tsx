"use client";

import { DEPARTMENTS } from "@/lib/profile-constants";
import type { BasicInfo } from "@/types/profile";
import { Field, SectionHead, Select, TextArea, TextInput } from "./FormControls";

const PERCENTILE_KEYS = [
  { key: "percentile1", year: 1 },
  { key: "percentile2", year: 2 },
  { key: "percentile3", year: 3 },
] as const;

export default function BasicSection({
  value,
  onChange,
}: {
  value: BasicInfo;
  onChange: (next: BasicInfo) => void;
}) {
  const set = <K extends keyof BasicInfo>(k: K, v: BasicInfo[K]) =>
    onChange({ ...value, [k]: v });

  const num = (v: string) => (v === "" ? null : Number(v));

  return (
    <>
      <SectionHead
        title="기본 정보"
        description="자소서와 면접 답변 전체에 깔리는 정보예요. 학과와 희망 직무는 꼭 채워 주세요."
      />

      <div className="space-y-8">
        <div className="grid gap-6 sm:grid-cols-3">
          <Field label="학과" required>
            <Select
              value={value.department}
              onChange={(v) => set("department", v)}
              options={DEPARTMENTS}
              placeholder="선택"
            />
          </Field>
          <Field label="학년">
            <Select
              value={value.currentGrade ? String(value.currentGrade) : ""}
              onChange={(v) => set("currentGrade", v ? Number(v) : null)}
              options={["1", "2", "3"]}
              placeholder="선택"
            />
          </Field>
          <Field label="반">
            <TextInput
              type="number"
              min={1}
              value={value.classNo ?? ""}
              placeholder="예: 2"
              onChange={(e) => set("classNo", num(e.target.value))}
            />
          </Field>
        </div>

        {/* 성적 */}
        <div className="border-t border-(--start-card-border) pt-8">
          <h3 className="text-[15px] font-semibold text-(--start-title)">성적</h3>
          <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-(--start-description)">
              test message
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {PERCENTILE_KEYS.map(({ key, year }) => (
              <Field key={key} label={`${year}학년`}>
                <div className="relative">
                  <TextInput
                    type="number"
                    min={1}
                    max={100}
                    value={value[key] ?? ""}
                    placeholder="50"
                    onChange={(e) => set(key, num(e.target.value))}
                  />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-base text-(--start-description)">
                    %
                  </span>
                </div>
              </Field>
            ))}
          </div>
        </div>

        {/* 진로 */}
        <div className="space-y-6 border-t border-(--start-card-border) pt-8">
          <Field label="희망 직무" hint="구체적일수록 답변이 정확해져요." required>
            <TextInput
              value={value.targetJob}
              placeholder="예: WEB 개발"
              onChange={(e) => set("targetJob", e.target.value)}
            />
          </Field>

          <Field
            label="내 강점"
          >
            <TextArea
              value={value.strengths}
              placeholder="예: 회로 문제가 생기면 끝까지 원인을 찾는 편이다"
              onChange={(e) => set("strengths", e.target.value)}
            />
          </Field>
        </div>
      </div>
    </>
  );
}