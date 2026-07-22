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

/**
 * `Topic.embedding` is declared as `Unsupported("vector(384)")` in
 * schema.prisma, which means Prisma Client omits it entirely from the
 * generated model type — it cannot be selected, included, or written via
 * the normal `prisma.topic.*` API. All reads/writes of that column are
 * isolated here behind raw SQL, so the rest of the app never has to deal
 * with that limitation directly.
 */
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
  ): Promise<SimilarTopicRow[]> {
    const vectorLiteral = toVectorLiteral(embedding);
    const excludeClause = excludeTopicId
      ? Prisma.sql`AND t.id != ${excludeTopicId}::uuid`
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
      ORDER BY t.embedding <=> ${vectorLiteral}::vector ASC
      LIMIT ${limit}
    `;
  }
}
