import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const revEvent = body?.event;

    if (!revEvent) {
      return NextResponse.json({ success: false, message: "Missing event data" }, { status: 400 });
    }

    const {
      type: eventType,
      entitlement_ids = [],
      expiration_at_ms,
      purchased_at_ms,
      app_user_id,
    } = revEvent;

    if (!app_user_id) {
      return NextResponse.json({ success: false, message: "Missing app_user_id" }, { status: 400 });
    }

    if (!Array.isArray(entitlement_ids) || entitlement_ids.length === 0) {
      return NextResponse.json({ success: false, message: "No entitlement_ids provided" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: app_user_id },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const purchaseDate = purchased_at_ms ? new Date(purchased_at_ms) : new Date();
    const expirationDate = expiration_at_ms ? new Date(expiration_at_ms) : null;

    for (const entitlementId of entitlement_ids) {
      const moduleTier = await prisma.moduleTier.findUnique({
        where: { entitlementId },
      });

      if (!moduleTier) {
        console.warn(`No ModuleTier found for entitlementId: ${entitlementId}`);
        continue;
      }

      const moduleTierId = moduleTier.id;

      if (["INITIAL_PURCHASE", "UNCANCELLATION", "RENEWAL"].includes(eventType)) {
        // Upsert UserModule
        await prisma.userModule.upsert({
          where: {
            userId_moduleTierId: {
              userId: user.id,
              moduleTierId,
            },
          },
          update: {
            assignedAt: purchaseDate,
            expiresAt: expirationDate,
          },
          create: {
            userId: user.id,
            moduleTierId,
            assignedAt: purchaseDate,
            expiresAt: expirationDate,
          },
        });

        // Upsert ModuleUsage with limits
        await prisma.moduleUsage.upsert({
          where: {
            userId_moduleTierId: {
              userId: user.id,
              moduleTierId,
            },
          },
          update: {
            textProductionCount: moduleTier.textProductionLimit,
            conclusionCount: moduleTier.conclusionLimit,
            mapCount: moduleTier.mapLimit,
            lastUpdated: new Date(),
          },
          create: {
            userId: user.id,
            moduleTierId,
            textProductionCount: moduleTier.textProductionLimit,
            conclusionCount: moduleTier.conclusionLimit,
            mapCount: moduleTier.mapLimit,
          },
        });
      }

      if (["CANCELLATION", "EXPIRATION"].includes(eventType)) {
        await prisma.userModule.deleteMany({
          where: {
            userId: user.id,
            moduleTierId,
          },
        });

        await prisma.moduleUsage.deleteMany({
          where: {
            userId: user.id,
            moduleTierId,
          },
        });
      }
    }

    return NextResponse.json({ success: true, message: "Webhook processed successfully" }, { status: 200 });

  } catch (error) {
    console.error("RevenueCat Webhook Error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
