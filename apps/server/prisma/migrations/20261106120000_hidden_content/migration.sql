-- CreateTable
CREATE TABLE "HiddenContent" (
    "kind" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "hiddenBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HiddenContent_pkey" PRIMARY KEY ("kind","itemId")
);

-- Only the server reads this; the public database interface gets nothing.
ALTER TABLE "HiddenContent" ENABLE ROW LEVEL SECURITY;
