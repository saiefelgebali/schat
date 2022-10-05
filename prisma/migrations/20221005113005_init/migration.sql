-- CreateTable
CREATE TABLE "User" (
    "username" TEXT NOT NULL PRIMARY KEY,
    "password" TEXT NOT NULL,
    "token" TEXT
);

-- CreateTable
CREATE TABLE "Profile" (
    "username" TEXT NOT NULL PRIMARY KEY,
    CONSTRAINT "Profile_username_fkey" FOREIGN KEY ("username") REFERENCES "User" ("username") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FriendRequest" (
    "fromUsername" TEXT NOT NULL,
    "toUsername" TEXT NOT NULL,

    PRIMARY KEY ("fromUsername", "toUsername"),
    CONSTRAINT "FriendRequest_fromUsername_fkey" FOREIGN KEY ("fromUsername") REFERENCES "Profile" ("username") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FriendRequest_toUsername_fkey" FOREIGN KEY ("toUsername") REFERENCES "Profile" ("username") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Friend" (
    "username" TEXT NOT NULL PRIMARY KEY,
    "lastSeen" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Friend_username_fkey" FOREIGN KEY ("username") REFERENCES "Profile" ("username") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "text" TEXT NOT NULL,
    "fromUsername" TEXT NOT NULL,
    "toUsername" TEXT NOT NULL,
    CONSTRAINT "ChatMessage_fromUsername_fkey" FOREIGN KEY ("fromUsername") REFERENCES "Profile" ("username") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ChatMessage_toUsername_fkey" FOREIGN KEY ("toUsername") REFERENCES "Profile" ("username") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_friend" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_friend_A_fkey" FOREIGN KEY ("A") REFERENCES "Friend" ("username") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_friend_B_fkey" FOREIGN KEY ("B") REFERENCES "Profile" ("username") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_token_key" ON "User"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_username_key" ON "Profile"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Friend_username_key" ON "Friend"("username");

-- CreateIndex
CREATE UNIQUE INDEX "ChatMessage_id_key" ON "ChatMessage"("id");

-- CreateIndex
CREATE UNIQUE INDEX "_friend_AB_unique" ON "_friend"("A", "B");

-- CreateIndex
CREATE INDEX "_friend_B_index" ON "_friend"("B");
