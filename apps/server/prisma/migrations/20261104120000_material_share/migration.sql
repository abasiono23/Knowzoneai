-- AlterTable
ALTER TABLE "Material" ADD COLUMN     "shareToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Material_shareToken_key" ON "Material"("shareToken");

