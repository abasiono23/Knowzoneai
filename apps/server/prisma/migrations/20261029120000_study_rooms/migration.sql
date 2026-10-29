-- CreateTable
CREATE TABLE "StudyRoom" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT,
    "visibility" TEXT NOT NULL DEFAULT 'private',
    "school" TEXT,
    "hostId" TEXT NOT NULL,
    "goal" TEXT,
    "phase" TEXT NOT NULL DEFAULT 'idle',
    "phaseEndsAt" TIMESTAMP(3),
    "focusMinutes" INTEGER NOT NULL DEFAULT 25,
    "breakMinutes" INTEGER NOT NULL DEFAULT 5,
    "sessions" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudyRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyRoomMember" (
    "roomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "goalDone" BOOLEAN NOT NULL DEFAULT false,
    "focusMinutes" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "StudyRoomMember_pkey" PRIMARY KEY ("roomId","userId")
);

-- CreateTable
CREATE TABLE "StudyRoomMessage" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "userId" TEXT,
    "kind" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "data" JSONB,
    "reports" INTEGER NOT NULL DEFAULT 0,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudyRoomMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyRoomInvite" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "fromId" TEXT NOT NULL,
    "toId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudyRoomInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudyRoom_code_key" ON "StudyRoom"("code");

-- CreateIndex
CREATE INDEX "StudyRoom_visibility_school_idx" ON "StudyRoom"("visibility", "school");

-- CreateIndex
CREATE INDEX "StudyRoomMember_userId_idx" ON "StudyRoomMember"("userId");

-- CreateIndex
CREATE INDEX "StudyRoomMessage_roomId_createdAt_idx" ON "StudyRoomMessage"("roomId", "createdAt");

-- CreateIndex
CREATE INDEX "StudyRoomInvite_toId_status_idx" ON "StudyRoomInvite"("toId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "StudyRoomInvite_roomId_toId_key" ON "StudyRoomInvite"("roomId", "toId");

-- AddForeignKey
ALTER TABLE "StudyRoomMember" ADD CONSTRAINT "StudyRoomMember_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "StudyRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyRoomMember" ADD CONSTRAINT "StudyRoomMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyRoomMessage" ADD CONSTRAINT "StudyRoomMessage_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "StudyRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyRoomMessage" ADD CONSTRAINT "StudyRoomMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyRoomInvite" ADD CONSTRAINT "StudyRoomInvite_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "StudyRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Only the API (which bypasses RLS) reads these tables.
ALTER TABLE "StudyRoom" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StudyRoomMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StudyRoomMessage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StudyRoomInvite" ENABLE ROW LEVEL SECURITY;
