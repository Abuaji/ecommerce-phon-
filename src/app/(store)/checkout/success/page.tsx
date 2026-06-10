import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const orderId = params.order_id;
  const paymentId = params.payment_id;

  return (
    <div className="max-w-3xl mx-auto px-4 py-32 text-center min-h-[70vh] flex flex-col justify-center items-center">
      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <h1 className="text-4xl font-extrabold tracking-tight mb-4">Payment Successful!</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Thank you for your order. We are processing it and will ship it soon.
      </p>

      {orderId && (
        <div className="bg-muted p-4 rounded-md mb-8 inline-block text-left min-w-[300px]">
          <p className="text-sm text-muted-foreground mb-1">Order Reference</p>
          <p className="font-mono font-bold text-lg">{orderId}</p>
          {paymentId && (
            <>
              <p className="text-sm text-muted-foreground mt-4 mb-1">Payment ID</p>
              <p className="font-mono text-sm">{paymentId}</p>
            </>
          )}
        </div>
      )}

      <div>
        <Button size="lg">
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
}
