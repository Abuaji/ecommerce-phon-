import { requirePermission } from "@/lib/auth-utils";
import { readClient } from "@/sanity/lib/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Tag, ExternalLink } from "lucide-react";

export const revalidate = 60;

export default async function BrandsPage() {
  await requirePermission("PRODUCTS", "VIEW");

  const brands = await readClient.fetch(`
    *[_type == "brand"] | order(name asc) {
      _id,
      name,
      "slug": slug.current,
      description,
      isActive,
      "logoUrl": logo.asset->url,
      "productCount": count(*[_type == "product" && references(^._id)])
    }
  `);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Tag className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Brands</h1>
            <p className="text-muted-foreground">Brands are managed in Sanity CMS. Use the Studio to add or edit.</p>
          </div>
        </div>
        <Link href="/admin/studio">
          <Button className="gap-2">
            <ExternalLink className="h-4 w-4" /> Open Sanity Studio
          </Button>
        </Link>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Logo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(brands as any[]).map((brand) => (
              <TableRow key={brand._id}>
                <TableCell>
                  {brand.logoUrl ? (
                    <img src={brand.logoUrl} alt={brand.name} className="h-10 w-16 object-contain rounded-md bg-muted p-1" />
                  ) : (
                    <div className="h-10 w-16 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground">No Logo</div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{brand.name}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{brand.slug || "—"}</TableCell>
                <TableCell>
                  <span className="font-semibold">{brand.productCount ?? 0}</span>
                  <span className="text-muted-foreground text-xs ml-1">products</span>
                </TableCell>
                <TableCell>
                  {brand.isActive !== false ? (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {(!brands || brands.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No brands found. Add brands in Sanity Studio.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
