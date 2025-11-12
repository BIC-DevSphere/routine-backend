-- DropIndex-- DropIndex (if exists)-- DropIndex

DROP INDEX IF EXISTS "public"."user_groupId_key";

DROP INDEX IF EXISTS "public"."user_groupId_key";DROP INDEX IF EXISTS "public"."user_groupId_key";

-- AlterTable

ALTER TABLE "user" ALTER COLUMN "groupId" DROP NOT NULL;


-- AlterTable-- AlterTable

ALTER TABLE "user" ALTER COLUMN "groupId" DROP NOT NULL;ALTER TABLE "user" ALTER COLUMN "groupId" DROP NOT NULL;
