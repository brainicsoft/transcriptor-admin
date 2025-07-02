import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { updateModuleSchema } from "@/lib/validations/module";
import { uploadModuleIcon, uploadModuleZip } from "@/lib/utils/file-upload";

// GET /api/admin/modules/[id] - Get a specific module (admin only)
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication and admin status
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    if (!user.isAdmin) {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    const { id } = params;

    // Get the module
    const module = await prisma.module.findUnique({
      where: { id },
      include: {
        tiers: true,
      },
    });

    if (!module) {
      return NextResponse.json(
        { success: false, message: "Module not found" },
        { status: 404 }
      );
    }

    // Get usage statistics
    const usageStats = await prisma.moduleUsage.findMany({
      where: {
        moduleTierId: {
          in: module.tiers.map((tier) => tier.id),
        },
      },
      orderBy: {
        lastUpdated: "desc",
      },
      take: 10, // Get top 10 users by usage
      include: {
        moduleTier: true,
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      module,
      usageStats,
    });
  } catch (error) {
    console.error("Error fetching module:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while fetching the module",
      },
      { status: 500 }
    );
  }
}


export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Authentication and Authorization
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }
    if (!user.isAdmin) {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    // 2. Validate Module Exists
    const { id } = params;
    const existingModule = await prisma.module.findUnique({
      where: { id },
      include: { tiers: true },
    });

    if (!existingModule) {
      return NextResponse.json(
        { success: false, message: "Module not found" },
        { status: 404 }
      );
    }

    // 3. Validate Content-Type
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { success: false, message: "Only multipart/form-data is accepted" },
        { status: 400 }
      );
    }

    // 4. Process Form Data
    const formData = await req.formData();
    const updatedTiers = [];
    const formattedName = existingModule.name.toLowerCase().replace(/\s+/g, "_");

    // 5. Process Each Tier Conditionally
    for (const tier of ["basic", "plus", "premium"] as const) {
      const zipFile = formData.get(`${tier}_zipFile`);
      
      // Skip if no file provided for this tier
      if (!zipFile || typeof zipFile !== "object" || !("arrayBuffer" in zipFile)) {
        continue;
      }

      try {
        // Upload new zip file
        const zipFileUrl = await uploadModuleZip(zipFile, id, tier);

        // Prepare tier data
        const tierData = {
          productId: `module_${formattedName}_${tier}`,
          entitlementId: `entitlement_${formattedName}_${tier}`,
          webviewUrl: `${process.env.WEBVIEW_URL}?module=${id}&tier=${tier}`,
          zipFileUrl,
          hasTextProduction: formData.get(`${tier}_hasTextProduction`) === "true",
          hasConclusion: formData.get(`${tier}_hasConclusion`) === "true",
          hasMap: formData.get(`${tier}_hasMap`) === "true",
          textProductionLimit: Number(formData.get(`${tier}_textLimit`) || 50),
          mapLimit: Number(formData.get(`${tier}_mapLimit`) || 0),
          conclusionLimit: Number(formData.get(`${tier}_conclutionLimit`) || 0),
          textProductionId: formData.get(`${tier}_textProductionId`) as string,
          mapId: formData.get(`${tier}_mapProductionId`) as string,
          conclusionId: formData.get(`${tier}_conclutionProductionId`) as string,
        };

        // Find existing tier
        const existingTier = existingModule.tiers.find(t => t.tier === tier);

        // Update or create tier
        const operation = existingTier
          ? prisma.moduleTier.update({
              where: { id: existingTier.id },
              data: tierData
            })
          : prisma.moduleTier.create({
              data: {
                moduleId: id,
                tier,
                ...tierData
              }
            });

        const resultTier = await operation;
        updatedTiers.push(resultTier);

      } catch (error) {
        console.error(`Error processing ${tier} tier:`, error);
        // Continue with other tiers even if one fails
      }
    }

    // 6. Return Final Response
    const completeModule = await prisma.module.findUnique({
      where: { id },
      include: { tiers: true },
    });

    return NextResponse.json({
      success: true,
      message: updatedTiers.length > 0
        ? "Module updated successfully"
        : "No tier files provided for update",
      module: completeModule,
      updatedTiers: updatedTiers.length > 0 ? updatedTiers : undefined
    });

  } catch (error) {
    console.error("Error updating module:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while updating the module",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE /api/admin/modules/[id] - Delete a module (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication and admin status
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    if (!user.isAdmin) {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    const { id } = params;

    // Check if the module exists
    const existingModule = await prisma.module.findUnique({
      where: { id },
    });

    if (!existingModule) {
      return NextResponse.json(
        { success: false, message: "Module not found" },
        { status: 404 }
      );
    }

    // Delete the module
    await prisma.module.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Module deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting module:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while deleting the module",
      },
      { status: 500 }
    );
  }
}
