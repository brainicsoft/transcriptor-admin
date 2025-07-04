// components/dashboard/skeletons/dashboard-skeleton.tsx
"use client"

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: "#f5f5f9" }}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white border-0 shadow-sm rounded-lg p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2 w-full">
                  {/* Title Skeleton */}
                  <div 
                    className="h-8 w-3/4 rounded-md bg-gray-200 animate-pulse"
                    style={{ animationDuration: '2s', animationIterationCount: 'infinite' }}
                  />
                  {/* Subtitle Skeleton */}
                  <div 
                    className="h-4 w-full rounded-md bg-gray-200 animate-pulse"
                    style={{ animationDuration: '2s', animationIterationCount: 'infinite' }}
                  />
                </div>
                {/* Icon Skeleton */}
                <div 
                  className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"
                  style={{ animationDuration: '2s', animationIterationCount: 'infinite' }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white border-0 shadow-sm rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                {/* Chart Title Skeleton */}
                <div 
                  className="h-6 w-1/3 rounded-md bg-gray-200 animate-pulse"
                  style={{ animationDuration: '2s', animationIterationCount: 'infinite' }}
                />
                {/* View Details Skeleton */}
                <div 
                  className="h-4 w-20 rounded-md bg-gray-200 animate-pulse"
                  style={{ animationDuration: '2s', animationIterationCount: 'infinite' }}
                />
              </div>
              <div className="flex items-center justify-between h-[280px]">
                {/* Main Chart Area Skeleton */}
                <div 
                  className="h-full w-1/2 rounded-md bg-gray-200 animate-pulse"
                  style={{ animationDuration: '2s', animationIterationCount: 'infinite' }}
                />
                <div className="space-y-6 ml-8 w-1/2">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="flex items-center gap-3">
                      {/* Legend Color Skeleton */}
                      <div 
                        className="h-3 w-3 rounded-full bg-gray-200 animate-pulse"
                        style={{ animationDuration: '2s', animationIterationCount: 'infinite' }}
                      />
                      <div className="space-y-1">
                        {/* Legend Label Skeleton */}
                        <div 
                          className="h-4 w-24 rounded-md bg-gray-200 animate-pulse"
                          style={{ animationDuration: '2s', animationIterationCount: 'infinite' }}
                        />
                        {/* Legend Value Skeleton */}
                        <div 
                          className="h-6 w-12 rounded-md bg-gray-200 animate-pulse"
                          style={{ animationDuration: '2s', animationIterationCount: 'infinite' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}