"use client";

import { ATTENDANCE_FIELDS, emptyAttendance } from "@/lib/profile-constants";
import type { AttendanceRow } from "@/types/profile";
import { Checkbox, SectionHead, Stepper } from "./FormControls";

export default function AttendanceSection({ rows, perfect, onChangeRows, onChangePerfect, }: {
  rows: AttendanceRow[];
  perfect: boolean;
  onChangeRows: (next: AttendanceRow[]) => void;
  onChangePerfect: (v: boolean) => void;
}) {
  const togglePerfect = (v: boolean) => {
    onChangePerfect(v);
    // 개근을 켜면 입력값을 0으로 되돌려 상태가 어긋나지 않게
    if (v) onChangeRows([1, 2, 3].map(emptyAttendance));
  };

  return (
    <>
      <SectionHead
        title="출결"
        description="기록이 없으면 0으로, 면접에서 물어볼 수 있는 부분이라 미리 정리해 두는 게 좋아요."
      />

      <div className="space-y-6">
        <Checkbox
          checked={perfect}
          onChange={togglePerfect}
          label="3년 모두 개근입니다"
        />

        <div className={perfect ? "pointer-events-none space-y-5 opacity-40" : "space-y-5"}>
          {rows.map((row, i) => (
            <div
              key={row.schoolYear}
              className="rounded-xl border border-(--start-card-border) bg-(--start-card-bg) p-6"
            >
              <h3 className="mb-5 text-[15px] font-semibold text-(--start-title)">
                {row.schoolYear}학년
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {ATTENDANCE_FIELDS.map((f) => (
                  <Stepper
                    key={f.key}
                    label={f.label}
                    value={row[f.key]}
                    onChange={(v) => {
                      const next = [...rows];
                      next[i] = { ...row, [f.key]: v };
                      onChangeRows(next);
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}