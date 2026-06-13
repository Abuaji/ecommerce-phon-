"use client";

import { useState, useTransition } from "react";
import { adminSendCustomEmail } from "@/actions/admin/email.actions";
import { Button } from "@/components/ui/button";
import { Mail, Loader2, X, Send } from "lucide-react";

interface SendEmailModalProps {
  recipientEmail: string;
}

export function SendEmailModal({ recipientEmail }: SendEmailModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSend = () => {
    if (!subject.trim() || !message.trim()) return;

    setStatus("idle");
    startTransition(async () => {
      const res = await adminSendCustomEmail(recipientEmail, subject, message);
      if (res.error) {
        setStatus("error");
        setErrorMsg(res.error);
      } else {
        setStatus("success");
        setTimeout(() => {
          setIsOpen(false);
          setStatus("idle");
          setSubject("");
          setMessage("");
        }, 2000);
      }
    });
  };

  if (!isOpen) {
    return (
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)} className="gap-2">
        <Mail className="h-4 w-4" />
        Send Message
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border shadow-lg rounded-xl w-full max-w-lg overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/30">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Send Email
          </h3>
          <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">To</label>
            <input 
              type="text" 
              value={recipientEmail} 
              disabled 
              className="w-full border rounded-md px-3 py-2 bg-muted text-muted-foreground cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Subject</label>
            <input 
              type="text" 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Update on your recent order"
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              rows={6}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {status === "error" && (
            <p className="text-sm text-destructive font-medium">{errorMsg}</p>
          )}
          {status === "success" && (
            <p className="text-sm text-green-600 font-medium">Email sent successfully!</p>
          )}
        </div>

        <div className="px-6 py-4 border-t bg-muted/30 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSend} 
            disabled={isPending || !subject.trim() || !message.trim() || status === "success"}
            className="gap-2"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {isPending ? "Sending..." : "Send Email"}
          </Button>
        </div>
      </div>
    </div>
  );
}
