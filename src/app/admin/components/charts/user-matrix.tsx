"use client"

import { useEffect, useRef } from "react"
import Highcharts from "highcharts"

export default function UserMatrixChart() {
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
          formatter: function() {
            return `<b>${this.name}</b>: ${this.y}K`
          },
          style: {
            fontSize: '12px'
          },
          borderWidth: 0,
          backgroundColor: 'rgba(255,255,255,0.9)',
          shadow: false
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
                halo: {
                  size: 5,
                  opacity: 0.1
                }
              }
            },
            point: {
              events: {
                mouseOver: function() {
                  this.series.chart.tooltip.refresh(this)
                }
              }
            }
          },
        },
        series: [
          {
            type: "pie",
            data: [
              {
                name: "New Users",
                y: 251,
                color: "#4F46E5",
              },
              {
                name: "New Subscriptions",
                y: 176,
                color: "#06B6D4",
              },
              {
                name: "Re-New Subscriptions",
                y: 176,
                color: "#10B981",
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
      <div className="flex flex-col gap-4 ml-8">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-[#4F46E5]" />
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">New Users</span>
            <span className="text-xl font-semibold text-gray-900">251K</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-[#06B6D4]" />
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">New Subscriptions</span>
            <span className="text-xl font-semibold text-gray-900">176K</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-[#10B981]" />
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Re-New Subscriptions</span>
            <span className="text-xl font-semibold text-gray-900">176K</span>
          </div>
        </div>
      </div>
    </div>
  )
}