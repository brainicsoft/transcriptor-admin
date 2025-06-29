/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { DataTable } from "../components/ui/tables/DataTable"
import { getData } from "@/app/axios/fetching"

interface Module {
  id: string
  name: string
  description?: string
  status: string
  createdAt: string
  updatedAt: string
  iconUrl?: string
  tiers?: ModuleTier[]
}

interface ModuleTier {
  id: string
  tier: string
  productId: string
  // Add other tier fields as needed
}

const moduleColumns = [
  {
    id: "name",
    header: "Module Name",
    accessor: "name",
    sortable: true,
  },
  {
    id: "id",
    header: "Module ID",
    accessor: "id",
    sortable: true,
  },
  {
    id: "status",
    header: "Status",
    accessor: "status",
    sortable: true,
    cell: (value: string) => (
      <span
        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value === "active"
            ? "bg-green-100 text-green-800"
            : value === "hold"
            ? "bg-yellow-100 text-yellow-800"
            : "bg-gray-100 text-gray-800"
        }`}
      >
        {value.charAt(0).toUpperCase() + value.slice(1)}
      </span>
    ),
  },
  {
    id: "tiers",
    header: "Tiers",
    accessor: (module: Module) => module.tiers?.map(t => t.tier).join(", ") || "None",
    sortable: false,
  },
  {
    id: "createdAt",
    header: "Created At",
    accessor: "createdAt",
    sortable: true,
    cell: (value: string) => new Date(value).toLocaleDateString(),
  },
  {
    id: "updatedAt",
    header: "Last Updated",
    accessor: "updatedAt",
    sortable: true,
    cell: (value: string) => new Date(value).toLocaleDateString(),
  },
]

const moduleFilterOptions = [
  {
    field: "status",
    label: "Status",
    options: [
      { value: "all", label: "All Statuses" },
      { value: "active", label: "Active" },
      { value: "hold", label: "On Hold" },
    ],
  },
]

export default function ModulesTable() {
  const [modules, setModules] = useState<Module[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState("all")
  const itemsPerPage = 10
  const [totalModules, setTotalModules] = useState(0)

  const fetchModules = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        perPage: itemsPerPage.toString(),
        search: searchTerm,
        ...(statusFilter !== "all" && { status: statusFilter }),
      })

      const response = await getData(`/admin/modules?${params.toString()}`)
      setModules(response.data)
      setTotalModules(response.meta.total)
    } catch (error) {
      console.error("Error fetching modules:", error)
      alert("Failed to fetch modules")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchModules()
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchTerm, currentPage, statusFilter])

  const handleAddModule = () => {
    // Add module logic
    console.log("Add module clicked")
  }

  const handleEditModule = (module: Module) => {
    // Edit module logic
    console.log("Edit module:", module)
  }

  const handleDeleteModule = (module: Module) => {
    // Delete module logic
    console.log("Delete module:", module)
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
    setCurrentPage(1) // Reset to first page when filter changes
  }

  return (
    <div>
      <DataTable
        data={modules}
        columns={moduleColumns}
        title="Modules"
        setSearchTerm={setSearchTerm}
        searchTerm={searchTerm}
        searchableFields={["name"]}
        filterOptions={moduleFilterOptions}
        onAdd={handleAddModule}
        onEdit={handleEditModule}
        onDelete={handleDeleteModule}
        isLoading={isLoading}
        pagination={{
          currentPage,
          totalItems: totalModules,
          itemsPerPage,
          onPageChange: setCurrentPage,
        }}
        onFilterChange={(field, value) => {
          if (field === "status") handleStatusFilterChange(value)
        }}
      />
    </div>
  )
}