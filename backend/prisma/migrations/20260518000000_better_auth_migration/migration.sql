-- =====================================================================
-- Migration: Convert User.id from Int to String (CUID) + add better-auth tables
-- This migration preserves all existing data by generating CUIDs for
-- existing users and updating all foreign key references.
-- =====================================================================

-- 1. Add temporary uuid column to User
ALTER TABLE "User" ADD COLUMN "new_id" TEXT;

-- 2. Generate CUIDs for existing users (using gen_random_uuid as placeholder —
--    actual CUIDs will be generated, but UUID v4 is fine for migration)
UPDATE "User" SET "new_id" = gen_random_uuid()::TEXT WHERE "new_id" IS NULL;

-- 3. Create a mapping table for old_id -> new_id
CREATE TEMPORARY TABLE "_user_id_map" AS
SELECT "id" AS "old_id", "new_id" FROM "User";

-- 4. Add temporary FK columns to all tables that reference User.id
ALTER TABLE "PlayerProfile" ADD COLUMN "new_userId" TEXT;
ALTER TABLE "Academy" ADD COLUMN "new_userId" TEXT;
ALTER TABLE "Coach" ADD COLUMN "new_userId" TEXT;
ALTER TABLE "Tournament" ADD COLUMN "new_organizerId" TEXT;
ALTER TABLE "Team" ADD COLUMN "new_captainId" TEXT;
ALTER TABLE "TeamShareLink" ADD COLUMN "new_createdById" TEXT;
ALTER TABLE "AcademyReview" ADD COLUMN "new_userId" TEXT;
ALTER TABLE "PaymentTransaction" ADD COLUMN "new_userId" TEXT;
ALTER TABLE "PushSubscription" ADD COLUMN "new_userId" TEXT;

-- 5. Populate new FK columns from mapping table
UPDATE "PlayerProfile" pp SET "new_userId" = m."new_id" FROM "_user_id_map" m WHERE pp."userId" = m."old_id";
UPDATE "Academy" a SET "new_userId" = m."new_id" FROM "_user_id_map" m WHERE a."userId" = m."old_id";
UPDATE "Coach" c SET "new_userId" = m."new_id" FROM "_user_id_map" m WHERE c."userId" = m."old_id";
UPDATE "Tournament" t SET "new_organizerId" = m."new_id" FROM "_user_id_map" m WHERE t."organizerId" = m."old_id";
UPDATE "Team" t SET "new_captainId" = m."new_id" FROM "_user_id_map" m WHERE t."captainId" = m."old_id";
UPDATE "TeamShareLink" ts SET "new_createdById" = m."new_id" FROM "_user_id_map" m WHERE ts."createdById" = m."old_id";
UPDATE "AcademyReview" ar SET "new_userId" = m."new_id" FROM "_user_id_map" m WHERE ar."userId" = m."old_id";
UPDATE "PaymentTransaction" pt SET "new_userId" = m."new_id" FROM "_user_id_map" m WHERE pt."userId" = m."old_id";
UPDATE "PushSubscription" ps SET "new_userId" = m."new_id" FROM "_user_id_map" m WHERE ps."userId" = m."old_id";

-- 6. Drop old FK constraints
ALTER TABLE "PlayerProfile" DROP CONSTRAINT IF EXISTS "PlayerProfile_userId_fkey";
ALTER TABLE "Academy" DROP CONSTRAINT IF EXISTS "Academy_userId_fkey";
ALTER TABLE "Coach" DROP CONSTRAINT IF EXISTS "Coach_userId_fkey";
ALTER TABLE "Tournament" DROP CONSTRAINT IF EXISTS "Tournament_organizerId_fkey";
ALTER TABLE "Team" DROP CONSTRAINT IF EXISTS "Team_captainId_fkey";
ALTER TABLE "TeamShareLink" DROP CONSTRAINT IF EXISTS "TeamShareLink_createdById_fkey";
ALTER TABLE "AcademyReview" DROP CONSTRAINT IF EXISTS "AcademyReview_userId_fkey";
ALTER TABLE "PaymentTransaction" DROP CONSTRAINT IF EXISTS "PaymentTransaction_userId_fkey";
ALTER TABLE "PushSubscription" DROP CONSTRAINT IF EXISTS "PushSubscription_userId_fkey";

-- 7. Drop old unique constraints on User FK columns
ALTER TABLE "PlayerProfile" DROP CONSTRAINT IF EXISTS "PlayerProfile_userId_key";
ALTER TABLE "Academy" DROP CONSTRAINT IF EXISTS "Academy_userId_key";
ALTER TABLE "Coach" DROP CONSTRAINT IF EXISTS "Coach_userId_key";
ALTER TABLE "AcademyReview" DROP CONSTRAINT IF EXISTS "AcademyReview_userId_academyId_key";

