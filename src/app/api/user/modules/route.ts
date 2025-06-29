/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getUserFromRequest } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const user = getUserFromRequest(req)
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentication required" }, 
        { status: 401 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const perPage = parseInt(searchParams.get('perPage') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'
    const sortBy = searchParams.get('sortBy') || 'name'
    const order = searchParams.get('order') || 'asc'

    // Build where clause
    const where: any = {
      userId: user.userId,
      OR: [
        { expiresAt: null }, // Never expires
        { expiresAt: { gt: new Date() } }, // Not expired yet
      ],
    }

    // Add search filter if provided
    if (search) {
      where.moduleTier = {
        module: {
          name: {
            contains: search,
            mode: 'insensitive'
          }
        }
      }
    }

    // Add status filter if not 'all'
    if (status !== 'all') {
      where.moduleTier = {
        ...where.moduleTier,
        module: {
          ...where.moduleTier?.module,
          status: status
        }
      }
    }

    // Get total count for pagination
    const total = await prisma.userModule.count({ where })

    // Get paginated modules
    const userModules = await prisma.userModule.findMany({
      where,
      include: {
        moduleTier: {
          include: {
            module: true,
            moduleUsage: true,
          },
        },
      },
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: {
        moduleTier: {
          module: {
            [sortBy]: order
          }
        }
      }
    })

    // Transform data to match frontend expectations
    const modules = userModules.map(um => ({
      id: um.moduleTier.module.id,
      name: um.moduleTier.module.name,
      description: um.moduleTier.module.description,
      status: um.moduleTier.module.status,
      createdAt: um.moduleTier.module.createdAt,
      updatedAt: um.moduleTier.module.updatedAt,
      iconUrl: um.moduleTier.module.iconUrl,
      tiers: [{
        id: um.moduleTier.id,
        tier: um.moduleTier.tier,
        productId: um.moduleTier.productId
      }]
    }))

    return NextResponse.json({
      data: modules,
      meta: {
        total,
        currentPage: page,
        perPage,
        nextPage: page < Math.ceil(total / perPage) ? page + 1 : null,
        totalPages: Math.ceil(total / perPage),
      }
    })

  } catch (error) {
    console.error("Error fetching user modules:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: "An error occurred while fetching user modules",
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}


export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const user = getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 })
    }

    // parse entitelments from the request body
    const { entitelments } = await req.json()

    if(!entitelments) {
      return NextResponse.json({ success: false, message: "No entitelments provided" }, { status: 400 })
    }

    // get module tiers from the productIds
    const moduleTiers = await prisma.moduleTier.findMany({
      where: {
        entitlementId: {
          in: entitelments
        },
        
      },
      include: {
        module: true,
      },
    });

    return NextResponse.json({
      success: true,
      moduleTiers,
    });
    
  } catch (error) {
    console.error("Error fetching user modules:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while fetching user modules" },
      { status: 500 },
    )
  }
}