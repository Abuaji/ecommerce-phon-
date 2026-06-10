"use client";

import { useState, useTransition } from "react";
import { trackOrder } from "@/actions/tracking/tracking.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function TrackingForm() {
  const [isPending, startTransition] = useTransition();
  const [orderNumber, setOrderNumber] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<any | null>(null);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOrderData(null);

    startTransition(async () => {
      const result = await trackOrder(orderNumber.trim(), emailOrPhone.trim());
      
      if (result?.error) {
        setError(result.error);
      } else if (result?.data) {
        setOrderData(result.data);
      } else {
        setError("An unknown error occurred.");
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Lookup Form */}
      <Card>
        <CardHeader>
          <CardTitle>Lookup Your Order</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTrack} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive p-3 rounded text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="orderNumber">Order Number</Label>
              <Input 
                id="orderNumber" 
                placeholder="e.g. ORD-20260609-1234" 
                required 
                value={orderNumber} 
                onChange={(e) => setOrderNumber(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emailOrPhone">Email Address or Phone Number</Label>
              <Input 
                id="emailOrPhone" 
                placeholder="Enter the contact detail used during checkout" 
                required 
                value={emailOrPhone} 
                onChange={(e) => setEmailOrPhone(e.target.value)} 
              />
              <p className="text-xs text-muted-foreground mt-1">
                For security reasons, we require both the Order Number and the original contact information.
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Searching..." : "Track Order"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Result View */}
      {orderData && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order #</span>
                  <span className="font-medium">{orderData.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span>{new Date(orderData.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-bold">₹{(orderData.grandTotal / 100).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Status</span>
                  <Badge variant={orderData.payments?.[0]?.status === "CAPTURED" ? "default" : "secondary"}>
                    {orderData.payments?.[0]?.status || "PENDING"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Status</span>
                  <Badge className="bg-blue-600">{orderData.status}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {orderData.items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="line-clamp-1">{item.quantity}x {item.productNameSnap}</span>
                    <span className="font-medium shrink-0 ml-4">₹{((item.unitPrice * item.quantity) / 100).toLocaleString()}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                
                {/* Always show the creation event at minimum */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-white bg-slate-300 group-[.is-active]:bg-emerald-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border bg-card shadow-sm">
                    <div className="flex items-center justify-between space-x-2 mb-1">
                      <div className="font-bold text-slate-900 dark:text-white">Order Placed</div>
                      <time className="font-mono text-xs text-slate-500">{new Date(orderData.createdAt).toLocaleString()}</time>
                    </div>
                    <div className="text-sm text-slate-500">We received your order.</div>
                  </div>
                </div>

                {orderData.statusHistory?.map((history: any, _index: number) => (
                  <div key={history.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-white bg-slate-300 group-[.is-active]:bg-emerald-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border bg-card shadow-sm">
                      <div className="flex items-center justify-between space-x-2 mb-1">
                        <div className="font-bold text-slate-900 dark:text-white">{history.status}</div>
                        <time className="font-mono text-xs text-slate-500">{new Date(history.createdAt).toLocaleString()}</time>
                      </div>
                      <div className="text-sm text-slate-500">{history.notes || `Order status updated to ${history.status}`}</div>
                    </div>
                  </div>
                ))}

              </div>
            </CardContent>
          </Card>

        </div>
      )}
    </div>
  );
}
