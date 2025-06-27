"use client"

import { useEffect, useRef } from "react"
import Highcharts from "highcharts"

export default function SubscriptionSalesChart() {
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (chartRef.current) {
      Highcharts.chart(chartRef.current, {
        chart: {
          type: "pie",
          backgroundColor: "transparent",
          height: 280,
          spacing: [0, 0, 0, 0],
        },
        title: {
          text: "",
        },
        credits: {
          enabled: false,
        },
        tooltip: {
          enabled: false,
        },
        legend: {
          enabled: false,
        },
        plotOptions: {
          pie: {
            innerSize: "65%",
            dataLabels: {
              enabled: false,
            },
            showInLegend: false,
            borderWidth: 0,
            states: {
              hover: {
                enabled: false,
              },
            },
          },
        },
        series: [
          {
            type: "pie",
            data: [
              {
                name: "Monthly",
                y: 251,
                color: "#4F46E5",
              },
              {
                name: "Yearly",
                y: 176,
                color: "#06B6D4",
              },
            ],
          },
        ],
      })
    }
  }, [])

  return (
    <div className="flex items-center justify-between">
      <div ref={chartRef} className="" />
      <div className="flex flex-col gap-6 ml-8">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-[#4F46E5]" />
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Monthly</span>
            <span className="text-xl font-semibold text-gray-900">251K</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-[#06B6D4]" />
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Yearly</span>
            <span className="text-xl font-semibold text-gray-900">176K</span>
          </div>
        </div>
      </div>
    </div>
  )
}
