'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ImageIcon,
  Palette,
  Wand2,
  User,
  History,
  Settings,
  CreditCard,
  Users,
  Shield,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  PaintBucket,
  Eraser,
  FileImage,
  UserCircle,
} from 'lucide-react';

const userMenuItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Image Editor',
    href: '/editor',
    icon: ImageIcon,
  },
  {
    title: 'AI Tools',
    href: '/tools',
    icon: Wand2,
    children: [
      { title: 'Enhance', href: '/tools/enhance', icon: Sparkles },
      { title: 'Remove Object', href: '/tools/remove', icon: Eraser },
      { title: 'Style Transfer', href: '/tools/style', icon: PaintBucket },
      { title: 'Text to Image', href: '/tools/text-to-image', icon: FileImage },
      { title: 'Avatar Generator', href: '/tools/avatar', icon: UserCircle },
    ],
  },
  {
    title: 'Gallery',
    href: '/gallery',
    icon: Palette,
  },
  {
    title: 'History',
    href: '/history',
    icon: History,
  },
  {
    title: 'Profile',
    href: '/profile',
    icon: User,
  },
  {
    title: 'Billing',
    href: '/billing',
    icon: CreditCard,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

const adminMenuItems = [
  {
    title: 'Admin Dashboard',
    href: '/admin',
    icon: Shield,
  },
  {
    title: 'User Management',
    href: '/admin/users',
    icon: Users,
  },
  {
    title: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
  },
  {
    title: 'AI Models',
    href: '/admin/models',
    icon: Wand2,
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const pathname = usePathname();
  const { isAdmin } = useAuth();

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev => 
      prev.includes(href) 
        ? prev.filter(item => item !== href)
        : [...prev, href]
    );
  };

  const menuItems = isAdmin ? [...userMenuItems, ...adminMenuItems] : userMenuItems;

  return (
    <div className={cn(
      "sticky top-16 h-[calc(100vh-4rem)] border-r bg-background/95 backdrop-blur transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between p-4">
          {!collapsed && (
            <h2 className="text-lg font-semibold">Menu</h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        <nav className="flex-1 space-y-2 p-2">
          {menuItems.map((item) => (
            <div key={item.href}>
              <Button
                variant={pathname === item.href ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  collapsed && "justify-center px-2"
                )}
                asChild={!item.children}
                onClick={item.children ? () => toggleExpanded(item.href) : undefined}
              >
                {item.children ? (
                  <div className="flex items-center w-full">
                    <item.icon className="h-4 w-4" />
                    {!collapsed && (
                      <>
                        <span className="ml-2 flex-1 text-left">{item.title}</span>
                        <ChevronRight className={cn(
                          "h-4 w-4 transition-transform",
                          expandedItems.includes(item.href) && "rotate-90"
                        )} />
                      </>
                    )}
                  </div>
                ) : (
                  <Link href={item.href} className="flex items-center w-full">
                    <item.icon className="h-4 w-4" />
                    {!collapsed && <span className="ml-2">{item.title}</span>}
                  </Link>
                )}
              </Button>

              {item.children && expandedItems.includes(item.href) && !collapsed && (
                <div className="ml-4 mt-2 space-y-1">
                  {item.children.map((child) => (
                    <Button
                      key={child.href}
                      variant={pathname === child.href ? "secondary" : "ghost"}
                      className="w-full justify-start text-sm"
                      asChild
                    >
                      <Link href={child.href}>
                        <child.icon className="h-4 w-4" />
                        <span className="ml-2">{child.title}</span>
                      </Link>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}