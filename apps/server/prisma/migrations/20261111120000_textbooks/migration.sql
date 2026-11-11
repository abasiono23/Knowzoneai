-- CreateTable
CREATE TABLE "Textbook" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "pageCount" INTEGER NOT NULL DEFAULT 0,
    "pages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "topics" JSONB NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'reading',
    "error" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Textbook_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Textbook_userId_createdAt_idx" ON "Textbook"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "Textbook" ADD CONSTRAINT "Textbook_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Only the server (which bypasses RLS) reads this table.
ALTER TABLE "Textbook" ENABLE ROW LEVEL SECURITY;
