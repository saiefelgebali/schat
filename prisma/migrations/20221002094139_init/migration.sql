-- CreateTable
CREATE TABLE "User" (
    "username" TEXT NOT NULL PRIMARY KEY,
    "password" TEXT NOT NULL,
    "token" TEXT
);

-- CreateTable
CREATE TABLE "Profile" (
    "username" TEXT NOT NULL PRIMARY KEY,
    "lastSeen" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "_ProfileToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ProfileToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Profile" ("username") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ProfileToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("username") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_token_key" ON "User"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_username_key" ON "Profile"("username");

-- CreateIndex
CREATE UNIQUE INDEX "_ProfileToUser_AB_unique" ON "_ProfileToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_ProfileToUser_B_index" ON "_ProfileToUser"("B");
