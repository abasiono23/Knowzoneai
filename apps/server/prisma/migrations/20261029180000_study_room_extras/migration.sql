-- AlterTable
ALTER TABLE "StudyRoom" ADD COLUMN     "bestStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastStudyDay" TEXT,
ADD COLUMN     "nextSessionAt" TIMESTAMP(3),
ADD COLUMN     "nextSessionMinutes" INTEGER NOT NULL DEFAULT 25,
ADD COLUMN     "remindedAt" TIMESTAMP(3),
ADD COLUMN     "streak" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "StudyRoomSession" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "endedAt" TIMESTAMP(3) NOT NULL,
    "minutes" INTEGER NOT NULL,
    "people" INTEGER NOT NULL,

    CONSTRAINT "StudyRoomSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyRoomQuiz" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "exam" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "questions" JSONB NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "StudyRoomQuiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyRoomQuizAnswer" (
    "quizId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "choice" INTEGER NOT NULL,
    "correct" BOOLEAN NOT NULL,
    "points" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudyRoomQuizAnswer_pkey" PRIMARY KEY ("quizId","userId","index")
);

-- CreateIndex
CREATE INDEX "StudyRoomSession_roomId_endedAt_idx" ON "StudyRoomSession"("roomId", "endedAt");

-- CreateIndex
CREATE INDEX "StudyRoomQuiz_roomId_startedAt_idx" ON "StudyRoomQuiz"("roomId", "startedAt");

-- CreateIndex
CREATE INDEX "StudyRoom_nextSessionAt_idx" ON "StudyRoom"("nextSessionAt");

-- AddForeignKey
ALTER TABLE "StudyRoomSession" ADD CONSTRAINT "StudyRoomSession_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "StudyRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyRoomQuiz" ADD CONSTRAINT "StudyRoomQuiz_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "StudyRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyRoomQuizAnswer" ADD CONSTRAINT "StudyRoomQuizAnswer_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "StudyRoomQuiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyRoomQuizAnswer" ADD CONSTRAINT "StudyRoomQuizAnswer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Server-only tables: no direct access through the Supabase API.
ALTER TABLE "StudyRoomSession" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StudyRoomQuiz" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StudyRoomQuizAnswer" ENABLE ROW LEVEL SECURITY;
