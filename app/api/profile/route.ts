import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { profilePayloadSchema } from "@/lib/validators/profile";

/** DateTime → "YYYY-MM-DD" (클라이언트의 <input type="date">가 이 형식만 받는다) */
const toDateInput = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : "");

async function loadProfile(userId: string) {
  const [info, attendance, activities] = await Promise.all([
    prisma.studentInfo.findUnique({ where: { userId } }),
    prisma.attendance.findMany({
      where: { userId },
      orderBy: { schoolYear: "asc" },
    }),
    prisma.activity.findMany({
      where: { userId },
      orderBy: [{ startDate: "desc" }, { createdAt: "desc" }],
    }),
  ]);

  return {
    basic: {
      department: info?.department ?? "",
      currentGrade: info?.currentGrade ?? null,
      classNo: info?.classNo ?? null,
      percentile1: info?.percentile1 ?? null,
      percentile2: info?.percentile2 ?? null,
      percentile3: info?.percentile3 ?? null,
      targetJob: info?.targetJob ?? "",
      targetCompanies: info?.targetCompanies ?? "",
      strengths: info?.strengths ?? "",
      perfectAttendance: info?.perfectAttendance ?? false,
    },
    attendance: attendance.map((a) => ({
      schoolYear: a.schoolYear,
      absentUnexcused: a.absentUnexcused,
      absentSick: a.absentSick,
      lateUnexcused: a.lateUnexcused,
      lateSick: a.lateSick,
      earlyLeave: a.earlyLeave,
      classSkip: a.classSkip,
    })),
    activities: activities.map((a) => ({
      id: a.id,
      type: a.type,
      title: a.title,
      organization: a.organization ?? "",
      award: a.award ?? "",
      startDate: toDateInput(a.startDate),
      endDate: toDateInput(a.endDate),
      role: a.role ?? "",
      teamSize: a.teamSize,
      techStack: a.techStack ?? "",
      content: a.content,
      result: a.result ?? "",
      link: a.link ?? "",
    })),
  };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }

  return NextResponse.json(await loadProfile(session.user.id));
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }
  const userId = session.user.id;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다" }, { status: 400 });
  }

  const parsed = profilePayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "입력값을 확인해 주세요", detail: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { basic, attendance, activities } = parsed.data;

  // 개근이면 출결 숫자를 신뢰하지 않고 0으로 덮는다 (클라이언트와 어긋나도 서버가 기준)
  const attendanceRows = basic.perfectAttendance
    ? [1, 2, 3].map((schoolYear) => ({
        schoolYear,
        absentUnexcused: 0,
        absentSick: 0,
        lateUnexcused: 0,
        lateSick: 0,
        earlyLeave: 0,
        classSkip: 0,
      }))
    : attendance;

  const isNew = (id: string) => id.startsWith("new-");
  const keepIds = activities.filter((a) => !isNew(a.id)).map((a) => a.id);

  try {
    await prisma.$transaction(async (tx) => {
      // 1. 기본 정보
      await tx.studentInfo.upsert({
        where: { userId },
        create: { userId, ...basic },
        update: basic,
      });

      // 2. 출결 — 학년별 upsert
      for (const row of attendanceRows) {
        const { schoolYear, ...counts } = row;
        await tx.attendance.upsert({
          where: { userId_schoolYear: { userId, schoolYear } },
          create: { userId, schoolYear, ...counts },
          update: counts,
        });
      }

      // 3. 활동 — 목록에서 사라진 것 삭제
      await tx.activity.deleteMany({
        where: {
          userId,
          ...(keepIds.length > 0 ? { id: { notIn: keepIds } } : {}),
        },
      });

      // 4. 활동 — 신규 생성 / 기존 수정
      for (const a of activities) {
        const { id, ...data } = a;
        if (isNew(id)) {
          await tx.activity.create({ data: { userId, ...data } });
        } else {
          // where에 userId를 함께 걸어 남의 행을 수정할 수 없게 한다
          await tx.activity.updateMany({ where: { id, userId }, data });
        }
      }
    });
  } catch (e) {
    console.error("[PUT /api/profile]", e);
    return NextResponse.json({ error: "저장에 실패했습니다" }, { status: 500 });
  }

  // 새로 만들어진 활동의 실제 id를 클라이언트에 돌려준다
  return NextResponse.json(await loadProfile(userId));
}