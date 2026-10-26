-- DropIndex
DROP INDEX "Redemption_userId_rewardId_key";

-- CreateIndex
CREATE INDEX "Redemption_userId_rewardId_idx" ON "Redemption"("userId", "rewardId");

