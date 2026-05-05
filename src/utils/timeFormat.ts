/**
 * Format a date string to a human-readable time ago format
 * @param dateString - ISO date string
 * @returns Formatted time ago string in Vietnamese
 */
export const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // Just now (less than 1 minute)
  if (diffInSeconds < 60) {
    return "Vừa xong";
  }

  // Minutes ago
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} phút trước`;
  }

  // Hours ago
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} giờ trước`;
  }

  // Days ago (up to 7 days)
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ngày trước`;
  }

  // Weeks ago (up to 4 weeks)
  if (diffInSeconds < 2592000) {
    const weeks = Math.floor(diffInSeconds / 604800);
    return `${weeks} tuần trước`;
  }

  // Months ago (up to 12 months)
  if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} tháng trước`;
  }

  // Years ago
  const years = Math.floor(diffInSeconds / 31536000);
  return `${years} năm trước`;
};

/**
 * Format a date string to a short time ago format (for compact displays)
 * @param dateString - ISO date string
 * @returns Formatted short time ago string
 */
export const formatTimeAgoShort = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Vừa xong";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}p`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)}w`;
  if (diffInSeconds < 31536000)
    return `${Math.floor(diffInSeconds / 2592000)}mo`;
  return `${Math.floor(diffInSeconds / 31536000)}y`;
};

/**
 * Format date for archive display (day, month, year)
 * @param dateString - ISO date string
 * @returns Object with day, month, year, showYear
 */
export const formatArchiveDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleDateString('vi-VN', { month: 'long' });
  const year = date.getFullYear();
  const currentYear = new Date().getFullYear();
  
  return {
    day,
    month,
    year,
    showYear: year !== currentYear,
  };
};

export interface DateGroupedItems<T> {
  dateKey: string;
  items: T[];
}

export const groupItemsByCreatedDate = <T extends { createdAt: string }>(
  items: T[]
): DateGroupedItems<T>[] => {
  const groups: DateGroupedItems<T>[] = [];
  const byDate = new Map<string, T[]>();

  items.forEach((item) => {
    const date = new Date(item.createdAt);
    if (Number.isNaN(date.getTime())) return;
    const dateKey = date.toISOString().slice(0, 10);
    if (!byDate.has(dateKey)) {
      byDate.set(dateKey, []);
    }
    byDate.get(dateKey)!.push(item);
  });

  byDate.forEach((dateItems, dateKey) => {
    groups.push({ dateKey, items: dateItems });
  });

  return groups.sort((a, b) => (a.dateKey < b.dateKey ? 1 : -1));
};

export const formatDateSectionLabel = (dateKey: string): string => {
  const date = new Date(`${dateKey}T00:00:00`);
  const today = new Date();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const startOfDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
  const diffDays = Math.floor(
    (startOfToday.getTime() - startOfDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return "Hôm nay";
  if (diffDays === 1) return "Hôm qua";
  if (diffDays > 1 && diffDays < 7) {
    return date.toLocaleDateString("vi-VN", { weekday: "long" });
  }

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};
