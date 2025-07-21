/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-assign-module-variable */
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { getUserFromRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
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
  // const tierId = searchParams.get("tierId");

  if (!tier) {
    return NextResponse.json(
      { error: "Tier param is required" },
      { status: 400 }
    );
  }

  if (!module) {
    return NextResponse.json(
      { error: "Module param is required" },
      { status: 400 }
    );
  }
  const {id} = await prisma.moduleTier.findFirst({
    where: {
      moduleId: module,
    },
    select: {
      id: true,
    },
  });
  const moduleUsage = await prisma.moduleUsage.findFirst({
    where: {
      userId: user.userId,
      moduleTierId: id,
    },
    include: {
      moduleTier: true, // populate related tier info
    },
  });
  if (!moduleUsage) {
    return NextResponse.json({
      success: false,
      message: "subscription expired ",
    }, { status: 404 });
  }


  // Destructure for cleaner logic
  const {
    textProductionCount,
    conclusionCount,
    mapCount,
    moduleTier: {
      textProductionLimit,
      conclusionLimit,
      mapLimit,
    },
  } = moduleUsage;

  // ❌ If any limit is reached (and not -1), block access
  const textLimitReached = textProductionLimit !== -1 && textProductionCount >= textProductionLimit;
  const conclusionLimitReached = conclusionLimit !== -1 && conclusionCount >= conclusionLimit;
  const mapLimitReached = mapLimit !== -1 && mapCount >= mapLimit;

  // if (textLimitReached || conclusionLimitReached || mapLimitReached) {
  //   return NextResponse.json({
  //     success: false,
  //     message: "You cannot access this.",
  //     moduleTier: moduleUsage.moduleTier,
  //   });
  // }

  if (!tier) {
    return NextResponse.json(
      { error: "Tier param is required" },
      { status: 400 }
    );
  }

  // check if user has access to the module
  // user is already declared above

  //  need to uses restiction

  const indexPath = path.join(
    process.cwd(),
    "public",
    "modules",
    moduleUsage.moduleTier.moduleId,
    tier,
    "index.html"
  );


  try {
    let fileContent = await fs.readFile(indexPath, "utf-8");
    fileContent = fileContent.replace("{{TOKEN}}", user?.token || "");
    return new NextResponse(fileContent, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Module not found or missing index.html" + `${indexPath}` },
      { status: 404 }
    );
  }
}
