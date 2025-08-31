import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { ExploreGrid } from '../components/ExploreGrid';
import { TrendingSection } from '../components/TrendingSection';
import { SuggestedPostCard } from '../components/SuggestedPostCard';
import { SearchBar } from '../components/SearchBar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { 
  Grid3X3, 
  TrendingUp, 
  Heart, 
  Users, 
  Compass,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import {
  setPosts,
  setTrendingHashtags,
  setSuggestedPosts,
  likePost,
  followHashtag,
  setSearchQuery,
} from '../exploreSlice';
import { mockExplorePosts } from '../__mocks__/posts';
import { mockHashtags } from '../__mocks__/hashtags';
import { useNavigate } from 'react-router-dom';

export const ExplorePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const {
    posts,
    trendingHashtags,
    suggestedPosts,
    searchQuery,
  } = useAppSelector((state) => state.explore);

  const [activeTab, setActiveTab] = useState('explore');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Initialize data
  useEffect(() => {
    dispatch(setPosts(mockExplorePosts));
    dispatch(setTrendingHashtags(mockHashtags));
    dispatch(setSuggestedPosts(mockExplorePosts.slice(0, 4)));
  }, [dispatch]);

  const handleSearch = (query: string) => {
    dispatch(setSearchQuery(query));
    navigate('/search');
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    // Simulate loading new content
    setTimeout(() => {
      // Shuffle posts to simulate new content
      const shuffledPosts = [...mockExplorePosts].sort(() => Math.random() - 0.5);
      dispatch(setPosts(shuffledPosts));
      setIsRefreshing(false);
    }, 1500);
  };

  const handlePostClick = (post: any) => {
    console.log('Post clicked:', post);
    // Navigate to post detail page
  };

  const handleHashtagClick = (hashtag: any) => {
    dispatch(setSearchQuery(`#${hashtag.name}`));
    navigate('/search');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
        <div className="max-w-6xl mx-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg instagram-gradient flex items-center justify-center">
                <Compass className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-xl font-bold">Explore</h1>
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-8 w-8"
            >
              <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
            </Button>
          </div>

          {/* Search Bar */}
          <SearchBar
            value={searchQuery}
            onChange={(value) => dispatch(setSearchQuery(value))}
            onSubmit={handleSearch}
            placeholder="Search accounts, hashtags and more..."
            className="max-w-md"
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="explore" className="text-sm">
              <Grid3X3 className="h-4 w-4 mr-2" />
              Explore
            </TabsTrigger>
            <TabsTrigger value="trending" className="text-sm">
              <TrendingUp className="h-4 w-4 mr-2" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="suggested" className="text-sm">
              <Heart className="h-4 w-4 mr-2" />
              For You
            </TabsTrigger>
          </TabsList>

          {/* Explore Grid */}
          <TabsContent value="explore" className="mt-6">
            <div className="space-y-6">
              {/* Quick Hashtag Filters */}
              <div className="flex flex-wrap gap-2">
                {['travel', 'food', 'fashion', 'photography', 'art', 'nature'].map((category) => (
                  <Button
                    key={category}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSearch(`#${category}`)}
                    className="rounded-full capitalize"
                  >
                    #{category}
                  </Button>
                ))}
              </div>

              {/* Posts Grid */}
              <ExploreGrid
                posts={posts}
                onPostClick={handlePostClick}
              />
            </div>
          </TabsContent>

          {/* Trending Section */}
          <TabsContent value="trending" className="mt-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <TrendingSection
                  hashtags={trendingHashtags}
                  onHashtagClick={handleHashtagClick}
                  onFollowHashtag={(hashtagId) => dispatch(followHashtag(hashtagId))}
                />
              </div>
              
              <div className="lg:col-span-2">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Trending posts</h3>
                  <ExploreGrid
                    posts={posts.filter(p => p.likesCount > 2000)}
                    onPostClick={handlePostClick}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Suggested Posts */}
          <TabsContent value="suggested" className="mt-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Suggested for you</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={cn('h-4 w-4 mr-2', isRefreshing && 'animate-spin')} />
                  Refresh
                </Button>
              </div>

              {/* Suggested Posts Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {suggestedPosts.map((post) => (
                  <SuggestedPostCard
                    key={post.id}
                    post={post}
                    onLike={(postId) => dispatch(likePost(postId))}
                    onComment={(postId) => console.log('Comment on:', postId)}
                    onShare={(postId) => console.log('Share:', postId)}
                    onSave={(postId) => console.log('Save:', postId)}
                    onUserClick={(userId) => console.log('User clicked:', userId)}
                  />
                ))}
              </div>

              {/* Load More */}
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    // Load more suggested posts
                    const morePosts = mockExplorePosts.slice(4, 8);
                    dispatch(setSuggestedPosts([...suggestedPosts, ...morePosts]));
                  }}
                  className="rounded-full"
                >
                  Load more suggestions
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};