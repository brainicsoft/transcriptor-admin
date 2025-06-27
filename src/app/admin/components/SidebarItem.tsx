"use client"
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { IconType } from 'react-icons';
import { FiGrid, FiSettings, FiUsers } from 'react-icons/fi';

// Define your icon names as a type
type IconName = 'dashboard' | 'users' | 'settings'; // Add all your icon names here

// Create an icon map
const iconComponents: Record<IconName, IconType> = {
  dashboard: FiGrid,
  users: FiUsers,
  settings: FiSettings,
  // Add more icons as needed
};

interface SidebarItemProps {
  href: string;
  icon: IconName;  // Now accepts only the icon name
  title: string;
  onClick?: () => void;
}

export default function SidebarItem({ 
  href, 
  icon, 
  title, 
  onClick 
}: SidebarItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;
  const IconComponent = iconComponents[icon];

  return (
    <Link
      href={href}
      onClick={onClick}
      className={clsx(
        isActive
          ? 'bg-indigo-800 text-white'
          : 'text-indigo-100 hover:bg-indigo-600',
        'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
      )}
    >
      {IconComponent && <IconComponent className="mr-3 h-5 w-5" />}
      {title}
    </Link>
  );
}