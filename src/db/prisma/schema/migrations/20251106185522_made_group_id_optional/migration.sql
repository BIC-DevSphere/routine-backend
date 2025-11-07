-- DropIndex
DROP INDEX "public"."user_groupId_key";

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "groupId" DROP NOT NULL;
