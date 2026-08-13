-- CreateTable
CREATE TABLE "verification_tokens" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "type" VARCHAR(30) NOT NULL,
    "name" VARCHAR(100),
    "password_hash" TEXT,
    "otp_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "verification_tokens_email_idx" ON "verification_tokens"("email");

-- CreateIndex
CREATE INDEX "verification_tokens_expires_at_idx" ON "verification_tokens"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_email_type_key" ON "verification_tokens"("email", "type");
