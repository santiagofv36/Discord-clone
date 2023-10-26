import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const PATCH = async (
  req: Request,
  { params }: { params: { memberId: string } }
) => {
  try {
    const profile = await currentProfile();
    const { searchParams } = new URL(req.url);
    const { role } = await req.json();

    const serverId = searchParams.get("serverId");

    if (!profile) {
      return new NextResponse("UNAUTHORIZED", { status: 401 });
    }

    if (!serverId) {
      return new NextResponse("MISSING SERVER ID", { status: 400 });
    }

    if (!params.memberId) {
      return new NextResponse("MISSING MEMBER ID", { status: 400 });
    }

    const server = await db.server.update({
      where: {
        id: serverId,
        profileId: profile.id,
      },
      data: {
        members: {
          update: {
            where: {
              id: params.memberId,
              profileId: {
                not: profile.id,
              },
            },
            data: {
              role,
            },
          },
        },
      },
      include: {
        members: {
          include: {
            profile: true,
          },
          orderBy: {
            role: "asc",
          },
        },
      },
    });

    return NextResponse.json(server);

  } catch (e) {
    console.error("[MEMBERS_ID_PATCH]", e);
    return new NextResponse("INTERNAL SERVER ERROR", { status: 500 });
  }
};

export const DELETE = async (req: Request,{params}:{params:{memberId:string}}) =>{
  try{

    const profile = await currentProfile();

    const { searchParams } = new URL(req.url);

    const serverId = searchParams.get("serverId");

    if (!profile) {
      return new NextResponse("UNAUTHORIZED", { status: 401 });
    }

    if (!serverId) {
      return new NextResponse("MISSING SERVER ID", { status: 400 });
    }

    if (!params.memberId) {
      return new NextResponse("MISSING MEMBER ID", { status: 400 });
    }

    const server = await db.server.update({
      where: {
        id: serverId,
        profileId: profile.id,
      },
      data: {
        members: {
          deleteMany: {
            id: params.memberId,
            profileId:{
              not: profile.id,
            }
          },
        },
      },
      include: {
        members: {
          include: {
            profile: true,
          },
          orderBy: {
            role: "asc",
          },
        },
      },
    });

    return NextResponse.json(server);

  }catch(e){
    console.error("[MEMBERS_ID_DELETE]", e);
    return new NextResponse("INTERNAL SERVER ERROR", { status: 500 });
  }
}
