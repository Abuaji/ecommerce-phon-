"use client";

import { useTransition } from "react";
import { adminModerateReview } from "@/actions/admin/review.actions";
import { Button } from "@/components/ui/button";

export function ReviewModerator({ reviewId }: { reviewId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleModerate = (action: "APPROVE" | "REJECT") => {
    startTransition(async () => {
      const result = await adminModerateReview(reviewId, action);
      if (result?.error) {
        alert(result.error);
      }
    });
  };

  return (
    <div className="flex gap-2">
      <Button 
        size="sm" 
        variant="default" 
        className="bg-green-600 hover:bg-green-700"
        onClick={() => handleModerate("APPROVE")}
        disabled={isPending}
      >
        Approve
      </Button>
      <Button 
        size="sm" 
        variant="destructive" 
        onClick={() => handleModerate("REJECT")}
        disabled={isPending}
      >
        Reject
      </Button>
    </div>
  );
}
