import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { getUserFromRequest } from "@/lib/auth"; // assumed
import { prisma } from "@/lib/prisma"; // assumed

export async function GET(req: NextRequest) {
  // Get user from request
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Authentication required" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const module = searchParams.get("module");
  const tier = searchParams.get("tier");

  // Check for required params
  if (!module || !tier) {
    return NextResponse.json(
      { success: false, message: "Missing required parameters: module or tier" },
      { status: 400 }
    );
  }

  // Get tier ID
  const tierData = await prisma.moduleTier.findFirst({
    where: { moduleId: module },
    select: { id: true },
  });

  if (!tierData) {
    return NextResponse.json(
      { success: false, message: "Module tier not found" },
      { status: 404 }
    );
  }

  // Get module usage for user
  const moduleUsage = await prisma.moduleUsage.findFirst({
    where: {
      userId: user.userId,
      moduleTierId: tierData.id,
    },
    include: {
      moduleTier: true,
    },
  });

  if (!moduleUsage) {
    return NextResponse.json(
      { success: false, message: "Subscription expired" },
      { status: 404 }
    );
  }

  // Usage limits
  const {
    textProductionCount,
    conclusionCount,
    mapCount,
    moduleTier: {
      textProductionLimit,
      conclusionLimit,
      mapLimit,
      moduleId,
    },
  } = moduleUsage;

  const textLimitReached = textProductionLimit !== -1 && textProductionCount >= textProductionLimit;
  const conclusionLimitReached = conclusionLimit !== -1 && conclusionCount >= conclusionLimit;
  const mapLimitReached = mapLimit !== -1 && mapCount >= mapLimit;

  // Optional: Enforce restriction
  // Uncomment if you want to block when any limit is exceeded
  // if (textLimitReached || conclusionLimitReached || mapLimitReached) {
  //   return NextResponse.json({
  //     success: false,
  //     message: "You cannot access this.",
  //     moduleTier: moduleUsage.moduleTier,
  //   }, { status: 403 });
  // }

  // Construct file path
  const indexPath = path.join(
    process.cwd(),
    "public",
    "modules",
    moduleId,
    tier,
    "index.html"
  );

  try {
    let fileContent = await fs.readFile(indexPath, "utf-8");
    fileContent = fileContent.replace("{{TOKEN}}", user?.token || "");
    return new NextResponse(fileContent, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: `Module not found or missing index.html: ${indexPath}` },
      { status: 404 }
    );
  }
}
