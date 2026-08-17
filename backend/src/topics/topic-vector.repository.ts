import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { toVectorLiteral } from '../common/utils/vector.util';

/** Any Prisma client capable of running raw queries — the real client or a $transaction callback client. */
type PrismaExecutor = PrismaService | Prisma.TransactionClient;

export interface SimilarTopicRow {
  topicId: string;
  submissionId: string;
  title: string;
  studentName: string | null;
  similarity: number;
}

/** `Topic.embedding` is declared as `Unsupported("vector(384)")` in schema.prisma, which means Prisma Client omits it entirely from the generated model type — it cannot be selected, included, or written via the normal `prisma.topic.*` API. */
@Injectable()
export class TopicVectorRepository {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * Inserts or replaces the embedding for a topic. Called on both create
   * and edit, since an edited title must invalidate the old vector.
   */
  async upsertEmbedding(
    executor: PrismaExecutor,
    topicId: string,
    embedding: number[],
  ): Promise<void> {
    const vectorLiteral = toVectorLiteral(embedding);

    await executor.$executeRaw`
      UPDATE topics
      SET embedding = ${vectorLiteral}::vector
      WHERE id = ${topicId}::uuid
    `;
  }

  async findSimilarTopics(
    executor: PrismaExecutor,
    submissionId: string,
    embedding: number[],
    limit: number,
    excludeTopicId?: string,
    excludeStudentId?: string,
  ): Promise<SimilarTopicRow[]> {
    const vectorLiteral = toVectorLiteral(embedding);
    const excludeClause = excludeTopicId
      ? Prisma.sql`AND t.id != ${excludeTopicId}::uuid`
      : Prisma.empty;
    const excludeStudentClause = excludeStudentId
      ? Prisma.sql`AND t.student_id != ${excludeStudentId}::uuid`
      : Prisma.empty;

    return executor.$queryRaw<SimilarTopicRow[]>`
      SELECT
        t.id AS "topicId",
        t.submission_id AS "submissionId",
        t.original_title AS "title",
        u.name AS "studentName",
        1 - (t.embedding <=> ${vectorLiteral}::vector) AS "similarity"
      FROM topics t
      JOIN users u ON u.id = t.student_id
      WHERE
        t.submission_id = ${submissionId}::uuid
        AND t.embedding IS NOT NULL
      ${excludeClause}
      ${excludeStudentClause}
      ORDER BY t.embedding <=> ${vectorLiteral}::vector ASC
      LIMIT ${limit}
    `;
  }

  async findSimilarTopicsByTopicId(
    executor: PrismaExecutor,
    submissionId: string,
    topicId: string,
    limit: number,
  ): Promise<SimilarTopicRow[]> {
    return executor.$queryRaw<SimilarTopicRow[]>`
    SELECT
      t2.id AS "topicId",
      t2.submission_id AS "submissionId",
      t2.original_title AS "title",
      u.name AS "studentName",
      1 - (t1.embedding <=> t2.embedding) AS "similarity"
    FROM topics t1
    JOIN topics t2
      ON t2.submission_id = t1.submission_id
     AND t2.id <> t1.id
    JOIN users u
      ON u.id = t2.student_id
    WHERE
      t1.id = ${topicId}::uuid
      AND t1.submission_id = ${submissionId}::uuid
      AND t1.embedding IS NOT NULL
      AND t2.embedding IS NOT NULL
    ORDER BY
      t1.embedding <=> t2.embedding
    LIMIT ${limit}
  `;
  }
}
