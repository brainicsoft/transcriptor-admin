"use client"
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { IconType } from 'react-icons';
import { FiGrid, FiLayers,  FiUsers } from 'react-icons/fi';

type IconName = 'dashboard' | 'users' | 'settings';

const iconComponents: Record<IconName, IconType> = {
  dashboard: FiGrid,
  users: FiUsers,
  settings: FiLayers,
};

interface SidebarItemProps {
  href: string;
  icon: IconName;
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
          ? 'border-l-2 border-white bg-secondary text-white shadow-sm '
          : 'text-indigo-100 hover:bg-secondary',
        'group flex items-center px-4 py-4 text-md font-medium rounded-none' // Changed px-2 to px-4 and removed rounded-md
      )}
    >
      {IconComponent && <IconComponent className="mr-3 h-5 w-5" />}
      {title}
    </Link>
  );
}