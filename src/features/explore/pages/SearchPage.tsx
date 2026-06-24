import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store";
import { useDebouncedSearch } from "@/hooks/use-debounce-search";
import { SearchBar } from "../components/SearchBar";
import { SearchResultList } from "../components/SearchResultList";
import { SuggestedUsersSection } from "../components/SuggestedUsersSection";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { navigateToProfile } from "@/utils/navigation";
import {
  Clock,
  X,
  Search as SearchIcon,
} from "lucide-react";
import {
  setSearchQuery,
  setActiveFilter,
  addRecentSearch,
  removeRecentSearch,
  clearRecentSearches,
  followHashtag,
  searchUsersThunk,
} from "../exploreSlice";

export const SearchPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const {
    searchResults,
    isSearching,
    activeFilter,
    recentSearches,
  } = useAppSelector((state) => state.explore);

  const [hasSearched, setHasSearched] = useState(false);

  // Use debounced search hook with 500ms delay
  const { searchValue, debouncedValue, setSearchValue } = useDebouncedSearch(
    "",
    500
  );

  // Auto search when debounced value changes
  useEffect(() => {
    if (debouncedValue.trim()) {
      setHasSearched(true);
      // Call search users API
      dispatch(searchUsersThunk({ query: debouncedValue }))
        .unwrap()
        .catch((error) => {
          console.error("Search error:", error);
        });
    } else {
      setHasSearched(false);
    }
  }, [debouncedValue, dispatch]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    // Add to recent searches when user explicitly submits
    dispatch(addRecentSearch(query));

    // Trigger search immediately
    setSearchValue(query);
    setHasSearched(true);

    try {
      await dispatch(searchUsersThunk({ query })).unwrap();
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const handleQueryChange = (query: string) => {
    setSearchValue(query);
    dispatch(setSearchQuery(query));
    if (query.trim() === "") {
      setHasSearched(false);
    }
  };

  const getTotalResults = () => {
    return (
      searchResults.users.length +
      searchResults.hashtags.length +
      searchResults.posts.length
    );
  };

  const getFilteredCount = (type: string) => {
    switch (type) {
      case "users":
        return searchResults.users.length;
      case "hashtags":
        return searchResults.hashtags.length;
      case "posts":
        return searchResults.posts.length;
      default:
        // return getTotalResults();
        return searchResults.users.length;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-4">
        {/* Search Bar */}
        <div className="sticky top-0 bg-background z-10 pb-4">
          <SearchBar
            value={searchValue}
            onChange={handleQueryChange}
            onSubmit={handleSearch}
            placeholder="Tìm kiếm tài khoản"
            recentSearches={recentSearches}
            onRecentSelect={(search) => {
              setSearchValue(search);
              dispatch(setSearchQuery(search));
              handleSearch(search);
            }}
            onRemoveRecent={(search) => dispatch(removeRecentSearch(search))}
            className="mb-4"
          />


        </div>

        {/* Loading State */}
        {isSearching && (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-3 p-3">
                <div className="w-12 h-12 bg-muted rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Search Results */}
        {hasSearched && !isSearching && (
          <div className="space-y-6">
            {/* No Results Message */}
            {getTotalResults() === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                  <SearchIcon className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Không tìm thấy kết quả
                </h3>
                <p className="text-muted-foreground text-sm">
                  Hãy thử tìm kiếm tài khoản khác.
                </p>
              </div>
            )}

            {/* Results Header */}
            {getTotalResults() > 0 && (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">
                    {getTotalResults()} kết quả cho "{searchValue}"
                  </h2>
                </div>

                <div className="mt-4">
                  <SearchResultList
                    results={searchResults}
                    activeFilter={activeFilter}
                    onUserClick={(userId) => {
                      // Find user by id to get username
                      const user = searchResults.users.find(
                        (u) => u.id === userId
                      );
                      if (user) {
                        navigateToProfile(navigate, user.username);
                      }
                    }}
                    onHashtagClick={(hashtagId) =>
                      console.log("Hashtag clicked:", hashtagId)
                    }
                    onPostClick={(postId) =>
                      console.log("Post clicked:", postId)
                    }
                    onFollowHashtag={(hashtagId) =>
                      dispatch(followHashtag(hashtagId))
                    }
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* Default State */}
        {!hasSearched && !isSearching && (
          <div className="space-y-6">
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-muted-foreground flex items-center">
                    <Clock className="h-4 w-4 mr-1.5 text-muted-foreground/70" />
                    Gần đây
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dispatch(clearRecentSearches())}
                    className="text-xs text-primary hover:text-primary/80 h-auto p-0 hover:bg-transparent"
                  >
                    Xóa tất cả
                  </Button>
                </div>
                <div className="space-y-1">
                  {recentSearches.slice(0, 5).map((search, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-1.5 px-2.5 hover:bg-muted/50 rounded-lg cursor-pointer group"
                      onClick={() => {
                        setSearchValue(search);
                        dispatch(setSearchQuery(search));
                        handleSearch(search);
                      }}
                    >
                      <div className="flex items-center space-x-2.5">
                        <SearchIcon className="h-3.5 w-3.5 text-muted-foreground/60" />
                        <span className="text-sm text-foreground/90">{search}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch(removeRecentSearch(search));
                        }}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Users */}
            <SuggestedUsersSection />
          </div>
        )}
      </div>
    </div>
  );
};
