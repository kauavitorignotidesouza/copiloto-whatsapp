"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Building2, Users, MessageCircle, Brain, Info } from "lucide-react";

const settingsNav = [
  { href: "/settings", label: "Geral", icon: Building2 },
  { href: "/settings/team", label: "Equipe", icon: Users },
  { href: "/settings/whatsapp", label: "WhatsApp", icon: MessageCircle },
  { href: "/settings/ai", label: "Inteligência Artificial", icon: Brain },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full">
      <nav className="w-56 border-r bg-card p-4 space-y-1 shrink-0">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3 px-2">
          Configurações
        </h2>
        {settingsNav.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent/50"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
        <div className="mt-4 pt-4 border-t border-border">
          <p className="flex items-start gap-2 text-xs text-muted-foreground px-2">
            <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            Cada conta tem seus próprios chats, produtos, CRM e configurações.
          </p>
        </div>
      </nav>
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
