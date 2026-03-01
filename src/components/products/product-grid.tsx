"use client";

import { useState } from "react";
import { Search, Plus, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { mockProducts } from "@/lib/mock-data";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function ProductGrid() {
  const [search, setSearch] = useState("");

  const filtered = mockProducts.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produtos..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-1.5" />
          Adicionar Produto
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((product) => (
          <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
            <div className="h-40 bg-muted flex items-center justify-center">
              <Package className="h-12 w-12 text-muted-foreground/30" />
            </div>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-medium text-sm truncate">{product.name}</h3>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{product.description}</p>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-primary">{formatCurrency(product.price)}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">{product.category}</Badge>
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    product.stockQuantity > 5 ? "bg-green-500" :
                    product.stockQuantity > 0 ? "bg-yellow-500" : "bg-red-500"
                  )} title={`Estoque: ${product.stockQuantity}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