-- 8. Drop old FK columns and rename new ones
ALTER TABLE "PlayerProfile" DROP COLUMN "userId";
ALTER TABLE "PlayerProfile" RENAME COLUMN "new_userId" TO "userId";

ALTER TABLE "Academy" DROP COLUMN "userId";
ALTER TABLE "Academy" RENAME COLUMN "new_userId" TO "userId";

ALTER TABLE "Coach" DROP COLUMN "userId";
ALTER TABLE "Coach" RENAME COLUMN "new_userId" TO "userId";

ALTER TABLE "Tournament" DROP COLUMN "organizerId";
ALTER TABLE "Tournament" RENAME COLUMN "new_organizerId" TO "organizerId";

ALTER TABLE "Team" DROP COLUMN "captainId";
ALTER TABLE "Team" RENAME COLUMN "new_captainId" TO "captainId";

ALTER TABLE "TeamShareLink" DROP COLUMN "createdById";
ALTER TABLE "TeamShareLink" RENAME COLUMN "new_createdById" TO "createdById";

ALTER TABLE "AcademyReview" DROP COLUMN "userId";
ALTER TABLE "AcademyReview" RENAME COLUMN "new_userId" TO "userId";

ALTER TABLE "PaymentTransaction" DROP COLUMN "userId";
ALTER TABLE "PaymentTransaction" RENAME COLUMN "new_userId" TO "userId";

ALTER TABLE "PushSubscription" DROP COLUMN "userId";
ALTER TABLE "PushSubscription" RENAME COLUMN "new_userId" TO "userId";

-- 9. Drop old User PK and convert id
ALTER TABLE "User" DROP CONSTRAINT "User_pkey";
ALTER TABLE "User" DROP COLUMN "id";
ALTER TABLE "User" RENAME COLUMN "new_id" TO "id";
ALTER TABLE "User" ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- 10. Create better-auth Account table BEFORE dropping old columns (need password/googleId data)
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- 10a. Migrate existing passwords to Account table (credential provider)
INSERT INTO "Account" ("id", "accountId", "providerId", "userId", "password", "createdAt", "updatedAt")
SELECT
    gen_random_uuid()::TEXT,
    u."id",
    'credential',
    u."id",
    u."password",
    u."createdAt",
    u."updatedAt"
FROM "User" u
WHERE u."password" IS NOT NULL;

-- 10b. Migrate existing Google accounts to Account table (google provider)
INSERT INTO "Account" ("id", "accountId", "providerId", "userId", "createdAt", "updatedAt")
SELECT
    gen_random_uuid()::TEXT,
    u."googleId",
    'google',
    u."id",
    u."createdAt",
    u."updatedAt"
FROM "User" u
WHERE u."googleId" IS NOT NULL;

-- 10c. Drop unique constraints on columns being removed
DROP INDEX IF EXISTS "User_googleId_key";

-- 10d. Now safe to drop old auth columns
ALTER TABLE "User" DROP COLUMN IF EXISTS "password";
ALTER TABLE "User" DROP COLUMN IF EXISTS "googleId";
ALTER TABLE "User" DROP COLUMN IF EXISTS "tokenVersion";

-- 11. Rename isVerified to emailVerified
ALTER TABLE "User" RENAME COLUMN "isVerified" TO "emailVerified";

-- 12. Recreate unique constraints
ALTER TABLE "PlayerProfile" ADD CONSTRAINT "PlayerProfile_userId_key" UNIQUE ("userId");
ALTER TABLE "Academy" ADD CONSTRAINT "Academy_userId_key" UNIQUE ("userId");
ALTER TABLE "Coach" ADD CONSTRAINT "Coach_userId_key" UNIQUE ("userId");
ALTER TABLE "AcademyReview" ADD CONSTRAINT "AcademyReview_userId_academyId_key" UNIQUE ("userId", "academyId");

-- 13. Recreate FK constraints
ALTER TABLE "PlayerProfile" ADD CONSTRAINT "PlayerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Academy" ADD CONSTRAINT "Academy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Coach" ADD CONSTRAINT "Coach_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Team" ADD CONSTRAINT "Team_captainId_fkey" FOREIGN KEY ("captainId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TeamShareLink" ADD CONSTRAINT "TeamShareLink_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AcademyReview" ADD CONSTRAINT "AcademyReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PushSubscription" ADD CONSTRAINT "PushSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 14. Create remaining better-auth tables (Account already created in step 10)
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

-- 15. Create indexes on better-auth tables
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
CREATE INDEX "Session_token_idx" ON "Session"("token");
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- 16. Add FK constraints for better-auth tables
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Drop temporary mapping table
DROP TABLE IF EXISTS "_user_id_map";
