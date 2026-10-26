-- AlterTable
ALTER TABLE "User" ADD COLUMN     "videoCollections" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "origin" TEXT NOT NULL,
    "lessonId" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "title" TEXT NOT NULL,
    "subject" TEXT NOT NULL DEFAULT 'General',
    "level" TEXT NOT NULL DEFAULT 'Your level',
    "description" TEXT NOT NULL DEFAULT '',
    "settings" JSONB NOT NULL,
    "source" JSONB,
    "scenes" JSONB NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'generating',
    "stage" INTEGER NOT NULL DEFAULT 0,
    "error" JSONB,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "creditsHeld" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "baseLikes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoFile" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "data" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VideoFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoUserState" (
    "userId" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "liked" BOOLEAN NOT NULL DEFAULT false,
    "collection" TEXT,
    "offline" BOOLEAN NOT NULL DEFAULT false,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "viewed" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VideoUserState_pkey" PRIMARY KEY ("userId","videoId")
);

-- CreateTable
CREATE TABLE "VideoReport" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "details" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VideoReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Video_userId_createdAt_idx" ON "Video"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Video_lessonId_language_key" ON "Video"("lessonId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "VideoFile_token_key" ON "VideoFile"("token");

-- CreateIndex
CREATE INDEX "VideoFile_videoId_idx" ON "VideoFile"("videoId");

-- CreateIndex
CREATE INDEX "VideoUserState_videoId_idx" ON "VideoUserState"("videoId");

-- CreateIndex
CREATE INDEX "VideoReport_status_createdAt_idx" ON "VideoReport"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoFile" ADD CONSTRAINT "VideoFile_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoUserState" ADD CONSTRAINT "VideoUserState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoReport" ADD CONSTRAINT "VideoReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Same as every other table: no access through Supabase's public API keys, only the server's connection.
ALTER TABLE "Video" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VideoFile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VideoUserState" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VideoReport" ENABLE ROW LEVEL SECURITY;
