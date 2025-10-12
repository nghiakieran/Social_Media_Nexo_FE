import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Custom hook for debounced search input
 * @param initialValue - Initial search value
 * @param delay - Debounce delay in milliseconds (default: 400ms)
 * @returns Object containing search value, debounced value, setter, and clear function
 */
export function useDebouncedSearch(
  initialValue: string = "",
  delay: number = 400
) {
  const [searchValue, setSearchValue] = useState<string>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<string>(initialValue);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update debounced value after delay
  useEffect(() => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(searchValue);
    }, delay);

    // Cleanup on unmount or when searchValue changes
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchValue, delay]);

  // Clear search function
  const clearSearch = useCallback(() => {
    setSearchValue("");
    setDebouncedValue("");
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return {
    searchValue,
    debouncedValue,
    setSearchValue,
    clearSearch,
    isDebouncing: searchValue !== debouncedValue,
  };
}
