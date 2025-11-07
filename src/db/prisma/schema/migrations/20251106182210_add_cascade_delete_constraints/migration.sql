-- DropForeignKey
ALTER TABLE "public"."group" DROP CONSTRAINT "group_batchId_fkey";

-- DropForeignKey
ALTER TABLE "public"."group" DROP CONSTRAINT "group_courseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."routine" DROP CONSTRAINT "routine_moduleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."routine" DROP CONSTRAINT "routine_roomId_fkey";

-- DropForeignKey
ALTER TABLE "public"."routine" DROP CONSTRAINT "routine_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "public"."routine_group" DROP CONSTRAINT "routine_group_groupId_fkey";

-- DropForeignKey
ALTER TABLE "public"."routine_group" DROP CONSTRAINT "routine_group_routineId_fkey";

-- DropForeignKey
ALTER TABLE "public"."user" DROP CONSTRAINT "user_groupId_fkey";

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group" ADD CONSTRAINT "group_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group" ADD CONSTRAINT "group_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routine" ADD CONSTRAINT "routine_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routine" ADD CONSTRAINT "routine_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routine" ADD CONSTRAINT "routine_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routine_group" ADD CONSTRAINT "routine_group_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routine_group" ADD CONSTRAINT "routine_group_routineId_fkey" FOREIGN KEY ("routineId") REFERENCES "routine"("id") ON DELETE CASCADE ON UPDATE CASCADE;
