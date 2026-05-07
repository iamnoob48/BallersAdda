/*
  Warnings:

  - The values [PREFER_NOT_TO_SAY] on the enum `Gender` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `age` on the `PlayerProfile` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Gender_new" AS ENUM ('MALE', 'FEMALE', 'OTHER');
ALTER TABLE "PlayerProfile" ALTER COLUMN "gender" TYPE "Gender_new" USING ("gender"::text::"Gender_new");
ALTER TYPE "Gender" RENAME TO "Gender_old";
ALTER TYPE "Gender_new" RENAME TO "Gender";
DROP TYPE "public"."Gender_old";
COMMIT;

-- AlterTable
ALTER TABLE "PlayerProfile" DROP COLUMN "age",
ADD COLUMN     "dateOfBirth" TIMESTAMP(3);
