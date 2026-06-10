import { TrackingForm } from "@/components/store/tracking-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track Your Order | Mobile Accessories",
  description: "Track the real-time status of your order.",
};

export default function TrackOrderPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 w-full min-h-screen">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">Track Your Order</h1>
        <p className="text-muted-foreground text-lg">
          Enter your Order Number and Contact Information below to view your real-time shipping timeline.
        </p>
      </div>

      <TrackingForm />
    </div>
  );
}
