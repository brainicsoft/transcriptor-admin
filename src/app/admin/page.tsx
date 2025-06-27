"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import SubscriptionSalesChart from "./components/charts/subscription-sale"
import UserMatrixChart from "./components/charts/user-matrix"
import StatsGrid from "./components/ui/Stats"

export default function Dashboard() {
  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: "#f5f5f9" }}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* KPI Cards */}
        <StatsGrid/>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Subscription Sales Chart */}
          <Card className="bg-white border-0 shadow-sm rounded-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900">Subscription Sales</CardTitle>
                <button className="text-sm text-gray-500 hover:text-gray-700 transition-colors">View Details</button>
              </div>
            </CardHeader>
            <CardContent className="pb-6">
              <SubscriptionSalesChart />
            </CardContent>
          </Card>

          {/* Users & Subscription Matrix Chart */}
          <Card className="bg-white border-0 shadow-sm rounded-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900">Users & Subscription Matrix</CardTitle>
            </CardHeader>
            <CardContent className="pb-6">
              <UserMatrixChart />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
