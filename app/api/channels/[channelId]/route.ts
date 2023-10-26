import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";
import { NextResponse } from "next/server";

export const DELETE = async (
  req: Request,
  {
    params,
  }: {
    params: { channelId: string };
  }
) => {
  try {
    const profile = await currentProfile();
    const { searchParams } = new URL(req.url);

    const serverId = searchParams.get("serverId");

    if (!serverId) {
      return new NextResponse("[SERVER ID MISSING]", { status: 400 });
    }

    if (!profile) {
      return new NextResponse("[UNAUTHORIZED]", { status: 401 });
    }

    if (!params.channelId) {
      return new NextResponse("[CHANNEL ID MISSING]", { status: 400 });
    }

    const server = await db.server.update({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id,
            role: {
              in: [MemberRole.ADMIN, MemberRole.MODERATOR],
            },
          },
        },
      },
      data: {
        channels: {
          deleteMany: {
            id: params.channelId,
            name: {
              not: "general",
            },
          },
        },
      },
    });

    return NextResponse.json(server);
  } catch (e) {
    console.log("[CHANNELS_DELETE]", e);
    return new NextResponse("[INTERNAL SERVER ERROR]", { status: 500 });
  }
};

export const PATCH = async (
  req: Request,
  {
    params,
  }: {
    params: { channelId: string };
  }
) => {
  try {
    const profile = await currentProfile();
    const {name, type} = await req.json();
    const { searchParams } = new URL(req.url);

    const serverId = searchParams.get("serverId");

    if (!serverId) {
      return new NextResponse("[SERVER ID MISSING]", { status: 400 });
    }

    if (!profile) {
      return new NextResponse("[UNAUTHORIZED]", { status: 401 });
    }

    if (!params.channelId) {
      return new NextResponse("[CHANNEL ID MISSING]", { status: 400 });
    }

    if (name === 'general'){
      return new NextResponse("[GENERAL CHANNEL CANNOT BE MODIFIED]", { status: 400 });
    }

    const server = await db.server.update({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id,
            role: {
              in: [MemberRole.ADMIN, MemberRole.MODERATOR],
            },
          },
        },
      },
      data: {
        channels: {
          update: {
            where: {
              id: params.channelId,
              NOT: {
                name: 'general'
              }
            },
            data: {
              name,
              type,
            },
          },
        },
      },
    });

    return NextResponse.json(server);
  } catch (e) {
    console.log("[CHANNELS_PATCH]", e);
    return new NextResponse("[INTERNAL SERVER ERROR]", { status: 500 });
  }
};
