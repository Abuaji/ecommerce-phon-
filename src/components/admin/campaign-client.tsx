"use client";

import { useState, useTransition } from "react";
import { adminSendBulkCampaign } from "@/actions/admin/email.actions";
import { Check, Mail, AlertTriangle, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link', 'image'],
    ['clean']
  ],
};

export function CampaignClient() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ type: "success" | "error" | null; msg: string }>({ type: null, msg: "" });

  const handleSend = () => {
    if (!subject.trim() || !message.trim()) {
      setStatus({ type: "error", msg: "Subject and Message are required." });
      return;
    }

    if (!window.confirm("Are you sure you want to send this email to ALL active customers? This action cannot be undone.")) {
      return;
    }

    setStatus({ type: null, msg: "" });
    startTransition(async () => {
      const res = await adminSendBulkCampaign(subject, message);
      if (res?.error) {
        setStatus({ type: "error", msg: res.error });
      } else {
        setStatus({ type: "success", msg: `Successfully queued campaign to ${res?.count} customers!` });
        setSubject("");
        setMessage("");
      }
    });
  };

  return (
    <div className="max-w-2xl bg-card border rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-2">New Email Campaign</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Send a promotional email or announcement to all active customers. The email will automatically use your store's branding settings.
      </p>

      {status.type === "error" && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
          <AlertTriangle className="h-4 w-4" />
          <p>{status.msg}</p>
        </div>
      )}

      {status.type === "success" && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-green-50 text-green-700 text-sm rounded-md border border-green-200">
          <Check className="h-4 w-4" />
          <p>{status.msg}</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Subject Line</label>
          <input
            type="text"
            className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="e.g. MEGA Festival Sale! 50% OFF"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={isPending}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Message Content</label>
          <div className="bg-background rounded-md border-0">
            <ReactQuill 
              theme="snow" 
              value={message} 
              onChange={setMessage} 
              modules={modules}
              readOnly={isPending}
              className="h-[300px] mb-12"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">This will be wrapped inside the professional email template you designed earlier.</p>
        </div>

        <button
          onClick={handleSend}
          disabled={isPending || !subject || !message}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium text-sm disabled:opacity-50 transition-opacity hover:bg-primary/90"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
          {isPending ? "Sending Campaign..." : "Send to All Customers"}
        </button>
      </div>
    </div>
  );
}
