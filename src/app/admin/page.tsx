"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import SubscriptionSalesChart from "./components/charts/subscription-sale"
import UserMatrixChart from "./components/charts/user-matrix"
import { useEffect, useState } from "react"
import { getData } from "../axios/fetching"
import { DashboardSkeleton } from "./Skeleton"
import { StatsGrid } from "./components/ui/Stats"

interface DashboardData {
  totalUsers: number
  subscriptionSales: {
    activeModules: number
    holdModules: number
    earningThisMonth: number
  }
  viewDetails: {
    monthly: number
    yearly: number
  }
  userMatrix: {
    newUsers: number
    newSubscriptions: number
    renewSubscriptions: number
  }
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getData('/admin/overview')
        setData(response)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: "#f5f5f9" }}>
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <p className="text-red-500">Error: {error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: "#f5f5f9" }}>
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500">No data available</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: "#f5f5f9" }}>
      <div className="max-w-7xl mx-auto space-y-6">
        <StatsGrid data={data} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white border-0 shadow-sm rounded-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900">Subscription Sales</CardTitle>
                <button className="text-sm text-gray-500 hover:text-gray-700 transition-colors">View Details</button>
              </div>
            </CardHeader>
            <CardContent className="pb-6">
              {data.viewDetails.monthly > 0 || data.viewDetails.yearly > 0 ? (
                <SubscriptionSalesChart 
                  monthly={data.viewDetails.monthly} 
                  yearly={data.viewDetails.yearly} 
                />
              ) : (
                <div className="h-[280px] flex items-center justify-center text-gray-400">
                  No subscription data available
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm rounded-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900">Users & Subscription Matrix</CardTitle>
            </CardHeader>
            <CardContent className="pb-6">
              {data.userMatrix.newUsers > 0 || 
               data.userMatrix.newSubscriptions > 0 || 
               data.userMatrix.renewSubscriptions > 0 ? (
                <UserMatrixChart 
                  newUsers={data.userMatrix.newUsers}
                  newSubscriptions={data.userMatrix.newSubscriptions}
                  renewSubscriptions={data.userMatrix.renewSubscriptions}
                />
              ) : (
                <div className="h-[280px] flex items-center justify-center text-gray-400">
                  No user matrix data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}