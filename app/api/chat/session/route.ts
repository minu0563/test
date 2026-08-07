import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id, title, firstMessage } = await req.json();

    if (!id || !firstMessage) {
      return NextResponse.json(
        { message: "Invalid data" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    await prisma.chatSession.create({
      data: {
        id,
        title: title || firstMessage.slice(0, 30),
        userId: user.id,

        messages: {
          create: {
            role: "user",
            content: firstMessage,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {

  const session = await getServerSession(authOptions);


  if (!session?.user?.email) {
    return NextResponse.json(
      [],
      { status: 401 }
    );
  }


  const chats = await prisma.chatSession.findMany({
    where: {
      user: {
        email: session.user.email,
      },
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
      createdAt: true,
      updatedAt: true,
    },
  });


  return NextResponse.json(chats);
}