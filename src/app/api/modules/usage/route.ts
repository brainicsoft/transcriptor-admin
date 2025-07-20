import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    // 🔐 Authenticate user
    const authUser = await getUserFromRequest(req);
    console.log("Authenticated User:", authUser);
    if (!authUser?.userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const userId = authUser.userId;
    const { searchParams } = new URL(req.url);

    const moduleTierId = searchParams.get("module");
    const incrementType = searchParams.get("type"); // "text" | "conclusion" | "map"
    const increment = searchParams.get("count") === "true";

    if (!moduleTierId) {
      return NextResponse.json({ success: false, message: "Missing moduleTierId" }, { status: 400 });
    }

    const moduleUsage = await prisma.moduleUsage.findFirst({
      where: { userId, moduleTierId },
      include: { moduleTier: true },
    });

    if (!moduleUsage) {
      return NextResponse.json({ success: false, message: "Module not found" }, { status: 404 });
    }

    const { moduleTier } = moduleUsage;
    const updates: Record<string, number> = {};

    const featureMap = {
      text: {
        has: moduleTier.hasTextProduction,
        limit: moduleTier.textProductionLimit,
        current: moduleUsage.textProductionCount,
        key: "textProductionCount",
      },
      conclusion: {
        has: moduleTier.hasConclusion,
        limit: moduleTier.conclusionLimit,
        current: moduleUsage.conclusionCount,
        key: "conclusionCount",
      },
      map: {
        has: moduleTier.hasMap,
        limit: moduleTier.mapLimit,
        current: moduleUsage.mapCount,
        key: "mapCount",
      },
    };

    const feature = featureMap[incrementType as keyof typeof featureMap];
console.log(feature)
    if (increment) {
      if (!feature?.has) {
        return NextResponse.json(
          { success: false, message: `This module does not support "${incrementType}".` },
          { status: 403 }
        );
      }

      if (feature.limit !== -1 && feature.current >= feature.limit) {
        return NextResponse.json(
          {
            success: false,
            message: `You cannot access ${incrementType}. Limit reached.`,
            moduleTier: moduleUsage,
          },
          { status: 403 }
        );
      }

      updates[feature.key] = feature.current + 1;

      const updatedUsage = await prisma.moduleUsage.update({
        where: {
          userId_moduleTierId: { userId, moduleTierId },
        },
        data: {
          ...updates,
          lastUpdated: new Date(),
        },
        include: { moduleTier: true },
      });

      return NextResponse.json({ success: true, usage: updatedUsage });
    }

    return NextResponse.json({ success: true, usage: moduleUsage });
  } catch (error) {
    console.error("ModuleUsage Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
