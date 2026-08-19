import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await params;

        const chat = await prisma.chatSession.findUnique({
            where: { id },
            include: {
                messages: {
                    orderBy: { createdAt: "asc" },
                },
                user: {
                    select: { email: true },
                },
            },
        });

        if (!chat) {
            return NextResponse.json(
                { message: "Chat not found" },
                { status: 404 }
            );
        }

        if (chat.user.email !== session.user.email) {
            return NextResponse.json(
                { message: "Chat not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(chat.messages);

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { message: "Server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await params;

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        const chat = await prisma.chatSession.findUnique({
            where: { id },
        });

        if (!chat || chat.userId !== user.id) {
            return NextResponse.json(
                { message: "Forbidden" },
                { status: 403 }
            );
        }

        await prisma.chatSession.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { message: "Server error" },
            { status: 500 }
        );
    }
}