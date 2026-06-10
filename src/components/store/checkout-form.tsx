"use client";

import { useCartStore } from "@/stores/cart.store";
import { useState, useTransition, useEffect } from "react";
import { createCheckoutSession } from "@/actions/checkout/checkout.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

// Extend Window interface for Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

export function CheckoutForm() {
  const { items, getSubtotal, clearCart } = useCartStore();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    zipCode: "",
  });

  const [error, setError] = useState<string | null>(null);

  // Dynamically load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  if (items.length === 0) {
    return <div className="text-center py-10">Your cart is empty. Please add items before checking out.</div>;
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      // 1. Prepare payload
      const payload = {
        customerEmail: formData.email,
        customerPhone: formData.phone,
        shippingAddress: {
          line1: formData.addressLine1,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: "IN",
        },
        items: items.map(i => ({
          sanityProductId: i.sanityProductId,
          productNameSnap: i.name,
          quantity: i.quantity,
          unitPrice: i.price,
        })),
      };

      // 2. Invoke Server Action
      const result = await createCheckoutSession(payload);

      if (result?.error) {
        setError(result.error);
        return;
      }

      if (!result?.data) {
        setError("Invalid response from server");
        return;
      }

      // 3. Open Razorpay Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder",
        amount: result.data.amount,
        currency: result.data.currency,
        name: "Mobile Accessories Store",
        description: "Order Payment",
        order_id: result.data.razorpayOrderId,
        handler: function (response: any) {
          // 4. On Success Callback
          // Note: The actual source of truth is the webhook! This just redirects the user.
          clearCart();
          router.push(`/checkout/success?order_id=${result.data?.orderId}&payment_id=${response.razorpay_payment_id}`);
        },
        prefill: {
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: "#0f172a",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        setError(response.error.description);
      });
      rzp.open();
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <form onSubmit={handleCheckout} className="space-y-6">
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-xl font-semibold border-b pb-2">Contact Details</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input id="email" name="email" type="email" required value={formData.email} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input id="phone" name="phone" type="tel" required value={formData.phone} onChange={handleChange} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold border-b pb-2">Shipping Address</h3>
        <div className="space-y-2">
          <Label htmlFor="addressLine1">Address Line 1 *</Label>
          <Input id="addressLine1" name="addressLine1" required value={formData.addressLine1} onChange={handleChange} />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input id="city" name="city" required value={formData.city} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State *</Label>
            <Input id="state" name="state" required value={formData.state} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="zipCode">PIN Code *</Label>
            <Input id="zipCode" name="zipCode" required value={formData.zipCode} onChange={handleChange} />
          </div>
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={isPending}>
        {isPending ? "Initializing Secure Checkout..." : `Pay ₹${(getSubtotal() / 100).toLocaleString()}`}
      </Button>
    </form>
  );
}
