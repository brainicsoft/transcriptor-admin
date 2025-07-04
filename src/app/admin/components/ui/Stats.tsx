// components/ui/Stats.tsx
"use client"
import { Card, CardContent } from '@/components/ui/card';
import { Users, Box, PauseCircle, DollarSign } from 'lucide-react';

interface StatsGridProps {
  data: {
    totalUsers: number
    subscriptionSales: {
      activeModules: number
      holdModules: number
      earningThisMonth: number
    }
  }
}

export function StatsGrid({ data }: StatsGridProps) {
  const statsData = [
    {
      title: "Total Users",
      value: data.totalUsers,
      icon: <Users className="h-5 w-5" />,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    },
    {
      title: "Active Modules",
      value: data.subscriptionSales.activeModules,
      icon: <Box className="h-5 w-5" />,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    },
    {
      title: "Modules on Hold",
      value: data.subscriptionSales.holdModules,
      icon: <PauseCircle className="h-5 w-5" />,
      color: "text-amber-600",
      bgColor: "bg-amber-50"
    },
    {
      title: "Earning This Month",
      value: data.subscriptionSales.earningThisMonth,
      icon: <DollarSign className="h-5 w-5" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat, index) => (
        <StatCard 
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          color={stat.color}
          bgColor={stat.bgColor}
        />
      ))}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

function StatCard({ title, value, icon, color, bgColor }: StatCardProps) {
  return (
    <Card className="bg-white border-0 shadow-sm rounded-lg hover:shadow-md transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {value > 0 ? value : 0}
            </div>
            <div className="text-sm text-gray-500">{title}</div>
          </div>
          <div className={`p-3 rounded-full ${bgColor} ${color}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}