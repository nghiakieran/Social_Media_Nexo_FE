import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Verified, Hash, Grid3X3 } from "lucide-react";
import { SearchResult } from "../exploreSlice";
import { HashtagChip } from "./HashtagChip";

interface SearchResultListProps {
  results: SearchResult;
  activeFilter: "all" | "users" | "hashtags" | "posts";
  onUserClick?: (userId: string) => void;
  onHashtagClick?: (hashtagId: string) => void;
  onPostClick?: (postId: string) => void;
  onFollowHashtag?: (hashtagId: string) => void;
  className?: string;
}

export const SearchResultList: React.FC<SearchResultListProps> = ({
  results,
  activeFilter,
  onUserClick,
  onHashtagClick,
  onPostClick,
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
    return activeFilter === "all" || activeFilter === type;
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Users Section */}
      {shouldShowSection("users") && results.users.length > 0 && (
        <section>
          {activeFilter === "all" && (
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-xs">U</AvatarFallback>
                </Avatar>
              </div>
              Tài khoản
            </h3>
          )}
          <div className="space-y-3">
            {results.users
              .slice(0, activeFilter === "all" || activeFilter === "users" ? undefined : 3)
              .map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors"
                  onClick={() => onUserClick?.(user.id)}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <Avatar className="h-12 w-12 shrink-0">
                      <AvatarImage src={user.avatar} alt={user.username} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1 min-w-0">
                        <span className="font-semibold text-sm truncate">
                          {user.username}
                        </span>
                        {user.isVerified && (
                          <Verified className="h-4 w-4 text-primary fill-primary shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {user.name}
                      </p>
                      {/* <p className="text-xs text-muted-foreground">
                        {formatCount(user.followersCount)} người theo dõi
                      </p> */}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* Hashtags Section */}
      {shouldShowSection("hashtags") && results.hashtags.length > 0 && (
        <section>
          {activeFilter === "all" && (
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                <Hash className="h-5 w-5 text-primary" />
              </div>
              Hashtag
            </h3>
          )}
          <div className="space-y-3">
            {results.hashtags
              .slice(0, activeFilter === "hashtags" ? undefined : 3)
              .map((hashtag) => (
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
      {shouldShowSection("posts") && results.posts.length > 0 && (
        <section>
          {activeFilter === "all" && (
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                <Grid3X3 className="h-5 w-5 text-primary" />
              </div>
              Bài viết
            </h3>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {results.posts
              .slice(0, activeFilter === "posts" ? undefined : 6)
              .map((post) => (
                <div
                  key={post.id}
                  className="relative aspect-square cursor-pointer group overflow-hidden rounded-lg"
                  onClick={() => onPostClick?.(post.id)}
                >
                  <img
                    src={post.media[0]?.url || ""}
                    alt={post.caption || `Bài viết của ${post.userName}`}
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
      {activeFilter === "all" &&
        results.users.length === 0 &&
        results.hashtags.length === 0 &&
        results.posts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
              <Grid3X3 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Không tìm thấy kết quả
            </h3>
            <p className="text-muted-foreground">
              Hãy thử tìm kiếm tài khoản khác hoặc kiểm tra lại chính tả.
            </p>
          </div>
        )}
    </div>
  );
};
