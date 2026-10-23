/*
  Warnings:

  - A unique constraint covering the columns `[organizationId,userId]` on the table `member` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "VideoStatus" AS ENUM ('UPLOADING', 'PROCESSING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "AnnotationStatus" AS ENUM ('OPEN', 'RESOLVED');

-- DropIndex
DROP INDEX "member_organizationId_idx";

-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "uploaderId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "VideoStatus" NOT NULL DEFAULT 'UPLOADING',
    "originalKey" TEXT NOT NULL,
    "posterKey" TEXT,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" BIGINT NOT NULL,
    "durationMs" INTEGER,
    "width" INTEGER,
    "height" INTEGER,
    "fps" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Annotation" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "startMs" INTEGER NOT NULL,
    "endMs" INTEGER NOT NULL,
    "body" VARCHAR(2000) NOT NULL,
    "status" "AnnotationStatus" NOT NULL DEFAULT 'OPEN',
    "screenshotKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Annotation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnnotationReply" (
    "id" TEXT NOT NULL,
    "annotationId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "body" VARCHAR(2000) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "AnnotationReply_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Video_originalKey_key" ON "Video"("originalKey");

-- CreateIndex
CREATE INDEX "Video_organizationId_createdAt_id_idx" ON "Video"("organizationId", "createdAt" DESC, "id" DESC);

-- CreateIndex
CREATE INDEX "Video_uploaderId_createdAt_idx" ON "Video"("uploaderId", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "Video_id_organizationId_key" ON "Video"("id", "organizationId");

-- CreateIndex
CREATE INDEX "Annotation_videoId_startMs_id_idx" ON "Annotation"("videoId", "startMs", "id");

-- CreateIndex
CREATE INDEX "Annotation_authorId_createdAt_idx" ON "Annotation"("authorId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "AnnotationReply_annotationId_createdAt_idx" ON "AnnotationReply"("annotationId", "createdAt");

-- CreateIndex
CREATE INDEX "AnnotationReply_authorId_createdAt_idx" ON "AnnotationReply"("authorId", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "member_organizationId_userId_key" ON "member"("organizationId", "userId");

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Annotation" ADD CONSTRAINT "Annotation_videoId_organizationId_fkey" FOREIGN KEY ("videoId", "organizationId") REFERENCES "Video"("id", "organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Annotation" ADD CONSTRAINT "Annotation_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnnotationReply" ADD CONSTRAINT "AnnotationReply_annotationId_fkey" FOREIGN KEY ("annotationId") REFERENCES "Annotation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnnotationReply" ADD CONSTRAINT "AnnotationReply_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
