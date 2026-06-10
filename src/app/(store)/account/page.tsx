import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata = {
  title: "My Account | Mobile Accessories",
  description: "Manage your account, orders, and preferences.",
};

export default async function AccountPage() {
  const session = await auth();

  // Redirect to login if the user is not authenticated
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 w-full min-h-[70vh]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">My Account</h1>
        <p className="text-muted-foreground">Welcome back, {session.user.name || session.user.email || 'Customer'}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Info */}
        <Card className="col-span-1 md:col-span-1">
          <CardHeader>
            <CardTitle>Profile Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p className="font-semibold">{session.user.name || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="font-semibold">{session.user.email}</p>
            </div>
            
            <div className="pt-4 border-t mt-4 space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/account/settings">Account Settings</Link>
              </Button>
              <Button variant="outline" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50" asChild>
                <Link href="/api/auth/signout">Sign Out</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Orders & Activity */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg border-dashed">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <span className="text-2xl">📦</span>
              </div>
              <h3 className="font-semibold text-lg mb-1">No orders yet</h3>
              <p className="text-muted-foreground text-sm mb-4">
                When you place orders, they will appear here.
              </p>
              <Button asChild>
                <Link href="/products">Start Shopping</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
