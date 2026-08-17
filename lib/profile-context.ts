import { prisma } from "@/lib/prisma";
import { ACTIVITY_FIELDS_BY_TYPE, ACTIVITY_LABEL } from "@/lib/profile-constants";
import type { ActivityType } from "@/types/profile";

export type Intent = "WRITE" | "REVIEW" | "INTERVIEW" | "CHAT";

export async function loadProfile(userId: string) {
  const [info, attendance, activities] = await Promise.all([
    prisma.studentInfo.findUnique({ where: { userId } }),
    prisma.attendance.findMany({ where: { userId }, orderBy: { schoolYear: "asc" } }),
    prisma.activity.findMany({
      where: { userId },
      orderBy: [{ startDate: "desc" }, { createdAt: "desc" }],
    }),
  ]);
  return { info, attendance, activities };
}

type Profile = Awaited<ReturnType<typeof loadProfile>>;

const ymd = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : "");

function renderPeriod(start: Date | null, end: Date | null, mode: string) {
  if (!start) return "";
  if (mode === "single") return ymd(start);
  return `${ymd(start)} ~ ${end ? ymd(end) : "진행 중"}`;
}

export function renderProfile({ info, attendance, activities }: Profile): string {
  const out: string[] = [];

  /* 기본 정보 */
  if (info) {
    out.push("## 기본 정보");
    if (info.department) out.push(`- 학과: ${info.department}`);
    if (info.currentGrade) out.push(`- 학년: ${info.currentGrade}학년`);
    if (info.targetJob) out.push(`- 희망 직무: ${info.targetJob}`);
    if (info.targetCompanies) out.push(`- 희망 기업: ${info.targetCompanies}`);
    if (info.strengths) out.push(`- 본인이 말한 강점: ${info.strengths}`);

    const grades = [
      info.percentile1 != null ? `1학년 상위 ${info.percentile1}%` : null,
      info.percentile2 != null ? `2학년 상위 ${info.percentile2}%` : null,
      info.percentile3 != null ? `3학년 상위 ${info.percentile3}%` : null,
    ].filter(Boolean);

    if (grades.length) {
      out.push(
        "",
        "## 성적",
        "학과 내 등수를 백분율로 환산한 값이다. 학과 정원은 27~32명이므로",
        "상위 30%는 대략 9~10등에 해당한다. 숫자가 낮을수록 상위권이다.",
        ...grades.map((g) => `- ${g}`)
      );
    }
  }

  /* 출결 */
  if (info?.perfectAttendance) {
    out.push("", "## 출결", "- 3년 개근. 결석·지각·조퇴 기록이 없다.");
  } else if (attendance.length) {
    const lines = attendance
      .map((a) => {
        const items = [
          a.absentUnexcused && `미인정결석 ${a.absentUnexcused}`,
          a.absentSick && `질병결석 ${a.absentSick}`,
          a.lateUnexcused && `미인정지각 ${a.lateUnexcused}`,
          a.lateSick && `질병지각 ${a.lateSick}`,
          a.earlyLeave && `조퇴 ${a.earlyLeave}`,
          a.classSkip && `결과 ${a.classSkip}`,
        ].filter(Boolean);
        return items.length ? `- ${a.schoolYear}학년: ${items.join(", ")}` : null;
      })
      .filter(Boolean) as string[];

    if (lines.length) out.push("", "## 출결", ...lines);
  }

  const order: ActivityType[] = ["AWARD", "CERT", "MDP", "PROJECT", "CLUB", "ETC"];

  for (const type of order) {
    const items = activities.filter((a) => a.type === type);
    if (!items.length) continue;

    const cfg = ACTIVITY_FIELDS_BY_TYPE[type];
    out.push("", `## ${ACTIVITY_LABEL[type]}`);

    for (const a of items) {
      out.push(`### ${a.title}${a.award ? ` (${a.award})` : ""}`);

      const period = renderPeriod(a.startDate, a.endDate, cfg.dateMode);
      if (period) out.push(`- ${cfg.dateMode === "single" ? cfg.singleDateLabel : "기간"}: ${period}`);

      if (cfg.organization && a.organization) {
        out.push(`- ${cfg.organization.label}: ${a.organization}`);
      }
      if (cfg.role && a.role) {
        out.push(`- ${cfg.role.label}: ${a.role}${a.teamSize ? ` (${a.teamSize}인 팀)` : ""}`);
      }
      if (cfg.techStack && a.techStack) out.push(`- 사용 기술: ${a.techStack}`);
      if (a.content) out.push(`- ${cfg.content.label}: ${a.content}`);
      if (cfg.result && a.result) out.push(`- ${cfg.result.label}: ${a.result}`);
    }
  }

  return out.join("\n").trim();
}

/** 클라이언트가 /p?need=... 로 넘길 때 쓰는 키 */
export type MissingKey = "department" | "targetJob" | "activity" | "grade" | "attendance";

export const MISSING_LABEL: Record<MissingKey, string> = {
  department: "학과",
  targetJob: "희망 직무",
  activity: "활동 기록 (수상·MDP·프로젝트 등)",
  grade: "성적",
  attendance: "출결",
};

/** need 파라미터는 /p의 섹션 키로 바꿔서 넘긴다 */
export const MISSING_TO_SECTION: Record<MissingKey, string> = {
  department: "basic",
  targetJob: "basic",
  grade: "basic",
  activity: "activity",
  attendance: "attendance",
};

export type Readiness = {
  status: "BLOCKED" | "PARTIAL" | "READY";
  /* 없으면 대화가 성립하지 않는 항목 */
  missing: MissingKey[];
  /* 없어도 되지만 품질이 떨어지는 항목 */
  weak: MissingKey[];
};

export function evaluateReadiness(profile: Profile, intent: Intent): Readiness {
  const { info, attendance, activities } = profile;

  const has = {
    department: Boolean(info?.department),
    targetJob: Boolean(info?.targetJob),
    activity: activities.length > 0,
    grade:
      info?.percentile1 != null || info?.percentile2 != null || info?.percentile3 != null,
    attendance:
      Boolean(info?.perfectAttendance) ||
      attendance.some(
        (a) =>
          a.absentUnexcused + a.absentSick + a.lateUnexcused + a.lateSick + a.earlyLeave + a.classSkip >
          0
      ),
  };

  const missing: MissingKey[] = [];
  const weak: MissingKey[] = [];

  if (!has.department) missing.push("department");

  if (intent === "WRITE") {
    if (!has.activity) missing.push("activity");
    if (!has.targetJob) weak.push("targetJob");
    if (!has.grade) weak.push("grade");
    if (!has.attendance) weak.push("attendance");
  }

  if (intent === "INTERVIEW") {
    if (!has.targetJob) missing.push("targetJob");
    if (!has.activity) weak.push("activity");
    if (!has.attendance) weak.push("attendance");
  }

  if (intent === "REVIEW") {
    // 첨삭할땐 없어도됨
    if (!has.activity) weak.push("activity");
    if (!has.targetJob) weak.push("targetJob");
  }

  return {
    status: missing.length ? "BLOCKED" : weak.length ? "PARTIAL" : "READY",
    missing,
    weak,
  };
}

/** 채팅 API에서 한 번에 쓰는 헬퍼 */
export async function getProfileContext(userId: string, intent: Intent) {
  const profile = await loadProfile(userId);
  return {
    text: renderProfile(profile),
    readiness: evaluateReadiness(profile, intent),
  };
}