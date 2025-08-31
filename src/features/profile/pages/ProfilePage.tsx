import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
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
} from '../profileSlice';
import { ProfileHeader } from '../components/ProfileHeader';
import { ProfileTabs } from '../components/ProfileTabs';
import { PostGrid } from '../components/PostGrid';
import { FollowersDialog } from '../components/FollowersDialog';
import { BlockUserDialog } from '../components/BlockUserDialog';
import { ReportUserDialog } from '../components/ReportUserDialog';
import { mockUsers, mockCurrentUser } from '../__mocks__/users';
import { mockProfilePosts, mockReels, mockSavedPosts } from '../__mocks__/posts';
import { useToast } from '@/hooks/use-toast';

export const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const dispatch = useDispatch();
  const { toast } = useToast();
  
  const {
    currentProfile,
    posts,
    reels,
    saved,
    followers,
    following,
    activeTab,
    showFollowersDialog,
    showFollowingDialog,
    showBlockDialog,
    showReportDialog,
  } = useSelector((state: RootState) => state.profile);

  // Determine if this is the current user's profile
  const isCurrentUser = username === 'nghialc81' || !username;

  useEffect(() => {
    // Load profile data
    const profile = isCurrentUser ? mockCurrentUser : mockUsers.find(u => u.username === username);
    
    if (profile) {
      dispatch(setProfile(profile));
      dispatch(setPosts(mockProfilePosts));
      dispatch(setReels(mockReels));
      dispatch(setSaved(mockSavedPosts));
      dispatch(setFollowers(mockUsers.slice(0, 5)));
      dispatch(setFollowing(mockUsers.slice(2, 7)));
    }
  }, [username, isCurrentUser, dispatch]);

  const handleFollow = () => {
    dispatch(toggleFollow());
    toast({
      title: currentProfile?.isFollowing ? 'Đã bỏ theo dõi' : 'Đã theo dõi',
      description: currentProfile?.isFollowing 
        ? `Bạn đã bỏ theo dõi ${currentProfile.name}`
        : `Bạn đã theo dõi ${currentProfile?.name}`,
    });
  };

  const handleMessage = () => {
    toast({
      title: 'Chuyển đến tin nhắn',
      description: 'Đang mở cuộc trò chuyện...',
    });
  };

  const handleEdit = () => {
    window.location.href = '/edit-profile';
  };

  const handleBlock = () => {
    dispatch(setShowBlockDialog(true));
  };

  const handleReport = () => {
    dispatch(setShowReportDialog(true));
  };

  const getCurrentContent = () => {
    switch (activeTab) {
      case 'reels':
        return <PostGrid posts={reels} />;
      case 'saved':
        return isCurrentUser ? <PostGrid posts={saved} /> : null;
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
        onFollow={handleFollow}
        onUnfollow={handleFollow}
        onMessage={handleMessage}
        onEdit={handleEdit}
        onBlock={handleBlock}
        onReport={handleReport}
        onShowFollowers={() => dispatch(setShowFollowersDialog(true))}
        onShowFollowing={() => dispatch(setShowFollowingDialog(true))}
      />

      <ProfileTabs
        activeTab={activeTab}
        onTabChange={(tab) => dispatch(setActiveTab(tab))}
        isCurrentUser={isCurrentUser}
      />

      <div className="p-4">
        {getCurrentContent()}
      </div>

      {/* Dialogs */}
      <FollowersDialog
        isOpen={showFollowersDialog}
        onClose={() => dispatch(setShowFollowersDialog(false))}
        users={followers}
        title="Người theo dõi"
        isCurrentUser={isCurrentUser}
      />

      <FollowersDialog
        isOpen={showFollowingDialog}
        onClose={() => dispatch(setShowFollowingDialog(false))}
        users={following}
        title="Đang theo dõi"
        isCurrentUser={isCurrentUser}
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
    </div>
  );
};