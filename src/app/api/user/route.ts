import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    
    // Get all query parameters
    const searchTerm = searchParams.get('search')?.trim() || '';
    const email = searchParams.get('email');
    const profession = searchParams.get('profession');
    const country = searchParams.get('country');
    const city = searchParams.get('city');
    const isAdmin = searchParams.get('isAdmin');
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('perPage') || '10');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const order = (searchParams.get('order') || 'desc').toLowerCase() as 'asc' | 'desc';

    // Validate pagination
    if (isNaN(page) || page < 1) {
      return NextResponse.json(
        { error: "Invalid page number" },
        { status: 400 }
      );
    }

    if (isNaN(perPage) || perPage < 1 || perPage > 100) {
      return NextResponse.json(
        { error: "perPage must be between 1 and 100" },
        { status: 400 }
      );
    }

    // Validate sort fields against your User model
    const allowedSortFields = [
      'id', 'fullName', 'email', 'profession', 'country', 
      'city', 'isAdmin', 'createdAt', 'updatedAt', 'lastLoginAt'
    ];
    
    if (!allowedSortFields.includes(sortBy)) {
      return NextResponse.json(
        { error: `Invalid sortBy field. Allowed: ${allowedSortFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Build the where clause
    const where: Prisma.UserWhereInput = {
      AND: [
        email ? { email: { contains: email, mode: 'insensitive' as Prisma.QueryMode } } : {},
        profession ? { profession: { contains: profession, mode: 'insensitive' as Prisma.QueryMode } } : {},
        country ? { country: { contains: country, mode: 'insensitive' as Prisma.QueryMode } } : {},
        city ? { city: { contains: city, mode: 'insensitive' as Prisma.QueryMode } } : {},
        isAdmin ? { isAdmin: isAdmin === 'true' } : {},
        searchTerm ? {
          OR: [
            { fullName: { contains: searchTerm, mode: 'insensitive' as Prisma.QueryMode } },
            { email: { contains: searchTerm, mode: 'insensitive' as Prisma.QueryMode } },
            { profession: { contains: searchTerm, mode: 'insensitive' as Prisma.QueryMode } },
            { country: { contains: searchTerm, mode: 'insensitive' as Prisma.QueryMode } },
            { city: { contains: searchTerm, mode: 'insensitive' as Prisma.QueryMode } },
          ].filter(Boolean) as Prisma.UserWhereInput['OR']
        } : {}
      ].filter(condition => Object.keys(condition).length > 0)
    };

    // Get total count for pagination
    const total = await prisma.user.count({ where });

    // Get paginated results (excluding password)
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        fullName: true,
        email: true,
        profession: true,
        country: true,
        city: true,
        deviceId: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        // Exclude password and relations unless needed
      },
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: {
        [sortBy]: order
      }
    });

    return NextResponse.json({
      data: users,
      meta: {
        total,
        currentPage: page,
        perPage,
        nextPage: page < Math.ceil(total / perPage) ? page + 1 : null,
        totalPages: Math.ceil(total / perPage),
      }
    });

  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}