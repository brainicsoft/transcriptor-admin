/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { DataTable } from "../components/ui/tables/DataTable"

const moduleColumns = [
  {
    id: "name",
    header: "Module Name",
    accessor: "name",
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
          value === "Active"
            ? "bg-green-100 text-green-800"
            : "bg-gray-100 text-gray-800"
        }`}
      >
        {value}
      </span>
    ),
  },
  {
    id: "lastUpdated",
    header: "Last Updated",
    accessor: "lastUpdated",
    sortable: true,
  },
  {
    id: "users",
    header: "Active Users",
    accessor: "users",
    sortable: true,
  },
]

const moduleFilterOptions = [
  {
    field: "status",
    label: "Status",
    options: [
      { value: "all", label: "All Statuses" },
      { value: "Active", label: "Active" },
      { value: "Inactive", label: "Inactive" },
    ],
  },
]
const  modules = [
    { id: 1, name: "John Doe", email: "john@example.com" },
  { id: 2, name: "Jane Smith", email: "jane@example.com" }
]

export default function ModulesTable() {
  const handleAddModule = () => {
    // Add module logic
      console.log(modules)
  }

  const handleEditModule = (module: any) => {
    // Edit module logic
      console.log(module)
  }

  const handleDeleteModule = (module: any) => {
    console.log(module)
    // Delete module logic
  }

  return (
    <div>
      <DataTable
      data={modules}
      columns={moduleColumns}
      title="Module"
      searchableFields={["name"]}
      filterOptions={moduleFilterOptions}
      onAdd={handleAddModule}
      onEdit={handleEditModule}
      onDelete={handleDeleteModule}
    />
    </div>
  )
}