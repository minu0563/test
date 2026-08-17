import type {
  Activity,
  ActivityType,
  AttendanceKey,
  AttendanceRow,
  BasicInfo,
} from "@/types/profile";

/** TODO: 실제 학과 4개로 교체 */
export const DEPARTMENTS = ["전자 제어", "전자 회로", "정보 통신", "인공지능"] as const;

export const ACTIVITY_TYPES: { key: ActivityType; label: string }[] = [
  { key: "AWARD", label: "수상" },
  { key: "MDP", label: "MDP" },
  { key: "PROJECT", label: "개인 프로젝트" },
  { key: "CERT", label: "자격증" },
  { key: "CLUB", label: "동아리" },
  { key: "ETC", label: "기타" },
];

export const ACTIVITY_LABEL = Object.fromEntries(
  ACTIVITY_TYPES.map((t) => [t.key, t.label])
) as Record<ActivityType, string>;

/* ------------------------------------------------------------------
 * 활동 타입별 필드 구성
 *
 * DB 컬럼은 모든 타입이 공유하고, 라벨만 타입별로 바꾼다.
 *   content → 프로젝트는 "무엇을 왜 어떻게", 동아리는 "활동 내용"
 *   result  → 프로젝트는 "결과와 배운 점", 동아리는 "느낀 점"
 *   award   → 수상은 "수상 내역", 자격증은 "등급 · 종목"
 *
 * 이 라벨은 서버의 프로필 → 프롬프트 렌더러에서도 그대로 써야 한다.
 * 안 그러면 AI가 동아리 소감을 "결과"로 읽는다.
 * ------------------------------------------------------------------ */

type TextField = {
  label: string;
  placeholder: string;
  hint?: string;
};

export type ActivityFieldConfig = {
  title: TextField;
  /** range: 시작~종료 / single: 하루 / none: 날짜 없음 */
  dateMode: "range" | "single" | "none";
  singleDateLabel?: string;
  organization?: TextField;
  award?: TextField;
  role?: TextField;
  teamSize: boolean;
  techStack: boolean;
  content: TextField & { required: boolean };
  result?: TextField;
  link: boolean;
};

export const ACTIVITY_FIELDS_BY_TYPE: Record<ActivityType, ActivityFieldConfig> = {
  AWARD: {
    title: { label: "대회 · 공모전 명", placeholder: "예: 교내 회로설계 경진대회" },
    dateMode: "single",
    singleDateLabel: "수상일",
    organization: { label: "주최", placeholder: "예: 교내, ○○협회" },
    award: { label: "수상 내역", placeholder: "예: 금상, 2위" },
    role: {
      label: "맡은 역할",
      placeholder: "예: 회로 설계",
    },
    teamSize: true,
    techStack: true,
    content: {
      label: "어떤 대회였고 무엇을 했는지",
      placeholder:
        "준비 과정에서 겪은 문제와 해결 방법까지 적으면 좋아요.",
      required: true,
    },
    result: {
      label: "결과와 배운 점",
      placeholder: "예: 정확도 72% → 95%. 문제를 눈으로만 보지 말고 측정해야 한다는 걸 배웠습니다.",
      hint: "숫자로 말할 수 있으면 꼭 숫자로 말하는게 좋아요.",
    },
    link: true,
  },

  MDP: {
    title: { label: "프로젝트명", placeholder: "예: 컨베이어 분류 시스템" },
    dateMode: "range",
    role: {
      label: "맡은 역할",
      placeholder: "예: 소프트웨어 개발",
    },
    teamSize: true,
    techStack: true,
    content: {
      label: "무엇을 왜 어떻게 했는지",
      placeholder:
        "예: 분류 정확도가 낮아 원인을 찾다가 센서 위치 문제를 발견하고, 브래킷을 다시 설계해 각도를 조정했습니다.",
      hint: "맞닥뜨린 문제와 그걸 해결한 과정을 적어 주세요. 이 부분이 자소서에서 제일 많이 쓰입니다.",
      required: true,
    },
    result: {
      label: "결과와 배운 점",
      placeholder: "예: 정확도 72% → 95%. 문제를 눈으로만 보지 말고 측정해야 한다는 걸 배웠습니다.",
      hint: "숫자로 말할 수 있으면 꼭 숫자로 쓰는게 좋아요.",
    },
    link: true,
  },

  PROJECT: {
    title: { label: "프로젝트명", placeholder: "예: 출결 자동 기록 앱" },
    dateMode: "range",
    teamSize: false,
    techStack: true,
    content: {
      label: "무엇을 왜 어떻게 만들었는지",
      placeholder:
        "예: 지각을 자꾸 놓쳐서 직접 만들었습니다. NFC 태그를 읽어 등교 시간을 기록하게 했습니다.",
      hint: "왜 만들기 시작했는지를 같이 적으면 이야기가 훨씬 살아납니다.",
      required: true,
    },
    result: {
      label: "결과와 배운 점",
      placeholder: "예: 반 20명이 두 달 동안 썼고, 예외 처리를 미리 생각해야 한다는 걸 배웠습니다.",
    },
    link: true,
  },

  CERT: {
    title: { label: "자격증명", placeholder: "예: 프로그래밍기능사" },
    dateMode: "single",
    singleDateLabel: "취득일",
    organization: { label: "발급 기관", placeholder: "예: 한국산업인력공단" },
    award: { label: "등급 · 종목", placeholder: "예: 기능사" },
    teamSize: false,
    techStack: false,
    content: {
      label: "준비 과정",
      placeholder: "예: 실기에서 두 번 떨어지고 배선 순서를 손에 익힌 뒤 세 번째에 붙었습니다.",
      hint: "쓸 이야기가 있을 때만 적으면 됩니다. 비워도 괜찮아요.",
      required: false,
    },
    link: false,
  },

  CLUB: {
    title: { label: "동아리명", placeholder: "예: 풍물부" },
    dateMode: "range",
    role: { label: "맡은 역할", placeholder: "예: 부장, 회계" },
    teamSize: false,
    techStack: false,
    content: {
      label: "활동 내용",
      placeholder: "예: 꽹과리 연주",
      hint: "무슨 활동을 했고 그 안에서 본인이 뭘 했는지 적어 주세요.",
      required: true,
    },
    result: {
      label: "느낀 점",
      placeholder: "예: 가르쳐 보고 나서야 내가 어설프게 알던 부분이 드러났습니다.",
    },
    link: false,
  },

  ETC: {
    title: { label: "활동명", placeholder: "예: 교내 방송부 봉사" },
    dateMode: "range",
    role: { label: "맡은 역할", placeholder: "예: 음향 담당" },
    teamSize: false,
    techStack: false,
    content: {
      label: "활동 내용",
      placeholder: "예: 행사마다 음향 장비를 세팅하고 운영했습니다.",
      required: true,
    },
    result: {
      label: "느낀 점",
      placeholder: "예: 준비 시간을 넉넉히 잡아야 사고가 안 난다는 걸 배웠습니다.",
    },
    link: true,
  },
};

