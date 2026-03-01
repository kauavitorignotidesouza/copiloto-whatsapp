"use client";

import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Menu, Sun, Moon, LogOut } from "lucide-react";
import { useUIStore } from "@/lib/stores/ui-store";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const pageTitles: Record<string, string> = {
  "/dashboard": "Painel",
  "/inbox": "Caixa de Entrada",
  "/crm": "CRM",
  "/crm/contacts": "Contatos",
  "/products": "Produtos",
  "/products/import": "Importar Produtos",
  "/templates": "Modelos WhatsApp",
  "/analytics": "Relatórios e Métricas",
  "/knowledge-base": "Base de Conhecimento",
  "/settings": "Configurações",
  "/settings/team": "Equipe",
  "/settings/whatsapp": "Conexão WhatsApp",
  "/settings/ai": "Configuração IA",
};

function getPageTitle(pathname: string): string {
  // Try exact match first
  if (pageTitles[pathname]) return pageTitles[pathname];

  // Try matching parent paths
  const segments = pathname.split("/").filter(Boolean);
  while (segments.length > 0) {
    const path = "/" + segments.join("/");
    if (pageTitles[path]) return pageTitles[path];
    segments.pop();
  }

  return "Painel";
}

export function Topbar() {
  const pathname = usePathname();
  const { toggleSidebar } = useUIStore();
  const { theme, setTheme } = useTheme();
  const pageTitle = getPageTitle(pathname);

  function handleSignOut() {
    import("next-auth/react").then(({ signOut }) => {
      signOut({ callbackUrl: "/login" });
    });
  }

  return (
    <header className="flex items-center justify-between h-14 border-b bg-card px-4 shrink-0">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <Menu className="size-5" />
          <span className="sr-only">Alternar menu lateral</span>
        </Button>
        <h1 className="text-lg font-semibold">{pageTitle}</h1>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="size-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute size-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Alternar tema</span>
        </Button>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="size-8">
                <AvatarFallback className="text-xs">AD</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="size-4 mr-2" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
