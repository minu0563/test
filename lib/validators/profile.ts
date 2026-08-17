import { z } from "zod";

/** "" → null, "2025-03-14" → Date */
const dateString = z
  .string()
  .max(10)
  .refine((v) => v === "" || /^\d{4}-\d{2}-\d{2}$/.test(v), "날짜 형식이 올바르지 않습니다")
  .transform((v) => (v === "" ? null : new Date(`${v}T00:00:00Z`)));

const nullableInt = (min: number, max: number) =>
  z.number().int().min(min).max(max).nullable();

export const basicSchema = z.object({
  department: z.string().trim().max(50),
  currentGrade: nullableInt(1, 3),
  classNo: nullableInt(1, 30),
  percentile1: z.number().min(0).max(100).nullable(),
  percentile2: z.number().min(0).max(100).nullable(),
  percentile3: z.number().min(0).max(100).nullable(),
  targetJob: z.string().trim().max(300),
  targetCompanies: z.string().trim().max(500),
  strengths: z.string().trim().max(3000),
  perfectAttendance: z.boolean(),
});

export const attendanceSchema = z.object({
  schoolYear: z.number().int().min(1).max(3),
  absentUnexcused: z.number().int().min(0).max(365),
  absentSick: z.number().int().min(0).max(365),
  lateUnexcused: z.number().int().min(0).max(365),
  lateSick: z.number().int().min(0).max(365),
  earlyLeave: z.number().int().min(0).max(365),
  classSkip: z.number().int().min(0).max(365),
});

export const activitySchema = z.object({
  id: z.string().min(1).max(60),
  type: z.enum(["AWARD", "MDP", "PROJECT", "CERT", "CLUB", "ETC"]),
  title: z.string().trim().min(1, "제목을 입력해 주세요").max(200),
  organization: z.string().trim().max(200),
  award: z.string().trim().max(200),
  startDate: dateString,
  endDate: dateString,
  role: z.string().trim().max(500),
  teamSize: nullableInt(1, 100),
  techStack: z.string().trim().max(300),
  content: z.string().trim().max(5000),
  result: z.string().trim().max(5000),
  link: z.string().trim().max(500),
});

export const profilePayloadSchema = z.object({
  basic: basicSchema,
  // 1, 2, 3학년 세 행이 항상 함께 온다
  attendance: z.array(attendanceSchema).max(3),
  activities: z.array(activitySchema).max(100),
});

export type ProfilePayload = z.infer<typeof profilePayloadSchema>;