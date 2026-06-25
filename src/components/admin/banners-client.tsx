"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Image as ImageIcon, Trash2, Edit } from "lucide-react";
import { adminGetBanners, adminDeleteBanner, adminToggleBannerActive, adminCreateBanner, adminUpdateBanner } from "@/actions/admin/banner.actions";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Banner = Awaited<ReturnType<typeof adminGetBanners>>[0];

export function BannersClient({ initialBanners }: { initialBanners: Banner[] }) {
  const [banners, setBanners] = useState(initialBanners);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const openNew = () => {
    setEditingBanner(null);
    setIsSheetOpen(true);
  };

  const openEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setIsSheetOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;
    setIsLoading(true);
    const res = await adminDeleteBanner(id);
    if (res.success) {
      setBanners(banners.filter(b => b._id !== id));
    } else {
      alert(res.error);
    }
    setIsLoading(false);
  };

  const handleToggle = async (id: string, current: boolean) => {
    setIsLoading(true);
    const res = await adminToggleBannerActive(id, !current);
    if (res.success) {
      setBanners(banners.map(b => b._id === id ? { ...b, isActive: !current } : b));
    } else {
      alert(res.error);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.append("isActive", formData.get("isActiveCheckbox") ? "true" : "false");
    
    let res;
    if (editingBanner) {
      res = await adminUpdateBanner(editingBanner._id, formData);
    } else {
      res = await adminCreateBanner(formData);
    }

    if (res.success) {
      setIsSheetOpen(false);
      // Fetch fresh data
      const updated = await adminGetBanners();
      setBanners(updated);
    } else {
      alert(res.error);
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <ImageIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Hero Banners</h1>
            <p className="text-muted-foreground">Manage the big promotional cards on the landing page.</p>
          </div>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="h-4 w-4" /> New Banner
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Internal Name</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {banners.map((banner) => (
              <TableRow key={banner._id}>
                <TableCell>
                  {banner.desktopImageUrl ? (
                    <img src={banner.desktopImageUrl} alt="Banner" className="w-20 h-10 object-cover rounded shadow-sm border" />
                  ) : (
                    <div className="w-20 h-10 bg-muted rounded flex items-center justify-center text-xs">No Image</div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="font-medium">{banner.internalName}</div>
                  <div className="text-xs text-muted-foreground">{banner.heading}</div>
                </TableCell>
                <TableCell>{banner.displayOrder}</TableCell>
                <TableCell>
                  <Button 
                    variant={banner.isActive ? "default" : "outline"} 
                    size="sm"
                    onClick={() => handleToggle(banner._id, banner.isActive)}
                    disabled={isLoading}
                  >
                    {banner.isActive ? "Active" : "Hidden"}
                  </Button>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(banner)} disabled={isLoading}>
                    <Edit className="h-4 w-4 text-blue-500" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(banner._id)} disabled={isLoading}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {banners.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No banners found. Click "New Banner" to create one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md flex flex-col p-0">
          <div className="p-6 pb-2 border-b border-border/40">
            <SheetHeader>
              <SheetTitle>{editingBanner ? "Edit Banner" : "Create New Banner"}</SheetTitle>
              <SheetDescription>
                {editingBanner ? "Update banner details and images." : "Upload desktop and mobile images for the landing page hero."}
              </SheetDescription>
            </SheetHeader>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <form id="banner-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label>Internal Name <span className="text-destructive">*</span></Label>
                <Input name="internalName" defaultValue={editingBanner?.internalName} required placeholder="e.g. Summer Sale 2024" />
              </div>
              
              <div className="space-y-2">
                <Label>Desktop Image {editingBanner ? "(Optional)" : <span className="text-destructive">*</span>}</Label>
                <Input className="cursor-pointer file:cursor-pointer file:bg-primary/10 file:text-primary file:border-0 file:rounded-md file:px-4 file:py-1 file:mr-4 file:font-medium hover:file:bg-primary/20" name="desktopImage" type="file" accept="image/*" required={!editingBanner} />
                {editingBanner?.desktopImageUrl && <img src={editingBanner.desktopImageUrl} className="h-24 w-full object-cover rounded-md border" alt="Current Desktop" />}
              </div>

              <div className="space-y-2">
                <Label>Mobile Image {editingBanner ? "(Optional)" : <span className="text-destructive">*</span>}</Label>
                <Input className="cursor-pointer file:cursor-pointer file:bg-primary/10 file:text-primary file:border-0 file:rounded-md file:px-4 file:py-1 file:mr-4 file:font-medium hover:file:bg-primary/20" name="mobileImage" type="file" accept="image/*" required={!editingBanner} />
                {editingBanner?.mobileImageUrl && <img src={editingBanner.mobileImageUrl} className="h-24 w-full object-cover rounded-md border" alt="Current Mobile" />}
              </div>

              <div className="space-y-2">
                <Label>Heading</Label>
                <Input name="heading" defaultValue={editingBanner?.heading} placeholder="Main bold text on banner" />
              </div>

              <div className="space-y-2">
                <Label>Subheading</Label>
                <Input name="subheading" defaultValue={editingBanner?.subheading} placeholder="Smaller text above/below heading" />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea name="description" defaultValue={editingBanner?.description} className="resize-none" rows={3} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Button Text</Label>
                  <Input name="primaryButtonText" defaultValue={editingBanner?.primaryButtonText} placeholder="e.g. Shop Now" />
                </div>
                <div className="space-y-2">
                  <Label>Button URL</Label>
                  <Input name="primaryButtonUrl" defaultValue={editingBanner?.primaryButtonUrl} placeholder="/products" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Display Order</Label>
                  <Input name="displayOrder" type="number" defaultValue={editingBanner?.displayOrder ?? 0} />
                </div>
                <div className="flex items-center space-x-2 pt-8">
                  <input type="checkbox" name="isActiveCheckbox" id="isActive" defaultChecked={editingBanner ? editingBanner.isActive : true} className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
                  <Label htmlFor="isActive" className="cursor-pointer">Active Status</Label>
                </div>
              </div>
            </form>
          </div>
          <div className="p-6 pt-4 border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <Button type="submit" form="banner-form" className="w-full" disabled={isLoading}>
              {isLoading ? "Saving..." : editingBanner ? "Save Changes" : "Create Banner"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
