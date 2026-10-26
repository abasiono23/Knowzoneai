-- CreateTable
CREATE TABLE "GameRun" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "game" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "seed" TEXT NOT NULL,
    "state" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'playing',
    "score" INTEGER NOT NULL DEFAULT 0,
    "correct" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL DEFAULT 0,
    "hearts" INTEGER NOT NULL DEFAULT 3,
    "stars" INTEGER NOT NULL DEFAULT 0,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "coins" INTEGER NOT NULL DEFAULT 0,
    "hintCoins" INTEGER NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "GameRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameProgress" (
    "userId" TEXT NOT NULL,
    "game" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "bestStars" INTEGER NOT NULL DEFAULT 0,
    "bestScore" INTEGER NOT NULL DEFAULT 0,
    "plays" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameProgress_pkey" PRIMARY KEY ("userId","game","level")
);

-- CreateIndex
CREATE INDEX "GameRun_userId_status_startedAt_idx" ON "GameRun"("userId", "status", "startedAt");

-- CreateIndex
CREATE INDEX "GameRun_game_level_status_finishedAt_idx" ON "GameRun"("game", "level", "status", "finishedAt");

-- AddForeignKey
ALTER TABLE "GameRun" ADD CONSTRAINT "GameRun_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameProgress" ADD CONSTRAINT "GameProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Only the API (which bypasses RLS) reads these tables.
ALTER TABLE "GameRun" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "GameProgress" ENABLE ROW LEVEL SECURITY;
