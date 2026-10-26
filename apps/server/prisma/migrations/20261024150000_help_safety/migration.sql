-- AlterTable
ALTER TABLE "User" ADD COLUMN     "restriction" JSONB;

-- CreateTable
CREATE TABLE "HelpTicket" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "topic" TEXT,
    "subject" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "meta" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HelpTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HelpMessage" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "template" TEXT,
    "staff" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HelpMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HelpFile" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "data" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HelpFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlockedUser" (
    "userId" TEXT NOT NULL,
    "blockedId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlockedUser_pkey" PRIMARY KEY ("userId","blockedId")
);

-- CreateTable
CREATE TABLE "HiddenItem" (
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HiddenItem_pkey" PRIMARY KEY ("userId","type","itemId")
);

-- CreateTable
CREATE TABLE "CopyrightNotice" (
    "reference" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "organisation" TEXT NOT NULL DEFAULT '',
    "work" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CopyrightNotice_pkey" PRIMARY KEY ("reference")
);

-- CreateIndex
CREATE INDEX "HelpTicket_userId_updatedAt_idx" ON "HelpTicket"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "HelpTicket_status_kind_createdAt_idx" ON "HelpTicket"("status", "kind", "createdAt");

-- CreateIndex
CREATE INDEX "HelpMessage_ticketId_createdAt_idx" ON "HelpMessage"("ticketId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "HelpFile_token_key" ON "HelpFile"("token");

-- CreateIndex
CREATE INDEX "HelpFile_userId_idx" ON "HelpFile"("userId");

-- CreateIndex
CREATE INDEX "HiddenItem_userId_createdAt_idx" ON "HiddenItem"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "CopyrightNotice_status_createdAt_idx" ON "CopyrightNotice"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "HelpTicket" ADD CONSTRAINT "HelpTicket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelpMessage" ADD CONSTRAINT "HelpMessage_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "HelpTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelpFile" ADD CONSTRAINT "HelpFile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockedUser" ADD CONSTRAINT "BlockedUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HiddenItem" ADD CONSTRAINT "HiddenItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Only the API (which bypasses RLS) reads these tables; nothing is exposed through Supabase's data API.
ALTER TABLE "HelpTicket" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "HelpMessage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "HelpFile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BlockedUser" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "HiddenItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CopyrightNotice" ENABLE ROW LEVEL SECURITY;
