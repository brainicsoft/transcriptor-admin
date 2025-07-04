/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'select' | 'number' | 'date' | 'file';
  required?: boolean;
  options?: { value: string; label: string }[];
  disabled?: boolean;
}

interface DynamicModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  initialData: any;
  fields: FieldConfig[];
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'GET';
  buttonText?: string;
  onSuccess?: (data: any) => void;
  validate?: (data: Record<string, any>) => Record<string, string> | null;
  type?: 'json' | 'multipart';
}

export default function DynamicModal({
  isOpen,
  onClose,
  title,
  initialData,
  fields,
  endpoint,
  method,
  buttonText = 'Submit',
  type = 'json',
  onSuccess,
  validate
}: DynamicModalProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [fileData, setFileData] = useState<Record<string, File>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setFormData(initialData);
    setFileData({});
    setErrors({});
    setFormError(null);
  }, [isOpen, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'file') {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        setFileData(prev => ({
          ...prev,
          [name]: files[0] // Store the File object
        }));
        // Update formData with file name for UI display
        setFormData(prev => ({
          ...prev,
          [name]: files[0].name
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const prepareFormData = () => {
    if (type === 'multipart') {
      const formDataObj = new FormData();
      
      // Add all fields to FormData
      for (const field of fields) {
        if (field.type === 'file') {
          // Handle file fields
          if (fileData[field.name]) {
            formDataObj.append(field.name, fileData[field.name]);
          }
        } else {
          // Handle regular fields
          const value = formData[field.name];
          if (value !== undefined && value !== null) {
            formDataObj.append(field.name, String(value));
          }
        }
      }

      // Debug: Log FormData entries
      Array.from(formDataObj.entries()).forEach(([key, value]) => {
        console.log(key, value);
      });

      return formDataObj;
    } else {
      // For JSON requests
      return JSON.stringify(formData);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError(null);

    // Validate form if validation function provided
    if (validate) {
      const validationErrors = validate(formData);
      if (validationErrors) {
        setErrors(validationErrors);
        setIsLoading(false);
        return;
      }
    }

    try {
      const body = prepareFormData();
      
      const headers = new Headers();
      // Only set Content-Type for JSON, not for FormData
      if (type === 'json') {
        headers.append('Content-Type', 'application/json');
      }
      
      // Add authorization token if available
      const token = localStorage.getItem('token');
      if (token) {
        headers.append('Authorization', `Bearer ${token}`);
      }

      const response = await fetch(endpoint, {
        method,
        headers,
        body,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Failed to submit form');
      }

      const data = await response.json();
      onSuccess?.(data);
      onClose();
      router.refresh();
    } catch (err) {
      console.error('Form submission error:', err);
      setFormError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            disabled={isLoading}
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
                {field.required && <span className="text-red-500"> *</span>}
              </label>
              {field.type === 'select' ? (
                <select
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  disabled={field.disabled || isLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                >
                  <option value="">Select {field.label}</option>
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : field.type === 'file' ? (
                <div>
                  <input
                    type="file"
                    name={field.name}
                    onChange={handleChange}
                    required={field.required}
                    disabled={field.disabled || isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                  {formData[field.name] && (
                    <p className="text-sm text-gray-500 mt-1">
                      Selected: {formData[field.name]}
                    </p>
                  )}
                </div>
              ) : (
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  required={field.required}
                  disabled={field.disabled || isLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              )}
              {errors[field.name] && (
                <p className="text-sm text-red-500 mt-1">{errors[field.name]}</p>
              )}
            </div>
          ))}

          {formError && <p className="text-red-600">{formError}</p>}

          <div className="mt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white py-2 rounded hover:bg-secondary disabled:opacity-50"
            >
              {isLoading ? 'Submitting...' : buttonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}