import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Search, X, Clock, TrendingUp } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (query: string) => void;
  placeholder?: string;
  recentSearches?: string[];
  trendingSearches?: string[];
  onRecentSelect?: (search: string) => void;
  onRemoveRecent?: (search: string) => void;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = "Search",
  recentSearches = [],
  trendingSearches = [],
  onRecentSelect,
  onRemoveRecent,
  className,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value.trim());
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    onSubmit(suggestion);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={handleFocus}
            className={cn(
              'pl-10 pr-10 bg-muted border-0 rounded-xl h-10 transition-all duration-200',
              isFocused && 'ring-2 ring-primary/20 bg-background border border-border'
            )}
          />
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>

      {/* Search Suggestions */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto">
          {value.trim() === '' && (
            <>
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="p-3 border-b border-border">
                  <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Recent</h4>
                  {recentSearches.slice(0, 5).map((search, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-2 hover:bg-muted rounded-lg cursor-pointer group"
                      onClick={() => {
                        onRecentSelect?.(search);
                        handleSuggestionClick(search);
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{search}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveRecent?.(search);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Trending Searches */}
              {trendingSearches.length > 0 && (
                <div className="p-3">
                  <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Trending</h4>
                  {trendingSearches.slice(0, 5).map((search, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 py-2 px-2 hover:bg-muted rounded-lg cursor-pointer"
                      onClick={() => handleSuggestionClick(search)}
                    >
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="text-sm">{search}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Search Results Preview */}
          {value.trim() !== '' && (
            <div className="p-3">
              <div
                className="flex items-center space-x-3 py-2 px-2 hover:bg-muted rounded-lg cursor-pointer"
                onClick={() => handleSuggestionClick(value)}
              >
                <Search className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Search for "{value}"</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};