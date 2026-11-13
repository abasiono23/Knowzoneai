-- Google Play Billing for the Android app. Flutterwave stays for the web; both feed the same plan.

-- Who manages a plan and where a payment came from: flutterwave | google_play.
ALTER TABLE "Subscription" ADD COLUMN "provider" TEXT NOT NULL DEFAULT 'flutterwave';
ALTER TABLE "Subscription" ADD COLUMN "providerToken" TEXT;
ALTER TABLE "Payment" ADD COLUMN "provider" TEXT NOT NULL DEFAULT 'flutterwave';

-- CreateTable
CREATE TABLE "GooglePlayPurchase" (
    "purchaseToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "basePlanId" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "autoRenew" BOOLEAN NOT NULL DEFAULT false,
    "orderId" TEXT,
    "linkedToken" TEXT,
    "acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GooglePlayPurchase_pkey" PRIMARY KEY ("purchaseToken")
);

-- CreateIndex
CREATE INDEX "GooglePlayPurchase_userId_idx" ON "GooglePlayPurchase"("userId");

-- AddForeignKey
ALTER TABLE "GooglePlayPurchase" ADD CONSTRAINT "GooglePlayPurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Only the server (which bypasses RLS) reads this table.
ALTER TABLE "GooglePlayPurchase" ENABLE ROW LEVEL SECURITY;
