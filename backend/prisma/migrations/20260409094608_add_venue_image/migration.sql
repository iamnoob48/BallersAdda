-- AlterTable
ALTER TABLE "Tournament" ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "venueImage" TEXT;
