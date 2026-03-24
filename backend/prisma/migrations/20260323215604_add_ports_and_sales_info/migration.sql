-- AlterTable
ALTER TABLE "Member" ADD COLUMN "salesEmail" TEXT;
ALTER TABLE "Member" ADD COLUMN "salesMobile" TEXT;
ALTER TABLE "Member" ADD COLUMN "salesName" TEXT;
ALTER TABLE "Member" ADD COLUMN "salesPhone" TEXT;

-- CreateTable
CREATE TABLE "Port" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameCn" TEXT NOT NULL,
    "countryCode" TEXT,
    "countryName" TEXT,
    "region" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MemberPortPreference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "memberId" TEXT NOT NULL,
    "portCode" TEXT NOT NULL,
    "portType" TEXT NOT NULL,
    "queryCount" INTEGER NOT NULL DEFAULT 1,
    "lastQueryAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MemberPortPreference_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Port_code_key" ON "Port"("code");

-- CreateIndex
CREATE INDEX "Port_code_idx" ON "Port"("code");

-- CreateIndex
CREATE INDEX "Port_nameEn_idx" ON "Port"("nameEn");

-- CreateIndex
CREATE INDEX "Port_nameCn_idx" ON "Port"("nameCn");

-- CreateIndex
CREATE INDEX "Port_region_idx" ON "Port"("region");

-- CreateIndex
CREATE INDEX "MemberPortPreference_memberId_idx" ON "MemberPortPreference"("memberId");

-- CreateIndex
CREATE INDEX "MemberPortPreference_portCode_idx" ON "MemberPortPreference"("portCode");

-- CreateIndex
CREATE UNIQUE INDEX "MemberPortPreference_memberId_portCode_portType_key" ON "MemberPortPreference"("memberId", "portCode", "portType");
