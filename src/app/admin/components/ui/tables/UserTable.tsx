/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import avatar from '@/assets/avatar.jpg'
import { Search, Filter, Plus, ChevronDown, ChevronUp, Trash2, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getData, deleteData } from "@/app/axios/fetching"
import DynamicModal from "../../form/DynamicModal"
import { Pagination } from "../../Pagination"
import { User } from "@/@types/user.interface"
import { useRouter } from "next/navigation"
import { UserDetailsModal } from "../../form/UserDetailsModal"

type SortField = "fullName" | "email" | "profession" | "country" | "city" | "createdAt" | "lastLoginAt"
type SortDirection = "asc" | "desc"

export default function UsersTable() {
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<SortField>("fullName")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [professionFilter, setProfessionFilter] = useState<string>("")
  const [countryFilter, setCountryFilter] = useState<string>("")
  const [users, setUsers] = useState<User[]>([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

// Add this handler
const handleRowClick = (user: User) => {
  setSelectedUser(user);
  setIsDetailsModalOpen(true);
};
  const itemsPerPage = 10
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    fields: [],
    endpoint: '',
    method: 'GET' as 'POST' | 'PATCH' | 'PUT' | 'GET',
    buttonText: '',
    initialData: {} as any,
  });

  // Field configurations
  const userFields: any = [
    {
      name: 'fullName',
      label: 'Full Name',
      type: 'text',
      required: true
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      required: true
    },
    {
      name: 'profession',
      label: 'Profession',
      type: 'text'
    },
    {
      name: 'country',
      label: 'Country',
      type: 'text'
    },
    {
      name: 'city',
      label: 'City',
      type: 'text'
    }
  ];

  const openModal = (config: {
    title: string;
    fields: any;
    endpoint: string;
    method: 'POST' | 'PATCH' | 'PUT' | 'GET';
    buttonText: string;
    initialData?: any;
  }) => {
    setModalConfig({ 
      ...config, 
      isOpen: true, 
      initialData: config.initialData !== undefined ? config.initialData : {} 
    });
  };

  const closeModal = () => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  // Fetch data from API
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          perPage: itemsPerPage.toString(),
          search: searchTerm,
          sortBy: sortField,
          order: sortDirection,
          ...(professionFilter && { profession: professionFilter }),
          ...(countryFilter && { country: countryFilter })
        })

        const response = await getData(`/user?${params.toString()}`)
        setUsers(response.data)
        setTotalUsers(response.meta.total)
      } catch (error) {
        console.error("Error fetching users:", error)
       alert("Failed to fetch users")
      } finally {
        setIsLoading(false)
      }
    }

    const debounceTimer = setTimeout(() => {
      fetchUsers()
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchTerm, sortField, sortDirection, currentPage, professionFilter, countryFilter])

  const totalPages = Math.ceil(totalUsers / itemsPerPage)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
    setCurrentPage(1)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(users.map((user) => user.id))
    } else {
      setSelectedRows([])
    }
  }

  const handleSelectRow = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedRows([...selectedRows, userId])
    } else {
      setSelectedRows(selectedRows.filter((id) => id !== userId))
    }
  }

  const handleCreateUser = () => {
    openModal({
      title: 'Create New User',
      fields: userFields,
      endpoint: '/api/auth/signup',
      method: 'POST',
      buttonText: 'Create User',
      initialData: {}
    });
  };

  const handleEditUser = (user: User) => {
    // Remove password field for edit
    const editFields = userFields.filter(field => field.name !== 'password');
    
    openModal({
      title: 'Edit User',
      fields: editFields,
      endpoint: `/api/user/${user.id}`,
      method: 'PATCH',
      buttonText: 'Update User',
      initialData: user
    });
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteData(`/user/${userId}`);
     alert("User deleted successfully");
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      setTotalUsers(prev => prev - 1);
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return;
    
    try {
      await Promise.all(selectedRows.map(id => deleteData(`/user/${id}`)));
     alert(`${selectedRows.length} user(s) deleted successfully`);
      setUsers(prevUsers => prevUsers.filter(user => !selectedRows.includes(user.id)));
      setTotalUsers(prev => prev - selectedRows.length);
      setSelectedRows([]);
    } catch (error) {
      console.error("Error deleting users:", error);
      alert("Failed to delete users");
    }
  };

  const handleModalSuccess = () => {
    closeModal();
    // Refresh the data
    router.refresh();
  };

  const isAllSelected = users?.length > 0 && users.every((user) => selectedRows.includes(user.id))
  const isSomeSelected = users?.some((user) => selectedRows.includes(user.id))

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronDown className="w-4 h-4 text-gray-400" />
    return sortDirection === "asc" ? (
      <ChevronUp className="w-4 h-4 text-gray-600" />
    ) : (
      <ChevronDown className="w-4 h-4 text-gray-600" />
    )
  }

  const formatAddress = (user: User) => {
    return [user.city, user.country].filter(Boolean).join(", ") || "N/A"
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never logged in"
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString()
  }

  return (
    <div className="w-full min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="max-h-96 overflow-y-auto">
                <DropdownMenuItem onClick={() => setProfessionFilter("")}>All Professions</DropdownMenuItem>
                {Array.from(new Set(users.map(u => u.profession).filter(Boolean))).map(prof => (
                  <DropdownMenuItem key={prof} onClick={() => setProfessionFilter(prof!)}>
                    {prof}
                  </DropdownMenuItem>
                ))}

                <DropdownMenuItem onClick={() => setCountryFilter("")}>All Countries</DropdownMenuItem>
                {Array.from(new Set(users.map(u => u.country).filter(Boolean))).map(country => (
                  <DropdownMenuItem key={country} onClick={() => setCountryFilter(country!)}>
                    {country}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button onClick={handleCreateUser} size="sm" className="bg-slate-800 hover:bg-slate-700">
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>

            {selectedRows.length > 0 && (
              <Button 
                onClick={handleBulkDelete}
                variant="destructive" 
                size="sm"
                className="ml-2"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected
              </Button>
            )}

            {selectedRows.length > 0 && (
              <span className="text-sm text-gray-600">
                {selectedRows.length} row{selectedRows.length !== 1 ? "s" : ""} selected
              </span>
            )}
          </div>

          <div className="relative">
            <Search className="w-4  absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by name, email, or address"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-10 py-2 w-64 bg-white border-indigo-500 outline-none focus:outline-none"
            />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border">
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
                  <button className="flex items-center gap-2 hover:text-gray-900" onClick={() => handleSort("fullName")}>
                    Name
                    <SortIcon field="fullName" />
                  </button>
                </TableHead>
                <TableHead>
                  <button className="flex items-center gap-2 hover:text-gray-900" onClick={() => handleSort("email")}>
                    Email
                    <SortIcon field="email" />
                  </button>
                </TableHead>
                <TableHead>
                  <button className="flex items-center gap-2 hover:text-gray-900" onClick={() => handleSort("profession")}>
                    Profession
                    <SortIcon field="profession" />
                  </button>
                </TableHead>
                <TableHead>
                  <button className="flex items-center gap-2 hover:text-gray-900" onClick={() => handleSort("city")}>
                    Address
                    <SortIcon field="city" />
                  </button>
                </TableHead>
                <TableHead>
                  <button className="flex items-center gap-2 hover:text-gray-900" onClick={() => handleSort("lastLoginAt")}>
                    Last Login
                    <SortIcon field="lastLoginAt" />
                  </button>
                </TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
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
                          alt={user.fullName}
                          width={40}
                          height={40}
                          className="rounded-full w-10 h-10"
                        />
                        <div>
                          <div className="font-medium cursor-pointer text-blue-600"   onClick={() => handleRowClick(user)} >{user.fullName}</div>
                          {user.isAdmin && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                              Admin
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">{user.email}</TableCell>
                    <TableCell className="text-gray-600">{user.profession || "N/A"}</TableCell>
                    <TableCell className="text-gray-600">{formatAddress(user)}</TableCell>
                    <TableCell className="text-gray-600">{formatDate(user.lastLoginAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalUsers}
            itemsPerPage={itemsPerPage}
            isLoading={isLoading}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </div>
      <DynamicModal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        title={modalConfig.title}
        fields={modalConfig.fields}
        endpoint={modalConfig.endpoint}
        method={modalConfig.method}
        buttonText={modalConfig.buttonText}
        initialData={modalConfig.initialData}
        onSuccess={handleModalSuccess}
      />
      <UserDetailsModal
  isOpen={isDetailsModalOpen}
  onClose={() => setIsDetailsModalOpen(false)}
  user={{
    fullName: selectedUser?.fullName || "",
    email: selectedUser?.email || "",
    createdAt: selectedUser?.createdAt 
      ? new Date(selectedUser.createdAt).toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        }) 
      : "",
    address: formatAddress(selectedUser || {} as User),
    packages: [
      {
        name: "Transcriptor Basic",
        description: "A module for transcription",
        status: "active",
      },
      {
        name: "Transcriptor Plus",
        description: "A module for transcription",
        status: "active",
      },
    ],
  }}
/>
    </div>
  )
}