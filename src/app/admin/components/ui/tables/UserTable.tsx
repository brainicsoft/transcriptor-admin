"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import avatar from '@/assets/avatar.jpg'
import { Search, Filter, Plus, ChevronDown, ChevronUp, Trash2, Edit, ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Mock data
const mockUsers = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@gmail.com",
    address: "4600 E Silver Springs Blvd",
    subscription: "No Plan",
    lastRunTime: "Few Minutes Ago",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    name: "John Doe",
    email: "john.doe@gmail.com",
    address: "4600 E Silver Springs Blvd",
    subscription: "Active",
    lastRunTime: "Few Minutes Ago",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    name: "John Doe",
    email: "john.doe@gmail.com",
    address: "4600 E Silver Springs Blvd",
    subscription: "Trial Plan",
    lastRunTime: "Few Minutes Ago",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 4,
    name: "Jane Smith",
    email: "jane.smith@gmail.com",
    address: "1234 Main Street",
    subscription: "Active",
    lastRunTime: "1 Hour Ago",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 5,
    name: "Bob Johnson",
    email: "bob.johnson@gmail.com",
    address: "5678 Oak Avenue",
    subscription: "No Plan",
    lastRunTime: "2 Hours Ago",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 6,
    name: "Alice Brown",
    email: "alice.brown@gmail.com",
    address: "9012 Pine Road",
    subscription: "Trial Plan",
    lastRunTime: "3 Hours Ago",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 7,
    name: "Charlie Wilson",
    email: "charlie.wilson@gmail.com",
    address: "3456 Elm Street",
    subscription: "Active",
    lastRunTime: "4 Hours Ago",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 8,
    name: "Diana Davis",
    email: "diana.davis@gmail.com",
    address: "7890 Maple Drive",
    subscription: "No Plan",
    lastRunTime: "5 Hours Ago",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

type SortField = "name" | "address" | "subscription" | "lastRunTime"
type SortDirection = "asc" | "desc"

export default function UsersTable() {
  const [selectedRows, setSelectedRows] = useState<number[]>([1, 2, 3])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<SortField>("name")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [subscriptionFilter, setSubscriptionFilter] = useState<string>("")

  const itemsPerPage = 5
  const totalPages = Math.ceil(mockUsers.length / itemsPerPage)

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    const filtered = mockUsers.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.address.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesSubscription = !subscriptionFilter || user.subscription === subscriptionFilter

      return matchesSearch && matchesSubscription
    })

    // Sort data
    filtered.sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]

      if (sortDirection === "asc") {
        return aValue.localeCompare(bValue)
      } else {
        return bValue.localeCompare(aValue)
      }
    })

    return filtered
  }, [searchTerm, sortField, sortDirection, subscriptionFilter])

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredAndSortedData.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredAndSortedData, currentPage])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(paginatedData.map((user) => user.id))
    } else {
      setSelectedRows([])
    }
  }

  const handleSelectRow = (userId: number, checked: boolean) => {
    if (checked) {
      setSelectedRows([...selectedRows, userId])
    } else {
      setSelectedRows(selectedRows.filter((id) => id !== userId))
    }
  }

  const isAllSelected = paginatedData.length > 0 && paginatedData.every((user) => selectedRows.includes(user.id))
  const isSomeSelected = paginatedData.some((user) => selectedRows.includes(user.id))

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronDown className="w-4 h-4 text-gray-400" />
    return sortDirection === "asc" ? (
      <ChevronUp className="w-4 h-4 text-gray-600" />
    ) : (
      <ChevronDown className="w-4 h-4 text-gray-600" />
    )
  }

  return (
    <div className="w-full bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setSubscriptionFilter("")}>All Subscriptions</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSubscriptionFilter("Active")}>Active</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSubscriptionFilter("Trial Plan")}>Trial Plan</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSubscriptionFilter("No Plan")}>No Plan</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button size="sm" className="bg-slate-800 hover:bg-slate-700">
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>

              {selectedRows.length > 0 && (
                <span className="text-sm text-gray-600">
                  {selectedRows.length} row{selectedRows.length !== 1 ? "s" : ""} selected
                </span>
              )}
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-12">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    ref={(el) => {
                      if (el && "indeterminate" in el) {
                        (el as HTMLInputElement).indeterminate = isSomeSelected && !isAllSelected
                      }
                    }}
                  />
                </TableHead>
                <TableHead>
                  <button className="flex items-center gap-2 hover:text-gray-900" onClick={() => handleSort("name")}>
                    User
                    <SortIcon field="name" />
                  </button>
                </TableHead>
                <TableHead>
                  <button className="flex items-center gap-2 hover:text-gray-900" onClick={() => handleSort("address")}>
                    Address
                    <SortIcon field="address" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    className="flex items-center gap-2 hover:text-gray-900"
                    onClick={() => handleSort("subscription")}
                  >
                    Subscription
                    <SortIcon field="subscription" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    className="flex items-center gap-2 hover:text-gray-900"
                    onClick={() => handleSort("lastRunTime")}
                  >
                    Last Run Time
                    <SortIcon field="lastRunTime" />
                  </button>
                </TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((user) => (
                <TableRow key={user.id} className="hover:bg-gray-50">
                  <TableCell>
                    <Checkbox
                      checked={selectedRows.includes(user.id)}
                      onCheckedChange={(checked) => handleSelectRow(user.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Image
                        src={avatar}
                        alt={user.name}
                        width={40}
                        height={40}
                        className="rounded-full w-10 h-10"
                      />
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">{user.address}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        user.subscription === "Active"
                          ? "bg-green-100 text-green-800"
                          : user.subscription === "Trial Plan"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {user.subscription}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-600">{user.lastRunTime}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>

            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
