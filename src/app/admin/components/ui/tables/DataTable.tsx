/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useState, useMemo } from "react"
import { Search,  Plus, ChevronDown, ChevronUp, Trash2, Edit } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pagination } from "../../Pagination"
import EditModal from "../../form/EditModal"


type DataTableProps<T> = {
  data: T[]
  columns: any,
  isLoading:boolean
  defaultSortField?: keyof T
  defaultSortDirection?: "asc" | "desc"
  setSearchTerm?:any
  sortField?:any,
  setSortField?:any
  searchTerm?:string,
  sortDirection?:any
  setSortDirection?:any,
  meta?:any
  itemsPerPage?: number
  searchableFields?: (keyof T)[]
  filterOptions?: {
    field: keyof T
    label: string
    options: { value: string; label: string }[]
  }[]
  onAdd?: () => void
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  onRowSelect?: (selectedItems: T[]) => void
  rowActions?: (row: T) => React.ReactNode
  title?: string
}

export function DataTable<T extends { id: number | string }>({
  data,
  columns,
  itemsPerPage = 5,
  searchableFields,
  searchTerm,
  sortField,
  setSortField,
  sortDirection,
  setSortDirection,
  isLoading,
  meta,
  onAdd,
  onEdit,
  onDelete,
  onRowSelect,
  rowActions,
  setSearchTerm,
  title,
}: DataTableProps<T>) {
  const [selectedRows, setSelectedRows] = useState<(number | string)[]>([])
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(data.length / itemsPerPage)
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return data.slice(startIndex, startIndex + itemsPerPage)
  }, [data, currentPage, itemsPerPage])

  const handleSort = (field: any) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
    setCurrentPage(1)
  }

  const handleSelectAll = (checked: boolean) => {
    const newSelected = checked ? paginatedData.map((item) => item.id) : []
    setSelectedRows(newSelected)
    if (onRowSelect) {
      onRowSelect(data.filter((item) => newSelected.includes(item.id)))
    }
  }

  const handleSelectRow = (itemId: number | string, checked: boolean) => {
    const newSelected = checked
      ? [...selectedRows, itemId]
      : selectedRows.filter((id) => id !== itemId)
    setSelectedRows(newSelected)
    if (onRowSelect) {
      onRowSelect(data.filter((item) => newSelected.includes(item.id)))
    }
  }

  const isAllSelected = paginatedData.length > 0 && paginatedData.every((item) => selectedRows.includes(item.id))
  const isSomeSelected = paginatedData.some((item) => selectedRows.includes(item.id))

  const SortIcon = ({ field }: { field: keyof T }) => {
    if (sortField !== field) return <ChevronDown className="w-4 h-4 text-gray-400" />
    return sortDirection === "asc" ? (
      <ChevronUp className="w-4 h-4 text-gray-600" />
    ) : (
      <ChevronDown className="w-4 h-4 text-gray-600" />
    )
  }

  //  for Edit

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentModule, setCurrentModule] = useState<any>({
    name: '',
    description: '',
    basic: { entitlement: '', text: '' },
    plus: { entitlement: '', text: '' },
    premium: { entitlement: '', text: '' }
  });

  const handleEditClick = (module:any) => {
    setCurrentModule(module);
    setIsEditModalOpen(true);
  };

 

  return (
    <div className="w-full bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
             

              {onAdd && (
                <Button size="sm" className="bg-slate-800 hover:bg-slate-700" onClick={onAdd}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add {title || "Item"}
                </Button>
              )}

              {selectedRows.length > 0 && (
                <span className="text-sm text-gray-600">
                  {selectedRows.length} row{selectedRows.length !== 1 ? "s" : ""} selected
                </span>
              )}
            </div>

            {searchableFields && (
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            )}
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                {onRowSelect && (
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
                )}
                {columns.map((column) => (
                  <TableHead key={column.id} className={column.width}>
                    {column.sortable ? (
                      <button
                        className="flex items-center gap-2 hover:text-gray-900"
                        onClick={() => handleSort(column.id as keyof T)}
                      >
                        {column.header}
                        <SortIcon field={column.id as keyof T} />
                      </button>
                    ) : (
                      column.header
                    )}
                  </TableHead>
                ))}
                {(onEdit || onDelete || rowActions) && <TableHead className="w-20">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((item) => (
                  <TableRow key={item.id} className="hover:bg-gray-50">
                    {onRowSelect && (
                      <TableCell>
                        <Checkbox
                          checked={selectedRows.includes(item.id)}
                          onCheckedChange={(checked) => handleSelectRow(item.id, checked as boolean)}
                        />
                      </TableCell>
                    )}
                    {columns.map((column) => {
                      const value = typeof column.accessor === "function" 
                        ? column.accessor(item) 
                        : item[column.accessor]
                      
                      return (
                        <TableCell key={`${item.id}-${column.id}`}>
                          {column.cell ? column.cell(value, item) : String(value)}
                        </TableCell>
                      )
                    })}
                    {(onEdit || onDelete || rowActions) && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {rowActions ? (
                            rowActions(item)
                          ) : (
                            <>
                              {onEdit && (
                                <Button variant="ghost" size="sm" onClick={() => handleEditClick(item)}>
                                  <Edit className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                                </Button>
                              )}
                              {onDelete && (
                                <Button variant="ghost" size="sm" onClick={() => onDelete(item)}>
                                  <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length + (onRowSelect ? 1 : 0) + ((onEdit || onDelete || rowActions) ? 1 : 0)} className="h-24 text-center">
                    No results found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

         <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={meta.total}
                    itemsPerPage={meta.perPage}
                    isLoading={isLoading}
                    onPageChange={(page) => setCurrentPage(page)}
                  />
        </div>
      </div>
            <EditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={currentModule}
      />
    </div>
  )
}