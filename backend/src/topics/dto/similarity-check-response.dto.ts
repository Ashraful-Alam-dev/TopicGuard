import { SimilarTopicRow } from '../topic-vector.repository';

export class DuplicateTopicDto {
  studentId!: string;
  studentName!: string;
  title!: string;
}

export class SimilarTopicDto {
  title!: string;
  similarityScore!: number;
  submissionId!: string;
  studentName?: string;

  static fromRow(row: SimilarTopicRow): SimilarTopicDto {
    const dto = new SimilarTopicDto();
    dto.title = row.title;
    dto.similarityScore = Math.round(row.similarity * 10000) / 10000;
    dto.submissionId = row.submissionId;
    dto.studentName = row.studentName ?? undefined;
    return dto;
  }
}

/**
 * Only exact duplicates are rejected. This response never blocks
 * submission — it either reports the exact duplicate that already exists,
 * or the closest semantic matches so the student can make an informed
 * choice.
 */
export class SimilarityCheckResponseDto {
  isDuplicate!: boolean;
  duplicate?: DuplicateTopicDto;
  similarTopics?: SimilarTopicDto[];

  static duplicateOf(topic: {
    originalTitle: string;
    student: { id: string; name: string };
  }): SimilarityCheckResponseDto {
    const dto = new SimilarityCheckResponseDto();
    dto.isDuplicate = true;
    dto.duplicate = {
      studentId: topic.student.id,
      studentName: topic.student.name,
      title: topic.originalTitle,
    };
    return dto;
  }

  static withSimilarTopics(rows: SimilarTopicRow[]): SimilarityCheckResponseDto {
    const dto = new SimilarityCheckResponseDto();
    dto.isDuplicate = false;
    dto.similarTopics = rows.map((row) => SimilarTopicDto.fromRow(row));
    return dto;
  }
}
