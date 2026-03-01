import { ProductGrid } from "@/components/products/product-grid";

export default function ProductsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Catálogo de Produtos</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gerencie seus produtos e serviços disponíveis para venda.
        </p>
      </div>
      <ProductGrid />
    </div>
  );
}
