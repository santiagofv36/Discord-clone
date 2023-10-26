import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const PATCH = async (
  req: Request,
  { params }: { params: { serverId: string } }
) => {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("[UNAUTHORIZED]", { status: 401 });
    }

    if (!params.serverId) {
      return new NextResponse("[SERVER ID MISSING]", { status: 400 });
    }

    const server = await db.server.update({
      where: {
        id: params.serverId,
        profileId: {
          not: profile.id,
        },
        members: {
          some: {
            profileId: profile.id,
          },
        },
      },
      data: {
        members: {
          deleteMany: {
            profileId: profile.id,
          },
        },
      },
    });

    return NextResponse.json(server);
  } catch (e) {
    console.log("[SERVER ID LEAVE]", e);
    return new NextResponse("[INTERNAL SERVER ERROR]", { status: 500 });
  }
};
