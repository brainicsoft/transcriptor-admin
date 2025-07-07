/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { DataTable } from "../components/ui/tables/DataTable"
import { deleteData, getData } from "@/app/axios/fetching"
import DynamicModal from "../components/form/DynamicModal"

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

const moduleFields: FieldConfig[] = [
  {
    name: 'name',
    label: 'Module Name',
    type: 'text',
    required: true
  },
  {
    name: 'description',
    label: 'Description',
    type: 'text',
    required: false
  },
  // {
  //   name: 'basic_hasTextProduction',
  //   label: 'Has Text Production',
  //   type: 'select',
  //   required: true,
  //   options: [
  //     { value: 'true', label: 'Yes' },
  //     { value: 'false', label: 'No' }
  //   ]
  // },
  //   {
  //   name: 'basic_hasConclusion',
  //   label: 'Basic Conclution',
  //   type: 'select',
  //   required: true,
  //   options: [
  //     { value: 'true', label: 'Yes' },
  //     { value: 'false', label: 'No' }
  //   ]
  // },
  //     {
  //   name: 'basic_hasMap',
  //   label: 'Basic Hashmap',
  //   type: 'select',
  //   required: true,
  //   options: [
  //     { value: 'true', label: 'Yes' },
  //     { value: 'false', label: 'No' }
  //   ]
  // }
];

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
        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${value === "active"
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

type SortField = any
type SortDirection = "asc" | "desc"

interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'select' | 'number' | 'date' | 'file';
  required?: boolean;
  options?: { value: string; label: string }[];
  disabled?: boolean;
}

export default function ModulesTable() {
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    fields: [] as FieldConfig[],
    endpoint: '',
    method: 'GET' as 'POST' | 'PATCH' | 'PUT' | 'GET',
    buttonText: '',
    initialData: {} as any,
    type: 'multipart' as 'multipart' | 'json'
  });
  const [modules, setModules] = useState<Module[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage] = useState(1)
  const [statusFilter] = useState("all")
  const [sortField, setSortField] = useState<SortField>("name")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const itemsPerPage = 10
  const [totalModules, setTotalModules] = useState(0)
const [refresh,setRefresh] = useState(Math.random())
  const fetchModules = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        perPage: itemsPerPage.toString(),
        sortBy: sortField,
        order: sortDirection,
        search: searchTerm,
        ...(statusFilter !== "all" && { status: statusFilter }),
      })

      const response = await getData(`/admin/modules?${params.toString()}`)
      setModules(response.data)
      setTotalModules(response.meta)
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
  }, [searchTerm, currentPage, statusFilter, sortField, sortDirection,refresh])

  const handleEditModule = (module: Module) => {
    openModal({
      title: 'Edit Module',
      fields: moduleFields,
      endpoint: `/admin/modules/${module.id}`,
      method: 'PATCH',
      buttonText: 'Update Module',
      initialData: {
        name: module.name,
        description: module.description,
        status: module.status
      },
      type: 'multipart'
    });
  }

  const handleDeleteModule = async (module: Module) => {
    if (confirm(`Are you sure you want to delete ${module.name}?`)) {
      try {
        await deleteData(`/admin/modules/${module.id}`)
         alert("delete module successfully");
     setRefresh(Math.random())
      } catch (error) {
        console.error("Error deleting module:", error);
        alert("Failed to delete module");
      }
    }
  }

  const openModal = (config: {
    title: string;
    fields: FieldConfig[];
    endpoint: string;
    method: 'POST' | 'PATCH' | 'PUT' | 'GET';
    buttonText: string;
    initialData?: any;
    type?: 'multipart' | 'json'
  }) => {
    setModalConfig({
      ...config,
      isOpen: true,
      initialData: config.initialData || {},
      type: config.type || 'multipart'
    });
  };

  const closeModal = () => {
    setRefresh(Math.random())
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  const handleModalSuccess = () => {
    closeModal();
    fetchModules();
  };

  const handleCreateModule = () => {
    openModal({
      title: 'Create New Module',
      fields: moduleFields,
      endpoint: '/api/admin/modules',
      method: 'POST',
      buttonText: 'Create Module',
      initialData: {
        status: 'active' // Default status
      },
      type: 'multipart'
    });
  };

  return (
    <div>
      <DataTable
        data={modules}
        columns={moduleColumns}
        meta={totalModules}
        title="Modules"
        setSearchTerm={setSearchTerm}
        setSortField={setSortField}
        sortDirection={sortDirection}
        setSortDirection={setSortDirection}
        searchTerm={searchTerm}
        searchableFields={["name"]}
        onAdd={handleCreateModule}
        onEdit={handleEditModule}
        onDelete={handleDeleteModule}
        sortField={sortField}
        isLoading={isLoading}
        setRefresh={setRefresh}

      />
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
        type={modalConfig.type}
      />
    </div>
  )
}