export const ATTENDANCE_FIELDS: { key: AttendanceKey; label: string }[] = [
  { key: "absentUnexcused", label: "미인정 결석" },
  { key: "absentSick", label: "질병 결석" },
  { key: "lateUnexcused", label: "미인정 지각" },
  { key: "lateSick", label: "질병 지각" },
  { key: "earlyLeave", label: "조퇴" },
  { key: "classSkip", label: "결과" },
];

export const SCHOOL_YEARS = [1, 2, 3] as const;

export const emptyBasic: BasicInfo = {
  department: "",
  currentGrade: null,
  classNo: null,
  percentile1: null,
  percentile2: null,
  percentile3: null,
  targetJob: "",
  targetCompanies: "",
  strengths: "",
  perfectAttendance: false,
};

export const emptyAttendance = (schoolYear: number): AttendanceRow => ({
  schoolYear,
  absentUnexcused: 0,
  absentSick: 0,
  lateUnexcused: 0,
  lateSick: 0,
  earlyLeave: 0,
  classSkip: 0,
});

export const emptyActivity = (type: ActivityType): Activity => ({
  id: `new-${Date.now()}`,
  type,
  title: "",
  organization: "",
  award: "",
  startDate: "",
  endDate: "",
  role: "",
  teamSize: null,
  techStack: "",
  content: "",
  result: "",
  link: "",
});

export const isNewId = (id: string) => id.startsWith("new-");

/** 타입을 바꿀 때 그 타입에 없는 필드를 비운다 (안 비우면 저장 데이터가 오염됨) */
export function normalizeActivity(draft: Activity, type: ActivityType): Activity {
  const cfg = ACTIVITY_FIELDS_BY_TYPE[type];
  return {
    ...draft,
    type,
    organization: cfg.organization ? draft.organization : "",
    award: cfg.award ? draft.award : "",
    role: cfg.role ? draft.role : "",
    teamSize: cfg.teamSize ? draft.teamSize : null,
    techStack: cfg.techStack ? draft.techStack : "",
    result: cfg.result ? draft.result : "",
    link: cfg.link ? draft.link : "",
    startDate: cfg.dateMode === "none" ? "" : draft.startDate,
    endDate: cfg.dateMode === "range" ? draft.endDate : "",
  };
}

export type MissingKey =
  | "department"
  | "targetJob"
  | "activity"
  | "grade"
  | "attendance";

export const MISSING_LABEL: Record<MissingKey, string> = {
  department: "학과",
  targetJob: "희망 직무",
  activity: "활동 기록 (수상 · MDP · 프로젝트 등)",
  grade: "성적",
  attendance: "출결",
};

/** /p?need=... 로 넘길 섹션 키 */
export const MISSING_TO_SECTION: Record<MissingKey, string> = {
  department: "basic",
  targetJob: "basic",
  grade: "basic",
  activity: "activity",
  attendance: "attendance",
};