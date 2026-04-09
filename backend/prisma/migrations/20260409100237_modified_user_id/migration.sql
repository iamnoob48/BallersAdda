-- DropForeignKey
ALTER TABLE "public"."Academy" DROP CONSTRAINT "Academy_userId_fkey";

-- AlterTable
ALTER TABLE "Academy" ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Academy" ADD CONSTRAINT "Academy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
