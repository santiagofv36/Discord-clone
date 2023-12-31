import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";


export const PATCH = async (req: Request, {params}:{params:{serverId:string}})=>{

  try{
    const profile = await currentProfile();
    const {name, imageUrl} = await req.json();

    if (!profile){
      return new NextResponse("UNAUTHORIZED",{status:401});
    }

    const server = await db.server.update({
      where:{
        id: params.serverId,
        profileId: profile.id
      },
      data:{
        name,
        imageUrl
      }
    });

    return NextResponse.json(server);

  }catch(e){
    console.log("[SERVER_ID_PATCH]",e);
    return new NextResponse("INTERNAL SERVER ERROR",{status:500});
  }

};

export const DELETE = async (req: Request, {params}:{params:{serverId:string}})=>{

  try{

    const profile = await currentProfile();

    if (!profile){
      return new NextResponse("UNAUTHORIZED",{status:401});
    }

    const server = await db.server.delete({
      where:{
        id: params.serverId,
        profileId: profile.id
      }
    });

    return NextResponse.json(server);

  }catch(e){

    console.log("[SERVER_ID_DELETE]",e);
    return new NextResponse("INTERNAL SERVER ERROR",{status:500});

  }

};