// app/api/overview/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get all statistics in parallel
    const [
      totalUsers,
      activeModules,
      holdModules,
      monthlyEarnings,
      yearlyEarnings,
      newUsers,
      newSubscriptions,
      renewSubscriptions
    ] = await Promise.all([
      prisma.user.count(),
      prisma.module.count({
        where: { status: 'active' }
      }),

      prisma.module.count({
        where: { status: 'hold' }
      }),
      calculateEarnings('monthly'),

      // Yearly Earnings (example calculation)
      calculateEarnings('yearly'),

      // New Users (last 30 days)
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setDate(new Date().getDate() - 30))
          }
        }
      }),

      // New Subscriptions (last 30 days)
      prisma.userPackage.count({
        where: {
          assignedAt: {
            gte: new Date(new Date().setDate(new Date().getDate() - 30))
          }
        }
      }),

      // Renewed Subscriptions (last 30 days)
      prisma.userPackage.count({
        where: {
          expiresAt: {
            gte: new Date(),
          },
          assignedAt: {
            gte: new Date(new Date().setDate(new Date().getDate() - 30))
          }
        }
      })
    ]);

    // Format the response to match your UI
    const response = {
      totalUsers,
      subscriptionSales: {
        activeModules,
        holdModules,
        earningThisMonth: monthlyEarnings
      },
      viewDetails: {
        monthly: monthlyEarnings,
        yearly: yearlyEarnings
      },
      userMatrix: {
        newUsers,
        newSubscriptions,
        renewSubscriptions
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching overview data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch overview data' },
      { status: 500 }
    );
  }
}

// Helper function to calculate earnings (mock implementation)
async function calculateEarnings(period: 'monthly' | 'yearly'): Promise<number> {
  // In a real implementation, you would query your payment system
  // This is a mock implementation that returns random values
  
  if (period === 'monthly') {
    // Mock monthly earnings calculation
    const activeSubscriptions = await prisma.userPackage.count();
    return activeSubscriptions * 10; // $10 per subscription
  } else {
    // Mock yearly earnings calculation
    const activeSubscriptions = await prisma.userPackage.count();
    return activeSubscriptions * 100; // $100 per subscription
  }
}