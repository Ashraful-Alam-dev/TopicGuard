/*
  Warnings:

  - A unique constraint covering the columns `[submission_id,student_id]` on the table `topic_members` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `submission_id` to the `topic_members` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "topic_members" ADD COLUMN     "submission_id" UUID NOT NULL;

-- CreateIndex
CREATE INDEX "topic_members_submission_id_idx" ON "topic_members"("submission_id");

-- CreateIndex
CREATE UNIQUE INDEX "topic_members_submission_id_student_id_key" ON "topic_members"("submission_id", "student_id");

-- AddForeignKey
ALTER TABLE "topic_members" ADD CONSTRAINT "topic_members_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
