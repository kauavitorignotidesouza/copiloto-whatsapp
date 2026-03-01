import { ContactTable } from "@/components/crm/contact-table";

export default function ContactsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Contatos</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Lista de todos os contatos cadastrados no sistema.
        </p>
      </div>
      <ContactTable />
    </div>
  );
}
