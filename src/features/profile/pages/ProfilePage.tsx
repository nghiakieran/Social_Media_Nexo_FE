import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch, useAppSelector } from '@/store';
import { getPostsThunk } from '@/features/post/postSlice';
import {
  setProfile,
  setPosts,
  setReels,
  setSaved,
  setFollowers,
  setFollowing,
  setActiveTab,
  toggleFollow,
  setShowFollowersDialog,
  setShowFollowingDialog,
  setShowBlockDialog,
  setShowReportDialog,
  setShowAvatarDialog,
  setShowCreateHighlightDialog,
  addHighlight,
  updateAvatar,
  fetchCurrentUserProfileAsync,
  fetchUserProfileByUsernameAsync,
  fetchFollowersByUsernameAsync,
  fetchFollowingByUsernameAsync,
  followUserAsync,
  unfollowUserAsync,
  updateUserProfileAsync,
} from '../profileSlice';
import { ProfileHeader } from '../components/ProfileHeader';
import { ProfileTabs } from '../components/ProfileTabs';
import { PostGrid } from '../components/PostGrid';
import { FollowersDialog } from '../components/FollowersDialog';
import { BlockUserDialog } from '../components/BlockUserDialog';
import { ReportUserDialog } from '../components/ReportUserDialog';
import { StoryHighlights } from '../components/StoryHighlights';
import { CreateHighlightDialog } from '../components/CreateHighlightDialog';
import { AvatarChangeDialog } from '../components/AvatarChangeDialog';
import { mockProfilePosts, mockReels, mockSavedPosts } from '../__mocks__/posts';
import { useToast } from '@/hooks/use-toast';
import { StoryViewer } from '@/features/story/components/StoryViewer';
import type { Story } from '@/features/story/types';
import { PrivateAccountMessage } from '../components/PrivateAccountMessage';
import { SavedCollectionsContent } from '@/features/saved/components/SavedCollectionsContent';
import { HiddenPostsContent } from '../components/HiddenPostsContent';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';

