/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect, useCallback } from "react"
import { Upload, X, File } from "lucide-react"
import { putData } from "@/app/axios/fetching"
import { useRouter } from "next/navigation"

interface ModuleTier {
  file?: File | null
  entitlement: string
  selectedTexts: string[]
}

interface ModuleData {
  id?: string
  name: string
  description: string
  basic: ModuleTier
  plus: ModuleTier
  premium: ModuleTier
}

interface EditModalProps {
  isOpen: boolean
  onClose: () => void
  initialData: ModuleData
}

export default function EditModal({ isOpen, onClose, initialData }: EditModalProps) {
  const [saving, setSaving] = useState(false)
      const router = useRouter()

  const [formData, setFormData] = useState<ModuleData>({
    name: '',
    description: '',
    basic: { entitlement: '', selectedTexts: [] },
    plus: { entitlement: '', selectedTexts: [] },
    premium: { entitlement: '', selectedTexts: [] },
    ...initialData
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [dragActive, setDragActive] = useState(false)

  

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        description: '',
        basic: { entitlement: '', selectedTexts: [] },
        plus: { entitlement: '', selectedTexts: [] },
        premium: { entitlement: '', selectedTexts: [] },
        ...initialData
      })
      setErrors({})
    }
  }, [isOpen, initialData])

    useEffect(() => {
  if (!isOpen || !initialData) return;

  const getTierData = (tierName: "basic" | "plus" | "premium") => {
    const tier = (initialData as any).tiers?.find((t: any) => t.tier === tierName)
    const selectedTexts: string[] = []

    if (tier?.hasTextProduction) selectedTexts.push("Text Production")
    if (tier?.hasConclusion) selectedTexts.push("Conclusion")
    if (tier?.hasMap) selectedTexts.push("Map")

    return {
      file: null, // can't load real file object from URL, handled visually
      entitlement: tier?.entitlementId || '',
      selectedTexts
    }
  }

  setFormData({
    id: initialData.id,
    name: initialData.name,
    description: initialData.description,
    basic: getTierData("basic"),
    plus: getTierData("plus"),
    premium: getTierData("premium")
  })

  setErrors({})
}, [isOpen, initialData])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((tier: "basic" | "plus" | "premium", e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      setFormData(prev => ({
        ...prev,
        [tier]: {
          ...prev[tier],
          file,
        },
      }))
    }
  }, [])

  const handleFileChange = (tier: "basic" | "plus" | "premium", e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData(prev => ({
      ...prev,
      [tier]: {
        ...prev[tier],
        file,
      },
    }))
  }

  const handleTextSelection = (tier: "basic" | "plus" | "premium", text: string) => {
    setFormData((prev) => {
      const currentTexts = prev[tier]?.selectedTexts || []
      const isSelected = currentTexts.includes(text)

      const newSelectedTexts = isSelected ? currentTexts.filter((t) => t !== text) : [...currentTexts, text]

      return {
        ...prev,
        [tier]: {
          ...prev[tier],
          selectedTexts: newSelectedTexts,
        },
      }
    })
  }
    console.log(initialData)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    // Convert to FormData
    const formDataObj = new FormData()


  
  const appendTextBooleans = (tier: "basic" | "plus" | "premium") => {
    const texts = formData[tier].selectedTexts
    formDataObj.append(`${tier}_hasTextProduction`, texts.includes("Text Production").toString())
    formDataObj.append(`${tier}_hasConclusion`, texts.includes("Conclusion").toString())
    formDataObj.append(`${tier}_hasMap`, texts.includes("Map").toString())
  }
   appendTextBooleans("basic")
  appendTextBooleans("plus")
  appendTextBooleans("premium")
    // Add files if they exist
    if (formData.basic?.file) {
      formDataObj.append("basic_zipFile", formData.basic.file)
    }
    if (formData.plus?.file) {
      formDataObj.append("plus_zipFile", formData.plus.file)
    }
    if (formData.premium?.file) {
      formDataObj.append("premium_zipFile", formData.premium.file)
    }

    try {
      // await onSave(formDataObj)
      await putData(`/admin/modules/${initialData.id}`, formDataObj)
      setSaving(false)
      router.refresh()
      onClose()
    } catch (error) {
      console.error("Error saving module:", error)
      setErrors((prev) => ({
        ...prev,
        form: "Failed to save module. Please try again.",
      }))
    }
  }

  if (!isOpen) return null

  const textOptions = ["Text Production", "Conclusion", "Map"]

  const renderTierSection = (tier: "basic" | "plus" | "premium", title: string) => (
    <div className="flex-1 px-4">
      <h3 className="text-lg font-medium mb-4 text-center">{title}</h3>

      {/* Upload Section */}
      <div className="mb-4">
        <div
          className={`border-2 border-dashed rounded-lg p-4 ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-gray-50"}`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={(e) => handleDrop(tier, e)}
        >
          {formData[tier]?.file ? (
            <div className="flex items-center justify-between p-2">
              <div className="flex items-center gap-2">
                <File className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm">{formData[tier]?.file?.name}</p>
                  <p className="text-xs text-gray-500">
                    {formData[tier]?.file?.type || "application/zip"} • {(formData[tier]?.file?.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFormData(prev => ({
                  ...prev,
                  [tier]: { ...prev[tier], file: null }
                }))}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="text-center py-2">
              <Upload className="w-6 h-6 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-3">Upload Module as html</p>
              <label className="inline-block px-4 py-2 bg-gray-800 text-white rounded text-sm cursor-pointer">
                Upload File
                <input
                  type="file"
                  onChange={(e) => handleFileChange(tier, e)}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>
      </div>

      {/* RevenueCat Entitlement */}
      <div className="mb-4">
        <input
          type="text"
          disabled
          placeholder="RevenueCat Entitlement"
          value={formData[tier]?.entitlement || ''}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            [tier]: {
              ...prev[tier],
              entitlement: e.target.value
            }
          }))}
          className="w-full px-3 py-2 border bg-gray-100 border-gray-300 rounded text-sm"
        />
      </div>

      {/* Text Selection Buttons */}
      <div className="space-y-2">
        {textOptions.map((text) => {
          const isSelected = formData[tier]?.selectedTexts?.includes(text) || false
          return (
            <button
              key={text}
              type="button"
              onClick={() => handleTextSelection(tier, text)}
              className={`w-full px-3 py-2 rounded text-sm border ${isSelected ? "bg-blue-50 border-blue-300 text-blue-700" : "bg-gray-50 border-gray-200 text-gray-600"
                }`}
            >
              {text} 
            </button>
          )
        })}
      </div>
    </div>
  )



  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Close Button */}
          <div className="flex justify-end mb-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Header Fields */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Module Name"
              value={formData.name || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3"
            />
            <textarea
              placeholder="Module Description"
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          {/* Three Tier Sections */}
          <div className="flex border border-gray-200 rounded-lg overflow-hidden mb-6">
            {renderTierSection("basic", "Basic")}
            <div className="w-px bg-gray-200"></div>
            {renderTierSection("plus", "Plus")}
            <div className="w-px bg-gray-200"></div>
            {renderTierSection("premium", "Premium")}
          </div>

          {/* Error Message */}
          {errors.form && <p className="text-red-500 text-sm mb-4 text-center">{errors.form}</p>}

          {/* Save Button */}
          <div className="flex justify-center">
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}