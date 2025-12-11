import React from 'react';

/**
 * Parse @username mentions in text and convert them to clickable links
 * @param content - Text content that may contain @username mentions
 * @param onMentionClick - Callback when a mention is clicked (username: string) => void
 * @returns JSX elements with mentions as clickable links
 */
export const parseMentions = (
  content: string,
  onMentionClick?: (username: string) => void
): React.ReactNode[] => {
  if (!content) return [];

  // Regex to match @username (alphanumeric, underscore, dot, hyphen allowed)
  // Matches @username at word boundaries
  const mentionRegex = /@([a-zA-Z0-9._-]+)/g;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    const beforeMatch = content.slice(lastIndex, match.index);
    const username = match[1]; // Extract username without @
    const fullMatch = match[0]; // @username

    // Add text before the mention
    if (beforeMatch) {
      parts.push(beforeMatch);
    }

    // Add clickable mention link
    parts.push(
      <span
        key={`mention-${match.index}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (onMentionClick) {
            onMentionClick(username);
          }
        }}
        className="font-medium text-blue-500 hover:text-blue-600 hover:underline cursor-pointer"
      >
        {username}
      </span>
    );

    lastIndex = match.index + fullMatch.length;
  }

  // Add remaining text after last mention
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  // If no mentions found, return original content
  if (parts.length === 0) {
    return [content];
  }

  return parts;
};
