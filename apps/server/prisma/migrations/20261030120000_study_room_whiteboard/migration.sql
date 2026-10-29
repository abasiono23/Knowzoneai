-- AlterTable
ALTER TABLE "StudyRoom" ADD COLUMN     "boardVersion" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "StudyRoomStroke" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "points" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudyRoomStroke_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudyRoomStroke_roomId_createdAt_idx" ON "StudyRoomStroke"("roomId", "createdAt");

-- AddForeignKey
ALTER TABLE "StudyRoomStroke" ADD CONSTRAINT "StudyRoomStroke_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "StudyRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyRoomStroke" ADD CONSTRAINT "StudyRoomStroke_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Server-only table: no direct access through the Supabase API.
ALTER TABLE "StudyRoomStroke" ENABLE ROW LEVEL SECURITY;
