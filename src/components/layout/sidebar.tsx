"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageSquare,
  LayoutDashboard,
  Inbox,
  Users,
  Package,
  FileText,
  BarChart3,
  BookOpen,
  Settings,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/lib/stores/ui-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const navItems = [
  {
    label: "Painel",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Caixa de Entrada",
    href: "/inbox",
    icon: Inbox,
    badge: 5,
  },
  {
    label: "CRM",
    href: "/crm",
    icon: Users,
  },
  {
    label: "Produtos",
    href: "/products",
    icon: Package,
  },
  {
    label: "Modelos",
    href: "/templates",
    icon: FileText,
  },
  {
    label: "Relatórios",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    label: "Base de Conhecimento",
    href: "/knowledge-base",
    icon: BookOpen,
  },
  {
    label: "Configurações",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <aside
      className={cn(
        "flex flex-col h-screen border-r bg-card transition-all duration-300",
        sidebarCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo / Brand */}
      <div className="flex items-center gap-2 px-4 h-14 shrink-0">
        <MessageSquare className="size-6 text-primary shrink-0" />
        {!sidebarCollapsed && (
          <span className="text-lg font-bold truncate">Copiloto</span>
        )}
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          const linkContent = (
            <Link
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                sidebarCollapsed && "justify-center px-2"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {!sidebarCollapsed && (
                <>
                  <span className="truncate flex-1">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <Badge
                      variant={active ? "secondary" : "default"}
                      className="ml-auto text-xs"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </Link>
          );

          if (sidebarCollapsed) {
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent side="right">
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <Badge variant="default" className="ml-2 text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </TooltipContent>
              </Tooltip>
            );
          }

          return <div key={item.href}>{linkContent}</div>;
        })}
      </nav>

      <Separator />

      {/* User info + collapse toggle */}
      <div className="p-2 space-y-2">
        {/* User info */}
        <div
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2",
            sidebarCollapsed && "justify-center px-2"
          )}
        >
          <Avatar className="size-8 shrink-0">
            <AvatarFallback className="text-xs">AD</AvatarFallback>
          </Avatar>
          {!sidebarCollapsed && (
            <div className="flex flex-col truncate">
              <span className="text-sm font-medium truncate">Admin</span>
              <span className="text-xs text-muted-foreground truncate">
                Administrador
              </span>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className={cn("w-full", sidebarCollapsed && "px-2")}
        >
          {sidebarCollapsed ? (
            <ChevronsRight className="size-4" />
          ) : (
            <>
              <ChevronsLeft className="size-4" />
              <span className="ml-2">Recolher</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
