-- CreateTable
CREATE TABLE "TutorConversation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subject" TEXT NOT NULL DEFAULT 'General',
    "mode" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "context" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TutorConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TutorMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "text" TEXT NOT NULL DEFAULT '',
    "attachment" JSONB,
    "answer" JSONB,
    "status" TEXT NOT NULL DEFAULT 'ok',
    "error" JSONB,
    "replyToId" TEXT,
    "extras" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TutorMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TutorFile" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "data" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TutorFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TutorNote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "notebook" TEXT NOT NULL,
    "tags" TEXT[],
    "summary" TEXT NOT NULL,
    "body" JSONB NOT NULL,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TutorNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TutorDeck" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "cards" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TutorDeck_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TutorConversation_userId_updatedAt_idx" ON "TutorConversation"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "TutorMessage_conversationId_createdAt_idx" ON "TutorMessage"("conversationId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "TutorFile_token_key" ON "TutorFile"("token");

-- CreateIndex
CREATE INDEX "TutorFile_userId_idx" ON "TutorFile"("userId");

-- CreateIndex
CREATE INDEX "TutorNote_userId_createdAt_idx" ON "TutorNote"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "TutorDeck_userId_createdAt_idx" ON "TutorDeck"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "TutorConversation" ADD CONSTRAINT "TutorConversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutorMessage" ADD CONSTRAINT "TutorMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "TutorConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutorFile" ADD CONSTRAINT "TutorFile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutorNote" ADD CONSTRAINT "TutorNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutorDeck" ADD CONSTRAINT "TutorDeck_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Same as every other table: no access through Supabase's public API keys, only the server's connection.
ALTER TABLE "TutorConversation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TutorMessage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TutorFile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TutorNote" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TutorDeck" ENABLE ROW LEVEL SECURITY;
