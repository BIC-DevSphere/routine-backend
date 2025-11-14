/*
  Warnings:

  - A unique constraint covering the columns `[hash]` on the table `routine` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `hash` to the `routine` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "routine" ADD COLUMN     "hash" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "routine_hash_key" ON "routine"("hash");
