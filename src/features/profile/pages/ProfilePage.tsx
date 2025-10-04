import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch, useAppSelector } from '@/store';
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

  useEffect(() => {
    if (username) {
      // Fetch profile data
      if (isCurrentUser) {
        dispatch(fetchCurrentUserProfileAsync());
      } else {
        dispatch(fetchUserProfileByUsernameAsync(username));
      }
      
      dispatch(fetchFollowersByUsernameAsync({ username }));
      dispatch(fetchFollowingByUsernameAsync({ username }));
      
      // Set mock data for posts (will be replaced with real API later)
      dispatch(setPosts(mockProfilePosts));
      dispatch(setReels(mockReels));
      dispatch(setSaved(mockSavedPosts));
    }
  }, [username, isCurrentUser, dispatch]);

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

  const handleAvatarUpload = (file: File) => {
    // Create a preview URL for the uploaded file
    const previewUrl = URL.createObjectURL(file);
    dispatch(updateAvatar(previewUrl));
    
    toast({
      title: 'Đã cập nhật ảnh đại diện',
      description: 'Ảnh đại diện đã được thay đổi thành công',
    });
  };

  const handleAvatarRemove = () => {
    dispatch(updateAvatar(''));
  };

  // Highlights
  const handleOpenCreateHighlight = () => {
    dispatch(setShowCreateHighlightDialog(true));
  };

  const handleCreateHighlight = ({ name, selectedIds }: { name: string; selectedIds: string[] }) => {
    // Choose the first selected as cover
    const first = posts.find((p) => p.id === selectedIds[0]);
    const cover = first?.thumbnail || posts[0]?.thumbnail || '';
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
      .map((p) => ({ id: p!.id, type: 'image' as const, url: p!.thumbnail, duration: 5 }));
    
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
      default:
        return <PostGrid posts={posts} />;
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

  return (
    <div className="max-w-4xl mx-auto">
      <ProfileHeader
        profile={currentProfile}
        isCurrentUser={isCurrentUser}
        followersCount={followers?.length || 0}
        followingCount={following?.length || 0}
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
        posts={posts.map((p) => ({ id: p.id, thumbnail: p.thumbnail }))}
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