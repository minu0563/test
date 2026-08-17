"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { ATTENDANCE_FIELDS, emptyAttendance, emptyBasic, } from "@/lib/profile-constants";
import type { Activity, AttendanceRow, BasicInfo, SectionKey, } from "@/types/profile";
import ActivitySection from "../SECTIONS/ActivitySection";
import ActivitySheet from "../SECTIONS/ActivitySheet";
import AttendanceSection from "../SECTIONS/AttendanceSection";
import BasicSection from "../SECTIONS/BasicSection";
import { ProfileHeader, ProfileNav, ReturnNotice, SaveBar, SECTIONS } from "./ProfileChrome";
import { sessionHref } from "@/lib/intent";
import { ChatIntent } from "@prisma/client";

export default function ProfileEditor() {
  const router = useRouter();
  const params = useSearchParams();
  const reduce = useReducedMotion();

  const from = params.get("from"); // "write" | "review" | "interview"
  const needed = (params.get("need") ?? "").split(",").filter(Boolean);

  const [section, setSection] = useState<SectionKey>(
    needed.includes("activity") ? "activity" : "basic"
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  const [basic, setBasic] = useState<BasicInfo>(emptyBasic);
  const [attendance, setAttendance] = useState<AttendanceRow[]>([1, 2, 3].map(emptyAttendance));
  const [activities, setActivities] = useState<Activity[]>([]);
  const [editing, setEditing] = useState<Activity | null>(null);

  const back = params.get("back");

  const startAgain = async () => {
    const intent = from?.toUpperCase() as ChatIntent;
    const valid = ["WRITE", "REVIEW", "INTERVIEW"];

    if (!intent || !valid.includes(intent)) {
      router.push("/");
      return;
    }

    // 돌아갈 대화방이 있으면 그쪽으로
    if (back) {
      router.push(sessionHref(intent, back));
      return;
    }

    try {
      const res = await fetch("/api/chat/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intent }),
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      router.push(sessionHref(intent, created.id));
    } catch {
      router.push("/");
    }
  };
  /* 초기 로드 */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/profile", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (data.basic) setBasic({ ...emptyBasic, ...data.basic });
        if (Array.isArray(data.activities)) setActivities(data.activities);
        if (Array.isArray(data.attendance) && data.attendance.length) {
          setAttendance(
            [1, 2, 3].map(
              (y) =>
                data.attendance.find((a: AttendanceRow) => a.schoolYear === y) ?? emptyAttendance(y)
            )
          );
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* 저장 안 한 상태로 이탈 시 경고 */
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const done: Record<SectionKey, boolean> = useMemo(
    () => ({
      basic: Boolean(basic.department && basic.targetJob),
      attendance:
        basic.perfectAttendance ||
        attendance.some((row) => ATTENDANCE_FIELDS.some((f) => row[f.key] > 0)),
      activity: activities.length > 0,
    }),
    [basic, attendance, activities]
  );

  const doneCount = Object.values(done).filter(Boolean).length;

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ basic, attendance, activities }),
      });
      if (!res.ok) throw new Error();
      setDirty(false);
      setSavedAt(new Date());
    } catch {
      // TODO: 토스트로 교체
      alert("저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-(--bg)">
        <Loader2 size={24} className="animate-spin text-(--start-accent)" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--bg) text-(--text)">
      <ProfileHeader
        savedAt={savedAt}
        doneCount={doneCount}
        onBack={() => router.push("/")}
      />

      {from && needed.length > 0 && <ReturnNotice from={from} />}

      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10 lg:flex-row lg:gap-14">
        <ProfileNav current={section} done={done} needed={needed} onSelect={setSection} />

        <main className="min-w-0 flex-1 pb-32">
          <AnimatePresence mode="wait">
            <motion.div
              key={section}
              initial={reduce ? undefined : { opacity: 0, y: 10 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
            >
              {section === "basic" && (
                <BasicSection
                  value={basic}
                  onChange={(next) => {
                    setBasic(next);
                    setDirty(true);
                  }}
                />
              )}

              {section === "attendance" && (
                <AttendanceSection
                  rows={attendance}
                  perfect={basic.perfectAttendance}
                  onChangeRows={(next) => {
                    setAttendance(next);
                    setDirty(true);
                  }}
                  onChangePerfect={(v) => {
                    setBasic({ ...basic, perfectAttendance: v });
                    setDirty(true);
                  }}
                />
              )}

              {section === "activity" && (
                <ActivitySection activities={activities} onEdit={setEditing} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {(dirty || (from && doneCount > 0)) && (
          <SaveBar
            dirty={dirty}
            saving={saving}
            showReturn={Boolean(from)}
            reduce={reduce}
            onSave={save}
            onReturn={startAgain}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editing && (
          <ActivitySheet
            value={editing}
            isNew={!activities.some((a) => a.id === editing.id)}
            onClose={() => setEditing(null)}
            onDelete={() => {
              setActivities(activities.filter((a) => a.id !== editing.id));
              setEditing(null);
              setDirty(true);
            }}
            onSubmit={(next) => {
              setActivities((prev) =>
                prev.some((a) => a.id === next.id)
                  ? prev.map((a) => (a.id === next.id ? next : a))
                  : [...prev, next]
              );
              setEditing(null);
              setDirty(true);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}