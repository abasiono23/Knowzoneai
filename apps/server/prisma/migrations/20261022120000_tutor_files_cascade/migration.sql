-- AlterTable
ALTER TABLE "TutorFile" ADD COLUMN     "conversationId" TEXT;

-- CreateIndex
CREATE INDEX "TutorFile_conversationId_idx" ON "TutorFile"("conversationId");

-- AddForeignKey
ALTER TABLE "TutorFile" ADD CONSTRAINT "TutorFile_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "TutorConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

