"use client";

import { useState } from "react";
import { Search, Plus, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { mockProducts, type MockProduct } from "@/lib/mock-data";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function ProductGrid() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<MockProduct[]>(mockProducts);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
  });

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddProduct = () => {
    const price = parseFloat(newProduct.price.replace(",", "."));
    if (!newProduct.name.trim() || isNaN(price) || price <= 0) {
      return;
    }

    const product: MockProduct = {
      id: `p${Date.now()}`,
      name: newProduct.name.trim(),
      description: newProduct.description.trim(),
      price,
      category: newProduct.category.trim() || "Geral",
      stockQuantity: 0,
      isActive: true,
    };

    setProducts((prev) => [product, ...prev]);
    setNewProduct({ name: "", price: "", category: "", description: "" });
    setDialogOpen(false);
  };

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
        <Button onClick={() => setDialogOpen(true)}>
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

      {/* Add Product Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Produto</DialogTitle>
            <DialogDescription>
              Preencha as informa\u00e7\u00f5es do novo produto.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="product-name">Nome *</Label>
              <Input
                id="product-name"
                placeholder="Ex: Camiseta Premium"
                value={newProduct.name}
                onChange={(e) => setNewProduct((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-price">Pre\u00e7o (R$) *</Label>
              <Input
                id="product-price"
                placeholder="Ex: 99,90"
                value={newProduct.price}
                onChange={(e) => setNewProduct((prev) => ({ ...prev, price: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-category">Categoria</Label>
              <Input
                id="product-category"
                placeholder="Ex: Camisetas"
                value={newProduct.category}
                onChange={(e) => setNewProduct((prev) => ({ ...prev, category: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-description">Descri\u00e7\u00e3o</Label>
              <Textarea
                id="product-description"
                placeholder="Descreva o produto..."
                rows={3}
                value={newProduct.description}
                onChange={(e) => setNewProduct((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleAddProduct}
              disabled={!newProduct.name.trim() || !newProduct.price.trim()}
            >
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
