"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { UserPlus, MoreHorizontal, Mail, ShieldCheck, Pencil, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Role = "Admin" | "Gerente" | "Atendente";
type Status = "Ativo" | "Inativo";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
  lastAccess: string;
  initials: string;
  isYou?: boolean;
}

const mockMembers: TeamMember[] = [
  {
    id: "1",
    name: "Carlos Silva",
    email: "carlos@lojaexemplo.com.br",
    role: "Admin",
    status: "Ativo",
    lastAccess: "Agora mesmo",
    initials: "CS",
    isYou: true,
  },
  {
    id: "2",
    name: "Ana Souza",
    email: "ana@lojaexemplo.com.br",
    role: "Atendente",
    status: "Ativo",
    lastAccess: "Há 2 horas",
    initials: "AS",
  },
  {
    id: "3",
    name: "Pedro Oliveira",
    email: "pedro@lojaexemplo.com.br",
    role: "Gerente",
    status: "Ativo",
    lastAccess: "Há 1 dia",
    initials: "PO",
  },
  {
    id: "4",
    name: "Mariana Costa",
    email: "mariana@lojaexemplo.com.br",
    role: "Atendente",
    status: "Inativo",
    lastAccess: "Há 15 dias",
    initials: "MC",
  },
];

function getRoleBadgeClass(role: Role): string {
  switch (role) {
    case "Admin":
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300";
    case "Gerente":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300";
    case "Atendente":
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  }
}

function getStatusBadgeClass(status: Status): string {
  switch (status) {
    case "Ativo":
      return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300";
    case "Inativo":
      return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300";
  }
}

export default function TeamSettingsPage() {
  const [members] = useState<TeamMember[]>(mockMembers);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<string>("Atendente");

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Equipe</h1>
          <p className="text-muted-foreground text-sm">
            Gerencie os membros da sua equipe, convite novos atendentes e defina permissões.
          </p>
        </div>
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Convidar Membro
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Convidar Novo Membro</DialogTitle>
              <DialogDescription>
                Envie um convite por email para adicionar um novo membro à sua equipe.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="inviteEmail">Email</Label>
                <Input
                  id="inviteEmail"
                  type="email"
                  placeholder="nome@empresa.com.br"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inviteRole">Cargo</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger id="inviteRole" className="w-full">
                    <SelectValue placeholder="Selecione o cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Atendente">Atendente</SelectItem>
                    <SelectItem value="Gerente">Gerente</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setInviteOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                className="gap-2"
                onClick={() => {
                  setInviteOpen(false);
                  setInviteEmail("");
                  setInviteRole("Atendente");
                }}
              >
                <Mail className="h-4 w-4" />
                Enviar Convite
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Membro</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Último acesso</TableHead>
              <TableHead className="w-[60px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{member.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {member.name}
                        {member.isYou && (
                          <span className="text-xs text-muted-foreground font-normal">
                            (Você)
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {member.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "border-0",
                      getRoleBadgeClass(member.role)
                    )}
                  >
                    {member.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "border-0",
                      getStatusBadgeClass(member.status)
                    )}
                  >
                    {member.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {member.lastAccess}
                </TableCell>
                <TableCell>
                  {!member.isYou && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Ações</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2">
                          <Pencil className="h-4 w-4" />
                          Editar cargo
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
                          <UserX className="h-4 w-4" />
                          {member.status === "Ativo" ? "Desativar" : "Reativar"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <ShieldCheck className="h-4 w-4" />
        <span>
          {members.filter((m) => m.status === "Ativo").length} membros ativos de {members.length} no total
        </span>
      </div>
    </div>
  );
}
