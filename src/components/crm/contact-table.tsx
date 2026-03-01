"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockContacts } from "@/lib/mock-data";
import { FUNNEL_STAGES } from "@/lib/utils/constants";

function formatPhone(phone: string): string {
  const c = phone.replace(/\D/g, "");
  if (c.startsWith("55") && c.length === 13) {
    return `(${c.slice(2, 4)}) ${c.slice(4, 9)}-${c.slice(9)}`;
  }
  return phone;
}

export function ContactTable() {
  const [search, setSearch] = useState("");

  const filtered = mockContacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.waId.includes(search)
  );

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar contatos..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Etapa do Funil</TableHead>
              <TableHead>Tags</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((contact) => {
              const stage = FUNNEL_STAGES.find((s) => s.value === contact.funnelStage);
              return (
                <TableRow key={contact.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                        {contact.avatarInitials}
                      </div>
                      <span className="font-medium">{contact.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatPhone(contact.waId)}</TableCell>
                  <TableCell className="text-muted-foreground">{contact.email || "—"}</TableCell>
                  <TableCell>
                    {stage && (
                      <Badge variant="secondary" className="text-xs">
                        <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${stage.color}`} />
                        {stage.label}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {contact.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-[10px]">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
