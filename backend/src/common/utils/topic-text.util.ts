/**
 * A topic's title and optional description share the single `original_title`
 * column (no schema change): `"<title>\n<description>"`.
 *
 * Both parts are collapsed to one line before they are stored, so the first
 * newline is always an unambiguous separator. Rows written before descriptions
 * existed contain no newline and simply read back as title-only.
 */
export const TOPIC_TITLE_MAX_LENGTH = 100;
export const TOPIC_DESCRIPTION_MAX_LENGTH = 150;

const SEPARATOR = '\n';

function collapseWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

export function composeTopicText(
  title: string,
  description?: string | null,
): string {
  const cleanTitle = collapseWhitespace(title);
  const cleanDescription = collapseWhitespace(description ?? '');
  return cleanDescription
    ? `${cleanTitle}${SEPARATOR}${cleanDescription}`
    : cleanTitle;
}

export function parseTopicText(stored: string): {
  title: string;
  description: string | null;
} {
  const index = stored.indexOf(SEPARATOR);
  if (index === -1) {
    return { title: stored, description: null };
  }
  const title = stored.slice(0, index).trim();
  const description = stored.slice(index + 1).trim();
  return { title, description: description || null };
}

/** Text sent to the embedding model. Title-only topics embed exactly as before. */
export function toEmbeddingText(
  title: string,
  description?: string | null,
): string {
  const cleanTitle = collapseWhitespace(title);
  const cleanDescription = collapseWhitespace(description ?? '');
  return cleanDescription
    ? `${cleanTitle}. ${cleanDescription}`
    : cleanTitle;
}
