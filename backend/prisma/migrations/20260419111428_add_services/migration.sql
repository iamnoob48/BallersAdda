-- AlterTable
ALTER TABLE "Academy" ADD COLUMN     "services" TEXT[] DEFAULT ARRAY['Football']::TEXT[];
