export type SectionKey = "basic" | "attendance" | "activity";

export type ActivityType = "AWARD" | "MDP" | "PROJECT" | "CERT" | "CLUB" | "ETC";

export type AttendanceKey =
  | "absentUnexcused"
  | "absentSick"
  | "lateUnexcused"
  | "lateSick"
  | "earlyLeave"
  | "classSkip";

export type BasicInfo = {
  department: string;
  currentGrade: number | null;
  classNo: number | null;
  percentile1: number | null;
  percentile2: number | null;
  percentile3: number | null;
  targetJob: string;
  targetCompanies: string;
  strengths: string;
  perfectAttendance: boolean;
};

export type AttendanceRow = { schoolYear: number } & Record<AttendanceKey, number>;

export type Activity = {
  id: string;
  type: ActivityType;
  title: string;
  organization: string;
  award: string;
  startDate: string;
  endDate: string;
  role: string;
  teamSize: number | null;
  techStack: string;
  content: string;
  result: string;
  link: string;
};

export type ProfileData = {
  basic: BasicInfo;
  attendance: AttendanceRow[];
  activities: Activity[];
};