-- DropForeignKey
ALTER TABLE "Flashcard" DROP CONSTRAINT "Flashcard_materialId_fkey";

-- DropForeignKey
ALTER TABLE "QuizQuestion" DROP CONSTRAINT "QuizQuestion_materialId_fkey";

-- AlterTable
ALTER TABLE "Material" DROP COLUMN "summary",
ADD COLUMN     "cards" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "content" JSONB,
ADD COLUMN     "creditHeld" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "error" JSONB,
ADD COLUMN     "fileName" TEXT,
ADD COLUMN     "fileSize" INTEGER,
ADD COLUMN     "folder" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "offline" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "options" JSONB NOT NULL,
ADD COLUMN     "saved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sourceLabel" TEXT NOT NULL,
ADD COLUMN     "sourceUrl" TEXT,
ADD COLUMN     "stage" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "sourceText" SET DEFAULT '';

-- AlterTable
ALTER TABLE "QuizAttempt" ADD COLUMN     "answers" JSONB NOT NULL,
ADD COLUMN     "questionIds" TEXT[],
ADD COLUMN     "seconds" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "settings" JSONB NOT NULL;

-- DropTable
DROP TABLE "Flashcard";

-- DropTable
DROP TABLE "QuizQuestion";

-- CreateTable
CREATE TABLE "MaterialFile" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "data" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MaterialFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MaterialFile_token_key" ON "MaterialFile"("token");

-- CreateIndex
CREATE INDEX "MaterialFile_materialId_idx" ON "MaterialFile"("materialId");

-- CreateIndex
CREATE INDEX "QuizAttempt_materialId_createdAt_idx" ON "QuizAttempt"("materialId", "createdAt");

-- AddForeignKey
ALTER TABLE "MaterialFile" ADD CONSTRAINT "MaterialFile_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Same as every other table: no access through Supabase's public API keys, only the server's connection.
ALTER TABLE "MaterialFile" ENABLE ROW LEVEL SECURITY;
