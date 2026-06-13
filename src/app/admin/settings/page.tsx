import { adminGetSettings } from "@/actions/admin/settings.actions";
import { requirePermission } from "@/lib/auth-utils";
import { SettingsClient } from "@/components/admin/settings-client";
import { Settings } from "lucide-react";

export const revalidate = 0;

export default async function SettingsPage() {
  await requirePermission("SETTINGS", "VIEW");
  const settings = await adminGetSettings();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Settings className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Configure your store settings. Click the pencil icon to edit any value.</p>
        </div>
      </div>
      <SettingsClient settings={settings} />
    </div>
  );
}
