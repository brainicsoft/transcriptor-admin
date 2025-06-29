import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // First check if the user exists
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if the user has any related data that should prevent deletion
    const hasDependencies =
      (await prisma.userModule.count({
        where: { userId: id },
      })) > 0 ||
      (await prisma.userPackage.count({
        where: { userId: id },
      })) > 0 ||
      (await prisma.moduleUsage.count({
        where: { userId: id },
      })) > 0;

    if (hasDependencies) {
      return NextResponse.json(
        { error: "Cannot delete user with associated records" },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[USER_DELETE]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
