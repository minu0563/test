import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { chatSessionId, role, content } = await req.json();

    if (!chatSessionId || !role || !content) {
      return NextResponse.json(
        { message: "Invalid data" },
        { status: 400 }
      );
    }

    const chat = await prisma.chatSession.findUnique({
      where: { id: chatSessionId },
      include: { user: { select: { email: true } } },
    });

    if (!chat || chat.user.email !== session.user.email) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    const messageCount = await prisma.message.count({
      where: { chatSessionId },
    });

    if (messageCount === 1 && role === "user") {
      return NextResponse.json({ skipped: true });
    }

    const message = await prisma.message.create({
      data: { chatSessionId, role, content },
    });

    await prisma.chatSession.update({
      where: { id: chatSessionId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(message);

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}