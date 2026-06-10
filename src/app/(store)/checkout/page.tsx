"use client";

import { useCartStore } from "@/stores/cart.store";
import { CheckoutForm } from "@/components/store/checkout-form";
import { Card, CardContent } from "@/components/ui/card";

export default function CheckoutPage() {
  const { items, getSubtotal } = useCartStore();
  const subtotal = getSubtotal();

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 w-full min-h-screen">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Secure Checkout</h1>
      
      <div className="grid lg:grid-cols-2 gap-12">
        {/* Left Col: Form */}
        <div>
          <CheckoutForm />
        </div>

        {/* Right Col: Summary */}
        <div>
          <Card className="bg-muted/50 sticky top-24">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.sanityProductId} className="flex gap-4">
                    <div className="w-16 h-16 bg-muted rounded shrink-0 relative border">
                      {item.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded" />
                      )}
                      <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs w-5 h-5 flex items-center justify-center rounded-full">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium line-clamp-2 text-sm">{item.name}</p>
                      <p className="text-muted-foreground text-sm">₹{(item.price / 100).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between text-muted-foreground text-sm">
                  <span>Subtotal</span>
                  <span>₹{(subtotal / 100).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-muted-foreground text-sm">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                {/* Coupon logic could be added here later */}
              </div>

              <div className="flex justify-between items-center border-t pt-4 mt-4">
                <span className="font-bold text-lg">Total</span>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground block mb-1">Including ₹{Math.floor(subtotal * 0.18 / 100).toLocaleString()} in taxes</span>
                  <span className="font-bold text-2xl">₹{(subtotal / 100).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
