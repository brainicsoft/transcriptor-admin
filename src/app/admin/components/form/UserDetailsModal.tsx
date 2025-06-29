// components/UserDetailsModal.tsx
import { useEffect } from "react";
import Image from "next/image";
import avatar from "@/assets/avatar.jpg";

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    fullName: string;
    email: string;
    createdAt: string;
    address: string;
    packages: Array<{
      name: string;
      description: string;
      status: "active" | "hold";
    }>;
  };
}

export function UserDetailsModal({ isOpen, onClose, user }: UserDetailsModalProps) {
  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center p-6 border-b">
          <Image
            src={avatar}
            alt={user.fullName}
            width={60}
            height={60}
            className="rounded-full w-15 h-15"
          />
          <div className="ml-4">
            <h2 className="text-xl font-bold">{user.fullName}</h2>
            <p className="text-gray-600">{user.email}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <p className="text-gray-500">Registered At: {user.createdAt}</p>
            <p className="text-gray-500">Address: {user.address}</p>
          </div>

          <div className="flex gap-2">
            <button className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 transition">
              Deactivate
            </button>
            <button className="px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition">
              Delete
            </button>
          </div>

          <div className="mt-4">
            <h3 className="font-semibold mb-2">Subscribed Packages:</h3>
            {user.packages.map((pkg, index) => (
              <div
                key={index}
                className="mb-4 p-3 border rounded-lg hover:bg-gray-50 transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{pkg.name}</h4>
                    <p className="text-sm text-gray-600">{pkg.description}</p>
                  </div>
                  {pkg.status === "active" ? (
                    <button className="px-3 py-1 text-sm text-yellow-800 bg-yellow-50 rounded hover:bg-yellow-100 transition">
                      Hold
                    </button>
                  ) : (
                    <button className="px-3 py-1 text-sm text-green-800 bg-green-50 rounded hover:bg-green-100 transition">
                      Activate
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}