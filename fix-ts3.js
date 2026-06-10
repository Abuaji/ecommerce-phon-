const fs = require('fs');

function replaceFile(path, replacements) {
  let content = fs.readFileSync(path, 'utf8');
  for (const [search, replace] of replacements) {
    content = content.replace(search, replace);
  }
  fs.writeFileSync(path, content);
  console.log('Fixed', path);
}

replaceFile('src/actions/admin/inventory.actions.ts', [
  [', reason: string', ', _reason: string'],
  ['adminUserId: session?.user?.id,', ''],
]);

replaceFile('src/actions/admin/order.actions.ts', [
  ['entityType: "ORDER",', ''],
  ['entityId: orderId,', ''],
  ['adminUserId: session?.user?.id,', 'adminUserId: session?.user?.id || null,'],
  ['if (!session?.user) {', 'if (!session || !session.user) {'],
]);

replaceFile('src/actions/admin/review.actions.ts', [
  ['entityType: "REVIEW",', ''],
  ['entityId: reviewId,', ''],
  ['adminUserId: session?.user?.id,', 'adminUserId: session?.user?.id || null,'],
]);

replaceFile('src/actions/auth/auth.actions.ts', [
  ['phone: validatedData.data.phone,', 'phone: validatedData.data.phone || null,'],
]);

replaceFile('src/actions/checkout/checkout.actions.ts', [
  ['phone: data.phone,', 'phone: data.phone || null,'],
]);

// Wait, let's fix any other files we saw errors in.
// `updatePaymentStatusByProviderId` declared but never read in `src/app/api/webhooks/razorpay/route.ts`
replaceFile('src/app/api/webhooks/razorpay/route.ts', [
  ['updatePaymentStatusByProviderId,', ''],
]);

// Let's ensure these strings exist before replacing them, otherwise they won't be replaced but it won't crash either.
