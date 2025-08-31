import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Check, Plus, Verified, Hash, Grid3X3 } from 'lucide-react';
import { SearchResult } from '../exploreSlice';
import { HashtagChip } from './HashtagChip';

interface SearchResultListProps {
  results: SearchResult;
  activeFilter: 'all' | 'users' | 'hashtags' | 'posts';
  onUserClick?: (userId: string) => void;
  onHashtagClick?: (hashtagId: string) => void;
  onPostClick?: (postId: string) => void;
  onFollowUser?: (userId: string) => void;
  onFollowHashtag?: (hashtagId: string) => void;
  className?: string;
}

export const SearchResultList: React.FC<SearchResultListProps> = ({
  results,
  activeFilter,
  onUserClick,
  onHashtagClick,
  onPostClick,
  onFollowUser,
  onFollowHashtag,
  className,
}) => {
  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const shouldShowSection = (type: string): boolean => {
    return activeFilter === 'all' || activeFilter === type;
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Users Section */}
      {shouldShowSection('users') && results.users.length > 0 && (
        <section>
          {activeFilter === 'all' && (
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-xs">U</AvatarFallback>
                </Avatar>
              </div>
              Accounts
            </h3>
          )}
          <div className="space-y-3">
            {results.users.slice(0, activeFilter === 'users' ? undefined : 3).map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors"
                onClick={() => onUserClick?.(user.id)}
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.avatar} alt={user.username} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-1">
                      <span className="font-semibold text-sm">{user.username}</span>
                      {user.isVerified && (
                        <Verified className="h-4 w-4 text-primary fill-primary" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCount(user.followersCount)} followers
                    </p>
                  </div>
                </div>
                <Button
                  variant={user.isFollowing ? "secondary" : "default"}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFollowUser?.(user.id);
                  }}
                  className="h-8 px-4"
                >
                  {user.isFollowing ? (
                    <>
                      <Check className="h-3 w-3 mr-1" />
                      Following
                    </>
                  ) : (
                    <>
                      <Plus className="h-3 w-3 mr-1" />
                      Follow
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Hashtags Section */}
      {shouldShowSection('hashtags') && results.hashtags.length > 0 && (
        <section>
          {activeFilter === 'all' && (
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                <Hash className="h-5 w-5 text-primary" />
              </div>
              Hashtags
            </h3>
          )}
          <div className="space-y-3">
            {results.hashtags.slice(0, activeFilter === 'hashtags' ? undefined : 3).map((hashtag) => (
              <HashtagChip
                key={hashtag.id}
                hashtag={hashtag}
                variant="outlined"
                onFollow={onFollowHashtag}
                onClick={() => onHashtagClick?.(hashtag.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Posts Section */}
      {shouldShowSection('posts') && results.posts.length > 0 && (
        <section>
          {activeFilter === 'all' && (
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                <Grid3X3 className="h-5 w-5 text-primary" />
              </div>
              Posts
            </h3>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {results.posts.slice(0, activeFilter === 'posts' ? undefined : 6).map((post) => (
              <div
                key={post.id}
                className="relative aspect-square cursor-pointer group overflow-hidden rounded-lg"
                onClick={() => onPostClick?.(post.id)}
              >
                <img
                  src={post.imageUrl}
                  alt={post.caption || `Post by ${post.author.username}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-center">
                    <div className="flex items-center justify-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <span className="text-sm font-semibold">
                          {formatCount(post.likesCount)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-sm font-semibold">
                          {formatCount(post.commentsCount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* No Results */}
      {activeFilter === 'all' && 
       results.users.length === 0 && 
       results.hashtags.length === 0 && 
       results.posts.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
            <Grid3X3 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No results found</h3>
          <p className="text-muted-foreground">
            Try searching for something else or check your spelling.
          </p>
        </div>
      )}
    </div>
  );
};