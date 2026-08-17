import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LABEL_BY_INTENT, type ChatIntent } from "@/lib/intent";

const VALID: ChatIntent[] = [
  "CHAT",
  "WRITE",
  "REVIEW",
  "INTERVIEW",
];

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "로그인이 필요합니다" },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));

    const { id, title, firstMessage } = body;

    const intent: ChatIntent = VALID.includes(body.intent)
      ? body.intent
      : "CHAT";

    // 기존처럼 firstMessage가 있으면 세션 생성과 동시에 첫 메시지도 생성
    if (firstMessage) {
      const created = await prisma.chatSession.create({
        data: {
          id: typeof id === "string" && id.trim()
            ? id
            : crypto.randomUUID(),

          title:
            typeof title === "string" && title.trim()
              ? title.trim().slice(0, 60)
              : firstMessage.slice(0, 30),

          userId: session.user.id,
          intent,

          messages: {
            create: {
              role: "user",
              content: firstMessage,
            },
          },
        },

        select: {
          id: true,
          title: true,
          intent: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return NextResponse.json({
        success: true,
        ...created,
      });
    }

    // firstMessage 없이 세션만 먼저 만드는 경우
    const created = await prisma.chatSession.create({
      data: {
        id: typeof id === "string" && id.trim()
          ? id
          : crypto.randomUUID(),

        title:
          typeof title === "string" && title.trim()
            ? title.trim().slice(0, 60)
            : LABEL_BY_INTENT[intent],

        userId: session.user.id,
        intent,
      },

      select: {
        id: true,
        title: true,
        intent: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      ...created,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "로그인이 필요합니다" },
        { status: 401 }
      );
    }

    const chats = await prisma.chatSession.findMany({
      where: {
        userId: session.user.id,
      },

      orderBy: [
        {
          updatedAt: "desc",
        },
        {
          createdAt: "desc",
        },
      ],

      select: {
        id: true,
        title: true,
        intent: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(chats);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}