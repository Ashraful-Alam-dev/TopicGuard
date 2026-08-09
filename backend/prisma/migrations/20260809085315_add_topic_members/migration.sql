-- CreateTable
CREATE TABLE "topic_members" (
    "id" UUID NOT NULL,
    "topic_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "topic_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "topic_members_student_id_idx" ON "topic_members"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "topic_members_topic_id_student_id_key" ON "topic_members"("topic_id", "student_id");

-- AddForeignKey
ALTER TABLE "topic_members" ADD CONSTRAINT "topic_members_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic_members" ADD CONSTRAINT "topic_members_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
