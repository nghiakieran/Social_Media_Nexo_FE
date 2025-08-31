import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { SearchBar } from '../components/SearchBar';
import { SearchResultList } from '../components/SearchResultList';
import { TrendingSection } from '../components/TrendingSection';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { 
  Clock, 
  X, 
  TrendingUp, 
  Users, 
  Hash, 
  Grid3X3,
  Search as SearchIcon
} from 'lucide-react';
import {
  setSearchQuery,
  setSearchResults,
  setIsSearching,
  setActiveFilter,
  addRecentSearch,
  removeRecentSearch,
  clearRecentSearches,
  followHashtag,
  setTrendingHashtags,
} from '../exploreSlice';
import { mockHashtags } from '../__mocks__/hashtags';
import { mockExplorePosts } from '../__mocks__/posts';

export const SearchPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    searchQuery,
    searchResults,
    isSearching,
    activeFilter,
    recentSearches,
    trendingHashtags,
  } = useAppSelector((state) => state.explore);

  const [hasSearched, setHasSearched] = useState(false);

  // Initialize data
  useEffect(() => {
    dispatch(setTrendingHashtags(mockHashtags));
  }, [dispatch]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    setHasSearched(true);
    dispatch(setIsSearching(true));
    dispatch(addRecentSearch(query));

    // Simulate API call
    setTimeout(() => {
      // Mock search results
      const mockUsers = [
        {
          id: 'user-1',
          username: 'travel_enthusiast',
          name: 'Travel Enthusiast',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          isFollowing: false,
          isVerified: true,
          followersCount: 45000,
        },
        {
          id: 'user-2',
          username: 'foodie_life',
          name: 'Foodie Life',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face',
          isFollowing: true,
          isVerified: false,
          followersCount: 12500,
        },
      ];

      const filteredHashtags = mockHashtags.filter(h =>
        h.name.toLowerCase().includes(query.toLowerCase())
      );

      const filteredPosts = mockExplorePosts.filter(p =>
        p.caption?.toLowerCase().includes(query.toLowerCase()) ||
        p.hashtags.some(h => h.toLowerCase().includes(query.toLowerCase())) ||
        p.author.username.toLowerCase().includes(query.toLowerCase())
      );

      dispatch(setSearchResults({
        users: mockUsers.filter(u =>
          u.username.toLowerCase().includes(query.toLowerCase()) ||
          u.name.toLowerCase().includes(query.toLowerCase())
        ),
        hashtags: filteredHashtags,
        posts: filteredPosts,
      }));

      dispatch(setIsSearching(false));
    }, 1000);
  };

  const handleQueryChange = (query: string) => {
    dispatch(setSearchQuery(query));
    if (query.trim() === '') {
      setHasSearched(false);
    }
  };

  const trendingSearches = [
    'travel', 'food', 'fashion', 'photography', 'art'
  ];

  const getTotalResults = () => {
    return searchResults.users.length + searchResults.hashtags.length + searchResults.posts.length;
  };

  const getFilteredCount = (type: string) => {
    switch (type) {
      case 'users':
        return searchResults.users.length;
      case 'hashtags':
        return searchResults.hashtags.length;
      case 'posts':
        return searchResults.posts.length;
      default:
        return getTotalResults();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-4">
        {/* Search Bar */}
        <div className="sticky top-0 bg-background z-10 pb-4">
          <SearchBar
            value={searchQuery}
            onChange={handleQueryChange}
            onSubmit={handleSearch}
            placeholder="Search accounts, hashtags and more..."
            recentSearches={recentSearches}
            trendingSearches={trendingSearches}
            onRecentSelect={(search) => {
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
                Clear all
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
            {/* Results Header */}
            {getTotalResults() > 0 && (
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {getTotalResults()} results for "{searchQuery}"
                </h2>
              </div>
            )}

            {/* Filter Tabs */}
            <Tabs value={activeFilter} onValueChange={(value) => dispatch(setActiveFilter(value as any))}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all" className="text-xs">
                  All ({getTotalResults()})
                </TabsTrigger>
                <TabsTrigger value="users" className="text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  Users ({getFilteredCount('users')})
                </TabsTrigger>
                <TabsTrigger value="hashtags" className="text-xs">
                  <Hash className="h-3 w-3 mr-1" />
                  Tags ({getFilteredCount('hashtags')})
                </TabsTrigger>
                <TabsTrigger value="posts" className="text-xs">
                  <Grid3X3 className="h-3 w-3 mr-1" />
                  Posts ({getFilteredCount('posts')})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeFilter} className="mt-6">
                <SearchResultList
                  results={searchResults}
                  activeFilter={activeFilter}
                  onUserClick={(userId) => console.log('User clicked:', userId)}
                  onHashtagClick={(hashtagId) => console.log('Hashtag clicked:', hashtagId)}
                  onPostClick={(postId) => console.log('Post clicked:', postId)}
                  onFollowUser={(userId) => console.log('Follow user:', userId)}
                  onFollowHashtag={(hashtagId) => dispatch(followHashtag(hashtagId))}
                />
              </TabsContent>
            </Tabs>
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
                  Recent
                </h3>
                <div className="space-y-2">
                  {recentSearches.slice(0, 5).map((search, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg cursor-pointer group"
                      onClick={() => {
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
            )}

            {/* Trending Hashtags */}
            <TrendingSection
              hashtags={trendingHashtags}
              onHashtagClick={(hashtag) => {
                dispatch(setSearchQuery(`#${hashtag.name}`));
                handleSearch(`#${hashtag.name}`);
              }}
              onFollowHashtag={(hashtagId) => dispatch(followHashtag(hashtagId))}
              onViewAll={() => console.log('View all trending')}
            />

            {/* Suggested Searches */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-muted-foreground" />
                Trending searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {trendingSearches.map((search, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      dispatch(setSearchQuery(search));
                      handleSearch(search);
                    }}
                    className="rounded-full"
                  >
                    {search}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};