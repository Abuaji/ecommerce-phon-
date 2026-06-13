"use client";

import { useState, useTransition } from "react";
import { adminUpsertSetting } from "@/actions/admin/settings.actions";
import { Check, Pencil, X } from "lucide-react";

type Setting = {
  key: string;
  value: string;
  label: string;
  description?: string | null;
  group: string;
  updatedAt: Date | null;
  updatedBy: string | null;
};

function SettingRow({ setting }: { setting: Setting }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(setting.value);
  const [savedValue, setSavedValue] = useState(setting.value);
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);

  const handleSave = () => {
    startTransition(async () => {
      await adminUpsertSetting(setting.key, value);
      setSavedValue(value);
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    });
  };

  const handleCancel = () => {
    setValue(savedValue);
    setEditing(false);
  };

  const isBoolean = savedValue === "true" || savedValue === "false";

  const handleToggle = () => {
    const newValue = savedValue === "true" ? "false" : "true";
    startTransition(async () => {
      await adminUpsertSetting(setting.key, newValue);
      setSavedValue(newValue);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    });
  };

  return (
    <div className="flex items-start justify-between gap-4 py-4 border-b last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm">{setting.label}</p>
          {success && <span className="text-xs text-green-600 flex items-center gap-1"><Check className="h-3 w-3" /> Saved</span>}
        </div>
        {setting.description && <p className="text-xs text-muted-foreground mt-0.5">{setting.description}</p>}
        <p className="text-xs text-muted-foreground/50 mt-1 font-mono">{setting.key}</p>
      </div>
      <div className="flex items-center gap-2">
        {isBoolean ? (
          <button
            onClick={handleToggle}
            disabled={isPending}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
              savedValue === "true" ? "bg-primary" : "bg-muted-foreground/30"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                savedValue === "true" ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        ) : editing ? (
          <>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="border rounded-md px-3 py-1.5 text-sm bg-background w-64 focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
              onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") handleCancel(); }}
            />
            <button onClick={handleSave} disabled={isPending} className="p-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              <Check className="h-4 w-4" />
            </button>
            <button onClick={handleCancel} className="p-1.5 rounded-md hover:bg-muted">
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <>
            <span className="text-sm font-mono bg-muted px-3 py-1.5 rounded-md max-w-[240px] truncate">{savedValue}</span>
            <button onClick={() => setEditing(true)} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <Pencil className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function SettingsClient({ settings }: { settings: Setting[] }) {
  const groups = [...new Set(settings.map((s) => s.group))];

  const groupLabels: Record<string, string> = {
    general: "General",
    payments: "Payments",
    shipping: "Shipping",
    notifications: "Notifications",
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {groups.map((group) => (
        <div key={group} className="bg-card border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 pb-2 border-b">{groupLabels[group] || group}</h2>
          {settings.filter((s) => s.group === group).map((s) => (
            <SettingRow key={s.key} setting={s} />
          ))}
        </div>
      ))}
    </div>
  );
}
