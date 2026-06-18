import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store";
import { useDebouncedSearch } from "@/hooks/use-debounce-search";
import { SearchBar } from "../components/SearchBar";
import { SearchResultList } from "../components/SearchResultList";
import { TrendingSection } from "../components/TrendingSection";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { navigateToProfile } from "@/utils/navigation";
import {
  Clock,
  X,
  TrendingUp,
  Users,
  Hash,
  Grid3X3,
  Search as SearchIcon,
} from "lucide-react";
import {
  setSearchQuery,
  setActiveFilter,
  addRecentSearch,
  removeRecentSearch,
  clearRecentSearches,
  followHashtag,
  setTrendingHashtags,
  searchUsersThunk,
} from "../exploreSlice";
import { getExploreHashtags } from "../api/exploreApi";

export const SearchPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const {
    searchResults,
    isSearching,
    activeFilter,
    recentSearches,
    trendingHashtags,
  } = useAppSelector((state) => state.explore);

  const [hasSearched, setHasSearched] = useState(false);

  // Use debounced search hook with 500ms delay
  const { searchValue, debouncedValue, setSearchValue } = useDebouncedSearch(
    "",
    500
  );

  // Initialize data
  useEffect(() => {
    const fetchHashtags = async () => {
      const data = await getExploreHashtags();
      dispatch(setTrendingHashtags(data));
    };
    fetchHashtags();
  }, [dispatch]);

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

  const trendingSearches = [
    "du lịch",
    "ẩm thực",
    "thời trang",
    "nhiếp ảnh",
    "nghệ thuật",
  ];

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
            placeholder="Tìm kiếm tài khoản, hashtag và nhiều hơn nữa..."
            recentSearches={recentSearches}
            trendingSearches={trendingSearches}
            onRecentSelect={(search) => {
              setSearchValue(search);
              dispatch(setSearchQuery(search));
              handleSearch(search);
            }}
            onRemoveRecent={(search) => dispatch(removeRecentSearch(search))}
            className="mb-4"
          />

          {/* Clear Recent Searches */}
          {!hasSearched && recentSearches.length > 0 && (
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch(clearRecentSearches())}
                className="text-primary hover:text-primary/80"
              >
                Xóa tất cả
              </Button>
            </div>
          )}
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
                  Hãy thử tìm kiếm người dùng, hashtag hoặc từ khóa khác.
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

                {/* Filter Tabs */}
                <Tabs
                  value={activeFilter}
                  onValueChange={(value) =>
                    dispatch(
                      setActiveFilter(
                        value as "all" | "users" | "hashtags" | "posts"
                      )
                    )
                  }
                >
                  <TabsList className="grid w-full grid-cols-4">
                    {/* <TabsTrigger value="all" className="text-xs">
                      Tất cả ({getTotalResults()})
                    </TabsTrigger> */}
                    <TabsTrigger value="users" className="text-xs">
                      <Users className="h-3 w-3 mr-1" />
                      Người dùng
                    </TabsTrigger>
                    {/* <TabsTrigger value="hashtags" className="text-xs">
                      <Hash className="h-3 w-3 mr-1" />
                      Hashtag ({getFilteredCount("hashtags")})
                    </TabsTrigger>
                    <TabsTrigger value="posts" className="text-xs">
                      <Grid3X3 className="h-3 w-3 mr-1" />
                      Bài viết ({getFilteredCount("posts")})
                    </TabsTrigger> */}
                  </TabsList>

                  <TabsContent value={activeFilter} className="mt-6">
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
                      onFollowUser={(userId) =>
                        console.log("Follow user:", userId)
                      }
                      onFollowHashtag={(hashtagId) =>
                        dispatch(followHashtag(hashtagId))
                      }
                    />
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        )}

        {/* Default State - Trending */}
        {!hasSearched && !isSearching && (
          <div className="space-y-8">
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                  Gần đây
                </h3>
                <div className="space-y-2">
                  {recentSearches.slice(0, 5).map((search, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg cursor-pointer group"
                      onClick={() => {
                        setSearchValue(search);
                        dispatch(setSearchQuery(search));
                        handleSearch(search);
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <SearchIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{search}</span>
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
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}{" "}
            Trending Hashtags
            <TrendingSection
              hashtags={trendingHashtags}
              onHashtagClick={(hashtag) => {
                navigate(
                  `/explore?hashtag=${encodeURIComponent(
                    hashtag.name.replace(/^#/, "")
                  )}`
                );
              }}
              onFollowHashtag={(hashtagId) =>
                dispatch(followHashtag(hashtagId))
              }
              onViewAll={() => console.log("View all trending")}
            />
            {/* TrendingSection removed as requested */}
            {/* Suggested Searches */}
            {/* <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-muted-foreground" />
                Tìm kiếm thịnh hành
              </h3>
              <div className="flex flex-wrap gap-2">
                {trendingSearches.map((search, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchValue(search);
                      dispatch(setSearchQuery(search));
                      handleSearch(search);
                    }}
                    className="rounded-full"
                  >
                    {search}
                  </Button>
                ))}
              </div> */}
            {/* </div> */}
          </div>
        )}
      </div>
    </div>
  );
};
