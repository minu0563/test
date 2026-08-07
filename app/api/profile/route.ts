import getServerSession from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return new Response("Unauthorized", { status: 401 });
    }

    const { id } = await req.json();
    
    const profile = await prisma.userProfile.create({
        data: {
            id,
            userId: session.user.id,
            category: "basic_info",
            title: "",
            content: "",
        },
    });

    return Response.json(profile);

}