export const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  const {
    currentProfile,
    posts,
    reels,
    saved,
    highlights,
    followers,
    following,
    activeTab,
    isLoading,
    showFollowersDialog,
    showFollowingDialog,
    showBlockDialog,
    showReportDialog,
    showAvatarDialog,
    showCreateHighlightDialog,
  } = useAppSelector((state) => state.profile);

  const currentUser = useAppSelector((state) => state.auth.user);
  const isCurrentUser = currentUser && username === currentUser.username;
  const apiPosts = useAppSelector((state) => state.post.posts);
  const isLoadingPosts = useAppSelector((state) => state.post.isLoading);
  const hasMorePosts = useAppSelector((state) => state.post.hasMore);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    if (username) {
      // Fetch profile data first
      if (isCurrentUser) {
        dispatch(fetchCurrentUserProfileAsync());
      } else {
        dispatch(fetchUserProfileByUsernameAsync(username));
      }
      
      // Set mock data for reels and saved (will be replaced with real API later)
      dispatch(setReels(mockReels));
      dispatch(setSaved(mockSavedPosts));
    }
  }, [username, isCurrentUser, dispatch]);

  // Only fetch posts, followers, following if:
  // 1. It's current user's profile, OR
  // 2. It's a public profile, OR  
  // 3. It's a private profile but we're following them
  useEffect(() => {
    if (currentUser && currentProfile) {
      const canAccessProfile = isCurrentUser || !currentProfile.isPrivate || currentProfile.isFollowing;
      
      // Fetch posts only if we have access
      if (canAccessProfile) {
        const userId = parseInt(currentProfile.id);
        setCurrentPage(0);
        dispatch(getPostsThunk({ userId, pageNo: 0, pageSize: 10 }));
      }
      
      // Fetch followers and following only if we have access
      if (canAccessProfile && username) {
        dispatch(fetchFollowersByUsernameAsync({ username, pageNo: 0, pageSize: 10 }));
        dispatch(fetchFollowingByUsernameAsync({ username, pageNo: 0, pageSize: 10 }));
      }
    }
  }, [currentUser, currentProfile, dispatch, isCurrentUser, username]);

  // Infinite scroll - load more posts
  const handleLoadMore = useCallback(() => {
    if (currentProfile && !isLoadingPosts && hasMorePosts) {
      const userId = parseInt(currentProfile.id);
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      dispatch(getPostsThunk({ userId, pageNo: nextPage, pageSize: 10 }));
    }
  }, [currentProfile, currentPage, isLoadingPosts, hasMorePosts, dispatch]);

  const { lastElementRef } = useInfiniteScroll(handleLoadMore, {
    hasMore: hasMorePosts,
    isLoading: isLoadingPosts,
    threshold: 100,
  });

  useEffect(() => {
    if (apiPosts.length > 0) {
      dispatch(setPosts(apiPosts));
    }
  }, [apiPosts, dispatch]);

  // Handle tab from URL query parameter
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && ['posts', 'reels', 'saved'].includes(tabFromUrl)) {
      dispatch(setActiveTab(tabFromUrl as 'posts' | 'reels' | 'saved'));
    }
  }, [searchParams, dispatch]);

  const handleFollow = () => {
    if (currentProfile) {
      if (currentProfile.isFollowing) {
        dispatch(unfollowUserAsync(currentProfile.username));
        toast({
          title: 'Đã bỏ theo dõi',
          description: `Bạn đã bỏ theo dõi ${currentProfile.name}`,
        });
      } else {
        // Check if it's a private account
        if (currentProfile.isPrivate) {
          // Send follow request for private account
          dispatch(followUserAsync(currentProfile.username));
          toast({
            title: 'Đã gửi yêu cầu theo dõi',
            description: `Đã gửi yêu cầu theo dõi ${currentProfile.name}`,
          });
        } else {
          // Direct follow for public account
          dispatch(followUserAsync(currentProfile.username));
          toast({
            title: 'Đã theo dõi',
            description: `Bạn đã theo dõi ${currentProfile.name}`,
          });
        }
      }
    }
  };

  const handleMessage = () => {
    toast({
      title: 'Chuyển đến tin nhắn',
      description: 'Đang mở cuộc trò chuyện...',
    });
  };

  const handleEdit = () => {
    navigate('/edit-profile');
  };

  const handleBlock = () => {
    dispatch(setShowBlockDialog(true));
  };

  const handleReport = () => {
    dispatch(setShowReportDialog(true));
  };

  const handleAddToCloseFriends = () => {
    // TODO: Implement add to close friends
    console.log('Add to close friends');
  };

  const handleAddToFavorites = () => {
    // TODO: Implement add to favorites
    console.log('Add to favorites');
  };

  const handleRestrict = () => {
    // TODO: Implement restrict user
    console.log('Restrict user');
  };

  const handleAvatarClick = () => {
    dispatch(setShowAvatarDialog(true));
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      // Create a preview URL for the uploaded file
      const previewUrl = URL.createObjectURL(file);
      dispatch(updateAvatar(previewUrl));
      
      // Call API to update profile with new avatar
      const resultAction = await dispatch(updateUserProfileAsync({ avatar: file }));
      
      if (updateUserProfileAsync.fulfilled.match(resultAction)) {
        toast({
          title: 'Đã cập nhật ảnh đại diện',
          description: 'Ảnh đại diện đã được thay đổi thành công',
        });
      } else {
        // Revert the preview on error
        dispatch(updateAvatar(currentProfile?.avatar || ''));
        toast({
          title: 'Lỗi',
          description: 'Không thể cập nhật ảnh đại diện',
          variant: 'destructive',
        });
      }
    } catch (error) {
      dispatch(updateAvatar(currentProfile?.avatar || ''));
      toast({
        title: 'Lỗi',
        description: 'Đã xảy ra lỗi không mong muốn',
        variant: 'destructive',
      });
    }
  };

  const handleAvatarRemove = async () => {
    try {
      // Update local state first
      dispatch(updateAvatar(''));
      
      // Call API to remove avatar
      const resultAction = await dispatch(updateUserProfileAsync({ avatar: '' }));
      
      if (updateUserProfileAsync.fulfilled.match(resultAction)) {
        toast({
          title: 'Đã gỡ ảnh đại diện',
          description: 'Ảnh đại diện đã được gỡ bỏ thành công',
        });
      } else {
        // Revert on error
        dispatch(updateAvatar(currentProfile?.avatar || ''));
        toast({
          title: 'Lỗi',
          description: 'Không thể gỡ ảnh đại diện',
          variant: 'destructive',
        });
      }
    } catch (error) {
      dispatch(updateAvatar(currentProfile?.avatar || ''));
      toast({
        title: 'Lỗi',
        description: 'Đã xảy ra lỗi không mong muốn',
        variant: 'destructive',
      });
    }
  };

  // Highlights
  const handleOpenCreateHighlight = () => {
    dispatch(setShowCreateHighlightDialog(true));
  };

  const handleCreateHighlight = ({ name, selectedIds }: { name: string; selectedIds: string[] }) => {
    // Choose the first selected as cover
    const first = posts.find((p) => p.id === selectedIds[0]);
    const cover = first?.media[0]?.url || posts[0]?.media[0]?.url || '';
    dispatch(
      addHighlight({
        id: `${Date.now()}`,
        title: name,
        cover,
        postIds: selectedIds,
      })
    );
  };

  // Open highlight as stories
  const [openViewer, setOpenViewer] = useState(false);
  const [viewerData, setViewerData] = useState<{ stories: Story[]; index: number }>({ stories: [], index: 0 });

  const handleOpenHighlight = (highlightId: string) => {
    const highlight = highlights.find((h) => h.id === highlightId);
    if (!highlight) return;
    
    // Create stories only for the clicked highlight
    const contents = highlight.postIds
      .map((id) => posts.find((p) => p.id === id))
      .filter(Boolean)
      .map((p) => ({ id: p!.id, type: 'image' as const, url: p!.media[0]?.url || '', duration: 5 }));
    
    const story: Story = {
      id: highlight.id,
      username: currentProfile!.username,
      profileImage: currentProfile!.avatar,
      timeAgo: 'vừa xong',
      content: contents,
      isOwnStory: true,
    };
    
    setViewerData({ stories: [story], index: 0 });
    setOpenViewer(true);
  };

  const getCurrentContent = () => {
    // Check if viewing private account without follow access
    if (!isCurrentUser && currentProfile?.isPrivate && !currentProfile?.isFollowing) {
      return <PrivateAccountMessage profileName={currentProfile.name} />;
    }

    switch (activeTab) {
      case 'reels':
        return <PostGrid posts={reels} />;
      case 'saved':
        return isCurrentUser ? <SavedCollectionsContent /> : null;
      case 'hidden':
        return isCurrentUser ? <HiddenPostsContent /> : null;
      default: {
        // Filter to only show active posts in the posts tab
        const activePosts = apiPosts.filter(post => post.isActive);
        return (
          <>
            <PostGrid posts={activePosts} lastElementRef={lastElementRef} />
            {isLoadingPosts && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
          </>
        );
      }
    }
  };

  if (!currentProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Không tìm thấy người dùng</h2>
          <p className="text-muted-foreground">
            Tài khoản này có thể đã bị xóa hoặc không tồn tại.
          </p>
        </div>
      </div>
    );
  }

  // Calculate following count - for current user, only count users with isFollowing = true
  const calculateFollowingCount = () => {
    if (!following) return 0;
    
    if (isCurrentUser) {
      // For current user's profile, only count users that are actually following (not pending requests)
      return following.filter(user => user.isFollowing).length;
    }
    
    // For other users' profiles, count all
    return following.length;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <ProfileHeader
        profile={currentProfile}
        isCurrentUser={isCurrentUser}
        followersCount={followers?.length || 0}
        followingCount={calculateFollowingCount()}
        onFollow={handleFollow}
        onUnfollow={handleFollow}
        onMessage={handleMessage}
        onEdit={handleEdit}
        onBlock={handleBlock}
        onReport={handleReport}
        onShowFollowers={() => dispatch(setShowFollowersDialog(true))}
        onShowFollowing={() => dispatch(setShowFollowingDialog(true))}
        onAvatarClick={handleAvatarClick}
        onAddToCloseFriends={handleAddToCloseFriends}
        onAddToFavorites={handleAddToFavorites}
        onRestrict={handleRestrict}
      />

      {/* Story highlights */}
      <StoryHighlights
        highlights={highlights}
        onAdd={isCurrentUser ? handleOpenCreateHighlight : undefined}
        onOpen={handleOpenHighlight}
      />

      <ProfileTabs
        activeTab={activeTab}
        onTabChange={(tab) => {
          dispatch(setActiveTab(tab));
          // Update URL with tab parameter
          const newSearchParams = new URLSearchParams(searchParams);
          if (tab === 'posts') {
            newSearchParams.delete('tab'); // Remove tab param for default posts tab
          } else {
            newSearchParams.set('tab', tab);
          }
          const newUrl = `${window.location.pathname}${newSearchParams.toString() ? `?${newSearchParams.toString()}` : ''}`;
          navigate(newUrl, { replace: true });
        }}
        isCurrentUser={isCurrentUser}
      />

      <div className="px-0">
        {getCurrentContent()}
      </div>

      {/* Dialogs */}
      <FollowersDialog
        isOpen={showFollowersDialog}
        onClose={() => dispatch(setShowFollowersDialog(false))}
        users={followers || []}
        title="Người theo dõi"
        isCurrentUser={isCurrentUser}
        username={currentProfile?.username}
      />

      <FollowersDialog
        isOpen={showFollowingDialog}
        onClose={() => dispatch(setShowFollowingDialog(false))}
        users={following || []}
        title="Đang theo dõi"
        isCurrentUser={isCurrentUser}
        username={currentProfile?.username}
      />

      <BlockUserDialog
        isOpen={showBlockDialog}
        onClose={() => dispatch(setShowBlockDialog(false))}
        user={currentProfile}
      />

      <ReportUserDialog
        isOpen={showReportDialog}
        onClose={() => dispatch(setShowReportDialog(false))}
        user={currentProfile}
      />

      <AvatarChangeDialog
        isOpen={showAvatarDialog}
        onClose={() => dispatch(setShowAvatarDialog(false))}
        onUpload={handleAvatarUpload}
        onRemove={handleAvatarRemove}
        currentAvatar={currentProfile?.avatar}
        userName={currentProfile?.name}
      />

      <CreateHighlightDialog
        isOpen={showCreateHighlightDialog}
        onClose={() => dispatch(setShowCreateHighlightDialog(false))}
        posts={posts.map((p) => ({ id: p.id, thumbnail: p.media[0]?.url || '' }))}
        onCreate={handleCreateHighlight}
      />

      {openViewer && (
        <StoryViewer
          isOpen={openViewer}
          onClose={() => setOpenViewer(false)}
          stories={viewerData.stories}
          initialStoryIndex={viewerData.index}
        />
      )}
    </div>
  );
};