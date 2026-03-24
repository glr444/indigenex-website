-- AlterTable
ALTER TABLE "FreightRate" ADD COLUMN "carrierLogo" TEXT;
ALTER TABLE "FreightRate" ADD COLUMN "cutOffDate" DATETIME;
ALTER TABLE "FreightRate" ADD COLUMN "destinationPortEn" TEXT;
ALTER TABLE "FreightRate" ADD COLUMN "estimatedDeparture" DATETIME;
ALTER TABLE "FreightRate" ADD COLUMN "originPortEn" TEXT;
ALTER TABLE "FreightRate" ADD COLUMN "spaceStatus" TEXT DEFAULT 'AVAILABLE';
ALTER TABLE "FreightRate" ADD COLUMN "viaPortEn" TEXT;

-- CreateIndex
CREATE INDEX "FreightRate_originPortEn_destinationPortEn_idx" ON "FreightRate"("originPortEn", "destinationPortEn");
