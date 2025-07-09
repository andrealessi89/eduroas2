import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    const users = await prisma.user.findMany({
      select: {
        email: true,
        name: true,
        isActive: true,
      },
    });
    
    return NextResponse.json({
      status: "ok",
      userCount,
      users,
      prismaConnected: true,
    });
  } catch (error: any) {
    return NextResponse.json({
      status: "error",
      error: error.message,
      prismaConnected: false,
    });
  }
}