/* eslint-disable @typescript-eslint/no-unused-vars */
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


export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
 
    const { id } = params
    const data = await request.json()

    // Remove fields that shouldn't be updated
    const { id: _, email, isAdmin, createdAt, password, ...updateData } = data

    // Only include password in update if it was provided
    if (password) {
      // Hash the password before saving
      // updateData.password = await hashPassword(password)
      // For now, we'll just include it as-is (not recommended for production)
      updateData.password = password
    }

    delete updateData.userPackages
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        fullName: true,
        email: true,
        profession: true,
        country: true,
        city: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('[USER_UPDATE]', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}