-- AlterTable
ALTER TABLE "Academy" ADD COLUMN     "detailedInfo" TEXT;

-- CreateTable
CREATE TABLE "AcademyPicture" (
    "id" SERIAL NOT NULL,
    "academyId" INTEGER NOT NULL,
    "pictureURL" TEXT NOT NULL,
    "publicId" TEXT,
    "provider" TEXT,
    "altText" TEXT,
    "caption" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "contentType" TEXT,
    "sizeInBytes" INTEGER,
    "sortOrder" INTEGER DEFAULT 0,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademyPicture_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AcademyPicture_academyId_idx" ON "AcademyPicture"("academyId");

-- CreateIndex
CREATE INDEX "AcademyPicture_academyId_isPrimary_idx" ON "AcademyPicture"("academyId", "isPrimary");

-- CreateIndex
CREATE UNIQUE INDEX "AcademyPicture_academyId_isPrimary_key" ON "AcademyPicture"("academyId", "isPrimary");

-- AddForeignKey
ALTER TABLE "AcademyPicture" ADD CONSTRAINT "AcademyPicture_academyId_fkey" FOREIGN KEY ("academyId") REFERENCES "Academy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
