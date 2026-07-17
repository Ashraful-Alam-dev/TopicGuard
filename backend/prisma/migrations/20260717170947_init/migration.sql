-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classrooms" (
    "id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "course_code" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "join_code" VARCHAR(8) NOT NULL,
    "monitor_id" UUID NOT NULL,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "classrooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classroom_members" (
    "id" UUID NOT NULL,
    "classroom_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "classroom_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submissions" (
    "id" UUID NOT NULL,
    "classroom_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "open_date" TIMESTAMP(3) NOT NULL,
    "close_date" TIMESTAMP(3) NOT NULL,
    "is_open" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topics" (
    "id" UUID NOT NULL,
    "submission_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "original_title" VARCHAR(255) NOT NULL,
    "normalized_title" VARCHAR(255) NOT NULL,
    "embedding" vector(384),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "topics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "classrooms_join_code_key" ON "classrooms"("join_code");

-- CreateIndex
CREATE INDEX "classrooms_monitor_id_idx" ON "classrooms"("monitor_id");

-- CreateIndex
CREATE INDEX "classroom_members_user_id_idx" ON "classroom_members"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "classroom_members_classroom_id_user_id_key" ON "classroom_members"("classroom_id", "user_id");

-- CreateIndex
CREATE INDEX "submissions_classroom_id_idx" ON "submissions"("classroom_id");

-- CreateIndex
CREATE INDEX "topics_submission_id_idx" ON "topics"("submission_id");

-- CreateIndex
CREATE INDEX "topics_student_id_idx" ON "topics"("student_id");

-- CreateIndex
CREATE INDEX "topics_submission_id_normalized_title_idx" ON "topics"("submission_id", "normalized_title");

-- CreateIndex
CREATE UNIQUE INDEX "topics_submission_id_student_id_key" ON "topics"("submission_id", "student_id");

-- AddForeignKey
ALTER TABLE "classrooms" ADD CONSTRAINT "classrooms_monitor_id_fkey" FOREIGN KEY ("monitor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classroom_members" ADD CONSTRAINT "classroom_members_classroom_id_fkey" FOREIGN KEY ("classroom_id") REFERENCES "classrooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classroom_members" ADD CONSTRAINT "classroom_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_classroom_id_fkey" FOREIGN KEY ("classroom_id") REFERENCES "classrooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topics" ADD CONSTRAINT "topics_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topics" ADD CONSTRAINT "topics_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
