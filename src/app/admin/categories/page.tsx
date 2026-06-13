import { requirePermission } from "@/lib/auth-utils";
import { adminGetAllCategories } from "@/actions/admin/category.actions";
import { CategoriesTable } from "@/components/admin/categories-table";
import { FolderTree } from "lucide-react";

export default async function CategoriesPage() {
  await requirePermission("PRODUCTS", "VIEW");

  const categories = await adminGetAllCategories();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <FolderTree className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">
            Full control — create, edit, delete, or bulk-manage your store categories.
          </p>
        </div>
      </div>

      <CategoriesTable categories={categories} />
    </div>
  );
}
