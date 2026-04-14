import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AppDispatch, useAppSelector } from "@/store";
import { getPostsThunk } from "@/features/post/postSlice";
import { getUserReelsThunk } from "@/features/reel/reelSlice";
import { getMediaType } from "@/utils/mediaUtils";
import {
  setPosts,
  setActiveTab,
  setShowFollowersDialog,
  setShowFollowingDialog,
  setShowBlockDialog,
  setShowReportDialog,
  setShowAvatarDialog,
  setShowCreateHighlightDialog,
  fetchCurrentUserProfileAsync,
  fetchUserProfileByUsernameAsync,
  fetchFollowersByUsernameAsync,
  fetchFollowingByUsernameAsync,
  followUserAsync,
  unfollowUserAsync,
  updateUserProfileAsync,
  deleteAvatarAsync,
} from "../profileSlice";
import { ProfileHeader } from "../components/ProfileHeader";
import { ProfileTabs } from "../components/ProfileTabs";
import { PostGrid } from "../components/PostGrid";
import { ReelGrid } from "../components/ReelGrid";
import { FollowersDialog } from "../components/FollowersDialog";
import { BlockUserDialog } from "../components/BlockUserDialog";
import { ReportUserDialog } from "../components/ReportUserDialog";
import { StoryHighlights } from "../components/StoryHighlights";
import { CreateHighlightDialog } from "../components/CreateHighlightDialog";
import { EditHighlightDialog } from "../components/EditHighlightDialog";
import { AvatarChangeDialog } from "../components/AvatarChangeDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { StoryViewer } from "@/features/story/components/StoryViewer";
import type { Story, CollectionItem } from "@/features/story/types";
import {
  getCollections,
  getCollectionDetail,
  getUserCollectionDetail,
  updateCollection,
  deleteCollection,
  getUserStories,
} from "@/features/story/api/storyApi";
import {
  reportUser,
  toggleCloseFriend,
} from "../api/profileApi";
import ReelCommentDrawer from "@/features/reel/components/ReelCommentDrawer";
import ReelCommentDialog from "@/features/reel/components/ReelCommentDialog";
import { transformUserStoriesToStory } from "@/features/story/types";
import { upsertProfileStory } from "@/features/story/storySlice";
import { PrivateAccountMessage } from "../components/PrivateAccountMessage";
import { SavedAllPostsContent } from "@/features/saved/components/SavedAllPostsContent";
import { HiddenPostsContent } from "../components/HiddenPostsContent";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { getSavedPostsThunk } from "@/features/saved/savedSlice";

export const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const {
    currentProfile,
    posts,
    reels: profileReels,
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

  const { reels: reelStoreReels } = useAppSelector((state) => state.reel);

  const currentUser = useAppSelector((state) => state.auth.user);
  const isCurrentUser = currentUser && username === currentUser.username;
  const apiPosts = useAppSelector((state) => state.post.posts);
  const isLoadingPosts = useAppSelector((state) => state.post.isLoading);
  const hasMorePosts = useAppSelector((state) => state.post.hasMore);
  const [currentPage, setCurrentPage] = useState(0);

  // Profile user's stories state
  const [profileUserStory, setProfileUserStory] = useState<Story | null>(null);
  const hasStory = !!profileUserStory && profileUserStory.content.length > 0;
  const isStoryViewed = profileUserStory?.isViewed ?? false;

  // Get Redux stories to sync like state
  const reduxUserStories = useAppSelector((state) => state.story.userStories);
  const reduxFriendStories = useAppSelector(
    (state) => state.story.friendStories,
  );

  // Collections (Highlights) state
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [isLoadingCollections, setIsLoadingCollections] = useState(false);
  const [editingCollection, setEditingCollection] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [deletingCollectionId, setDeletingCollectionId] = useState<
    string | null
  >(null);

  // Track if user has clicked on reels tab
  const [hasClickedReelsTab, setHasClickedReelsTab] = useState(false);

  // Load user stories function
  const loadUserStories = useCallback(async () => {
    if (!currentProfile?.id) return;

    // Only load stories if we have access to the profile
    const canAccessProfile =
      isCurrentUser || !currentProfile.isPrivate || currentProfile.isFollowing;

    if (!canAccessProfile) {
      setProfileUserStory(null);
      return;
    }

    try {
      const response = await getUserStories({
        userId: parseInt(currentProfile.id),
        pageNo: 0,
        pageSize: 10,
      });

      // Transform API response to Story format
      // response.data.content is UserStoriesData[]
      const userStoriesData = response.data.content;

      // For profile, we only need the first user's stories
      if (userStoriesData && userStoriesData.length > 0) {
        const story = transformUserStoriesToStory(
          userStoriesData[0],
          currentUser?.id, // Pass currentUserId to determine isOwnStory
        );
        setProfileUserStory(story);

        // Also add to Redux to enable like state sync
        dispatch(upsertProfileStory(story));
      } else {
        setProfileUserStory(null);
      }
    } catch (error) {
      console.error("Failed to load user stories:", error);
      setProfileUserStory(null);
    }
  }, [
    currentProfile?.id,
    currentProfile?.isPrivate,
    currentProfile?.isFollowing,
    isCurrentUser,
    currentUser?.id,
    dispatch,
  ]);

  // Load user stories when profile is loaded
  useEffect(() => {
    if (currentProfile?.id) {
      loadUserStories();
    }
  }, [currentProfile?.id, loadUserStories]);

  // Sync like state from Redux to local profileUserStory and viewerData
  useEffect(() => {
    if (!currentProfile?.id) return;

    // Find matching story in Redux (could be in userStories or friendStories)
    const allReduxStories = [...reduxUserStories, ...reduxFriendStories];
    const matchingReduxStory = allReduxStories.find(
      (s) =>
        s.id === currentProfile.id.toString() ||
        s.username === currentProfile.username,
    );

    if (matchingReduxStory) {
      // Update local profileUserStory
      setProfileUserStory(matchingReduxStory);

      // Also update viewerData if viewer is open
      setViewerData((prev) => {
        if (!prev.stories || prev.stories.length === 0) return prev;

        // Update the matching story in viewerData
        const updatedStories = prev.stories.map((story) => {
          if (
            story.id === matchingReduxStory.id ||
            story.username === matchingReduxStory.username
          ) {
            return matchingReduxStory;
          }
          return story;
        });

        return {
          ...prev,
          stories: updatedStories,
        };
      });
    }
  }, [
    reduxUserStories,
    reduxFriendStories,
    currentProfile?.id,
    currentProfile?.username,
  ]);

  // Load collections when profile is loaded
  useEffect(() => {
    const loadCollections = async () => {
      if (!currentProfile?.id) return;

      // Only load collections if we have access to the profile
      const canAccessProfile =
        isCurrentUser ||
        !currentProfile.isPrivate ||
        currentProfile.isFollowing; // Only if truly following (accepted), not just requested

      if (!canAccessProfile) {
        setCollections([]);
        return;
      }

      setIsLoadingCollections(true);
      try {
        const response = await getCollections(
          parseInt(currentProfile.id),
          0,
          10,
        );
        setCollections(response.data.content);
      } catch (error) {
        console.error("Failed to load collections:", error);
      } finally {
        setIsLoadingCollections(false);
      }
    };

    if (currentProfile?.id) {
      loadCollections();
    }
  }, [
    currentProfile?.id,
    currentProfile?.isPrivate,
    currentProfile?.isFollowing,
    isCurrentUser,
  ]);

  // Load saved posts when saved tab is active
  useEffect(() => {
    if (activeTab === "saved" && isCurrentUser) {
      dispatch(getSavedPostsThunk({ page: 0, size: 20 }));
    }
  }, [activeTab, isCurrentUser, dispatch]);

  useEffect(() => {
    if (username) {
      // Fetch profile data first
      if (isCurrentUser) {
        dispatch(fetchCurrentUserProfileAsync());
      } else {
        dispatch(fetchUserProfileByUsernameAsync(username));
      }

      // Set mock data for saved (will be replaced with real API later)
      // dispatch(setSaved(mockSavedPosts));
    }
  }, [username, isCurrentUser, dispatch]);

  // Only fetch posts, followers, following if:
  // 1. It's current user's profile, OR
  // 2. It's a public profile, OR
  // 3. It's a private profile but we're following them
  useEffect(() => {
    if (currentUser && currentProfile) {
      const canAccessProfile =
        isCurrentUser ||
        !currentProfile.isPrivate ||
        currentProfile.isFollowing;

      // Fetch posts only if we have access
      if (canAccessProfile) {
        const userId = parseInt(currentProfile.id);
        setCurrentPage(0);
        dispatch(getPostsThunk({ userId, pageNo: 0, pageSize: 10 }));
      }

      // Fetch followers and following only if we have access
      if (canAccessProfile && username) {
        dispatch(
          fetchFollowersByUsernameAsync({ username, pageNo: 0, pageSize: 10 }),
        );
        dispatch(
          fetchFollowingByUsernameAsync({ username, pageNo: 0, pageSize: 10 }),
        );
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
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl && ["posts", "reels", "saved"].includes(tabFromUrl)) {
      dispatch(setActiveTab(tabFromUrl as "posts" | "reels" | "saved"));
    }
  }, [searchParams, dispatch]);

  // Load reels when activeTab is "reels" - only when user clicks on reels tab
  useEffect(() => {
    if (activeTab === "reels" && currentProfile?.id && hasClickedReelsTab) {
      const canAccessProfile =
        isCurrentUser ||
        !currentProfile.isPrivate ||
        currentProfile.isFollowing;

      if (canAccessProfile) {
        const userId = parseInt(currentProfile.id);
        // Only load if reels array is empty (first time loading)
        if (reelStoreReels.length === 0) {
          dispatch(getUserReelsThunk({ userId, pageNo: 0, pageSize: 10 }));
        }
      }
    }
  }, [
    activeTab,
    currentProfile?.id,
    currentProfile?.isPrivate,
    currentProfile?.isFollowing,
    isCurrentUser,
    dispatch,
    reelStoreReels.length,
    hasClickedReelsTab,
  ]);

  const handleFollow = () => {
    if (currentProfile) {
      if (currentProfile.isFollowing) {
        dispatch(unfollowUserAsync(currentProfile.username));
        toast({
          variant: "success",
          title: "Đã bỏ theo dõi",
          description: `Bạn đã bỏ theo dõi ${currentProfile.name}`,
        });
      } else {
        // Check if it's a private account
        if (currentProfile.isPrivate) {
          // Send follow request for private account
          dispatch(followUserAsync(currentProfile.username));
          toast({
            variant: "success",
            title: "Đã gửi yêu cầu theo dõi",
            description: `Đã gửi yêu cầu theo dõi ${currentProfile.name}`,
          });
        } else {
          // Direct follow for public account
          dispatch(followUserAsync(currentProfile.username));
          toast({
            variant: "success",
            title: "Đã theo dõi",
            description: `Bạn đã theo dõi ${currentProfile.name}`,
          });
        }
      }
    }
  };

  const handleMessage = async () => {
    if (!currentProfile) return;

    try {
      const { conversationApi } =
        await import("@/features/message/services/messageApi");
      const { upsertConversation } =
        await import("@/features/message/messageSlice");

      const recipientId = parseInt(currentProfile.id, 10);
      const response =
        await conversationApi.getOrCreateConversation(recipientId);

      if (response?.data) {
        dispatch(upsertConversation(response.data));

        navigate("/messages", {
          state: { conversationId: response.data.id },
        });
      } else {
        throw new Error("Failed to create conversation");
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast({
        title: "Lỗi",
        description: "Không thể mở cuộc trò chuyện. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = () => {
    navigate("/edit-profile");
  };

  const handleBlock = () => {
    dispatch(setShowBlockDialog(true));
  };

  const handleReport = () => {
    dispatch(setShowReportDialog(true));
  };

  const handleReportSubmit = async (reason: string) => {
    if (!username) {
      throw new Error("Không tìm thấy thông tin người dùng");
    }
    await reportUser(username, { reason });
  };

  const handleToggleCloseFriends = async () => {
    if (!currentProfile) return;

    try {
      await toggleCloseFriend(currentProfile.username);

      // Refresh profile để cập nhật isCloseFriend
      if (isCurrentUser) {
        dispatch(fetchCurrentUserProfileAsync());
      } else if (username) {
        dispatch(fetchUserProfileByUsernameAsync(username));
      }

      const isNowCloseFriend = !currentProfile.isCloseFriend;
      toast({
        variant: "success",
        title: isNowCloseFriend
          ? "Đã thêm vào danh sách bạn thân"
          : "Đã xóa khỏi danh sách bạn thân",
        description: `${currentProfile.name} ${isNowCloseFriend ? "đã được thêm vào" : "đã được xóa khỏi"
          } danh sách bạn thân`,
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật danh sách bạn thân",
        variant: "destructive",
      });
    }
  };

  const handleCancelFollowRequest = async () => {
    if (currentProfile) {
      try {
        const resultAction = await dispatch(
          unfollowUserAsync(currentProfile.username),
        );
        if (unfollowUserAsync.fulfilled.match(resultAction)) {
          // Refresh profile to update hasRequestedFollow
          if (isCurrentUser) {
            dispatch(fetchCurrentUserProfileAsync());
          } else if (username) {
            dispatch(fetchUserProfileByUsernameAsync(username));
          }
          toast({
            variant: "success",
            title: "Đã hủy yêu cầu",
            description: `Đã hủy yêu cầu theo dõi ${currentProfile.name}`,
          });
        } else {
          toast({
            title: "Lỗi",
            description: "Không thể hủy yêu cầu theo dõi",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Lỗi",
          description: "Đã xảy ra lỗi không mong muốn",
          variant: "destructive",
        });
      }
    }
  };

  const handleAddToCloseFriends = handleToggleCloseFriends;
  const handleRemoveFromCloseFriends = handleToggleCloseFriends;

  const handleAddToFavorites = () => {
    // TODO: Implement add to favorites
    console.log("Add to favorites");
  };

  const handleRestrict = () => {
    // TODO: Implement restrict user
    console.log("Restrict user");
  };

  const handleAvatarClick = () => {
    dispatch(setShowAvatarDialog(true));
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      // Call API to update profile with new avatar
      await dispatch(updateUserProfileAsync({ avatar: file })).unwrap();

      // Refresh profile để cập nhật data từ server
      if (isCurrentUser) {
        dispatch(fetchCurrentUserProfileAsync());
      } else if (username) {
        dispatch(fetchUserProfileByUsernameAsync(username));
      }

      toast({
        variant: "success",
        title: "Đã cập nhật ảnh đại diện",
        description: "Ảnh đại diện đã được thay đổi thành công",
      });
    } catch (error) {
      const err = error as { message?: string };
      toast({
        title: "Lỗi",
        description: err.message || "Không thể cập nhật ảnh đại diện",
        variant: "destructive",
      });
    }
  };

  const handleAvatarRemove = async () => {
    try {
      // Call API to delete avatar (DELETE /users/profile/avatar)
      await dispatch(deleteAvatarAsync()).unwrap();

      // Refresh profile để cập nhật data từ server
      if (isCurrentUser) {
        dispatch(fetchCurrentUserProfileAsync());
      } else if (username) {
        dispatch(fetchUserProfileByUsernameAsync(username));
      }

      toast({
        variant: "success",
        title: "Đã gỡ ảnh đại diện",
        description: "Ảnh đại diện đã được gỡ bỏ thành công",
      });
    } catch (error) {
      const err = error as { message?: string };
      toast({
        title: "Lỗi",
        description: err.message || "Không thể gỡ ảnh đại diện",
        variant: "destructive",
      });
    }
  };

  // Highlights
  const handleOpenCreateHighlight = () => {
    dispatch(setShowCreateHighlightDialog(true));
  };

  const handleHighlightSuccess = async () => {
    // Reload collections after creating new one
    if (currentProfile?.id) {
      try {
        const response = await getCollections(
          parseInt(currentProfile.id),
          0,
          10,
        );
        setCollections(response.data.content);
      } catch (error) {
        console.error("Failed to reload collections:", error);
      }
    }

    dispatch(setShowCreateHighlightDialog(false));

    toast({
      variant: "success",
      title: "Đã tạo tin nổi bật!",
      description: "Tin nổi bật đã được tạo thành công",
    });
  };

  // Open highlight as stories
  const [openViewer, setOpenViewer] = useState(false);
  const [viewerData, setViewerData] = useState<{
    stories: Story[];
    index: number;
  }>({ stories: [], index: 0 });

  // Handle profile story click (when avatar clicked and has story)
  const handleProfileStoryClick = () => {
    if (profileUserStory) {
      // Open story viewer with just this user's story
      setViewerData({ stories: [profileUserStory], index: 0 });
      setOpenViewer(true);
    }
  };

  const handleOpenHighlight = async (highlightId: string) => {
    try {
      const response = isCurrentUser
        ? await getCollectionDetail(parseInt(highlightId))
        : await getUserCollectionDetail(parseInt(highlightId));

      const collectionDetail = response.data;

      // Transform collection stories to Story format
      const contents = collectionDetail.stories.map((story) => ({
        id: story.storyId.toString(),
        type: getMediaType(story.mediaUrl),
        url: story.mediaUrl,
        duration: 5,
        isSeen: story.isSeen,
        createdAt: story.createdAt,
        quantitySeen: story.quantitySeen,
        isLike: story.isLike,
        isCloseFriend: story.isCloseFriend,
      }));

      const story: Story = {
        id: highlightId,
        username: currentProfile!.username,
        profileImage: currentProfile!.avatar,
        timeAgo: collectionDetail.createdAt || new Date().toISOString(),
        content: contents,
        isOwnStory: isCurrentUser,
      };

      setViewerData({ stories: [story], index: 0 });
      setOpenViewer(true);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description:
          error instanceof Error ? error.message : "Không thể tải tin nổi bật",
      });
    }
  };

  const handleEditHighlight = (highlightId: string) => {
    const collection = collections.find((c) => c.id.toString() === highlightId);
    if (collection) {
      setEditingCollection({
        id: collection.id,
        name: collection.collectionName,
      });
    }
  };

  const handleEditSuccess = async () => {
    // Reload collections after edit
    if (currentProfile?.id) {
      try {
        const response = await getCollections(
          parseInt(currentProfile.id),
          0,
          10,
        );
        setCollections(response.data.content);
      } catch (error) {
        console.error("Failed to reload collections:", error);
      }
    }
    setEditingCollection(null);
  };

  const handleDeleteHighlight = (highlightId: string) => {
    setDeletingCollectionId(highlightId);
  };

  const confirmDelete = async () => {
    if (!deletingCollectionId) return;

    try {
      await deleteCollection(parseInt(deletingCollectionId));

      // Reload collections after deletion
      if (currentProfile?.id) {
        const response = await getCollections(
          parseInt(currentProfile.id),
          0,
          10,
        );
        setCollections(response.data.content);
      }

      toast({
        variant: "success",
        title: "Đã xóa!",
        description: "Tin nổi bật đã được xóa thành công",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description:
          error instanceof Error ? error.message : "Không thể xóa tin nổi bật",
      });
    } finally {
      setDeletingCollectionId(null);
    }
  };

  const getCurrentContent = () => {
    // Check if viewing private account without follow access
    if (
      !isCurrentUser &&
      currentProfile?.isPrivate &&
      !currentProfile?.isFollowing
    ) {
      return <PrivateAccountMessage profileName={currentProfile.name} />;
    }

    switch (activeTab) {
      case "reels":
        return (
          <ReelGrid
            reels={reelStoreReels}
            onReelClick={(reel) => {
              // Navigate to reel detail page
              navigate(`/reels/${reel.id}`);
            }}
          />
        );
      case "saved":
        return isCurrentUser ? (
          <SavedAllPostsContent onBack={() => { }} />
        ) : null;
      case "hidden":
        return isCurrentUser ? <HiddenPostsContent /> : null;
      default: {
        // Filter to only show active posts in the posts tab
        const activePosts = apiPosts.filter((post) => post.isActive);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

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
      return following.filter((user) => user.isFollowing).length;
    }

    // For other users' profiles, count all
    return following.length;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <ProfileHeader
        profile={currentProfile}
        isCurrentUser={isCurrentUser}
        followersCount={currentProfile.followersCount}
        followingCount={currentProfile.followingCount}
        onFollow={handleFollow}
        onUnfollow={handleCancelFollowRequest}
        onMessage={handleMessage}
        onEdit={handleEdit}
        onBlock={handleBlock}
        onReport={handleReport}
        onShowFollowers={() => dispatch(setShowFollowersDialog(true))}
        onShowFollowing={() => dispatch(setShowFollowingDialog(true))}
        onAvatarClick={handleAvatarClick}
        onAddToCloseFriends={handleToggleCloseFriends}
        onRemoveFromCloseFriends={handleToggleCloseFriends}
        onAddToFavorites={handleAddToFavorites}
        onRestrict={handleRestrict}
        onStoryClick={handleProfileStoryClick}
        hasStory={hasStory}
        isStoryViewed={isStoryViewed}
      />

      {/* Story highlights - only show if we have access */}
      {(isCurrentUser ||
        !currentProfile.isPrivate ||
        currentProfile.isFollowing) && (
          <StoryHighlights
            highlights={collections.map((col) => ({
              id: col.id.toString(),
              title: col.collectionName,
              cover: col.mediaUrl,
              postIds: [], // Not needed anymore as we fetch from API
            }))}
            onAdd={isCurrentUser ? handleOpenCreateHighlight : undefined}
            onOpen={handleOpenHighlight}
            onEdit={isCurrentUser ? handleEditHighlight : undefined}
            onDelete={isCurrentUser ? handleDeleteHighlight : undefined}
            canManage={isCurrentUser}
          />
        )}

      <ProfileTabs
        activeTab={activeTab}
        onTabChange={(tab) => {
          dispatch(setActiveTab(tab));

          // Track when user clicks on reels tab
          if (tab === "reels") {
            setHasClickedReelsTab(true);
          }

          // Update URL with tab parameter
          const newSearchParams = new URLSearchParams(searchParams);
          if (tab === "posts") {
            newSearchParams.delete("tab"); // Remove tab param for default posts tab
          } else {
            newSearchParams.set("tab", tab);
          }
          const newUrl = `${window.location.pathname}${newSearchParams.toString() ? `?${newSearchParams.toString()}` : ""
            }`;
          navigate(newUrl, { replace: true });
        }}
        isCurrentUser={isCurrentUser}
      />

      <div className="px-0">{getCurrentContent()}</div>

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
        onSubmit={handleReportSubmit}
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
        userId={currentUser?.id || 0}
        onSuccess={handleHighlightSuccess}
      />

      {/* Edit Highlight Dialog */}
      {editingCollection && (
        <EditHighlightDialog
          isOpen={!!editingCollection}
          onClose={() => setEditingCollection(null)}
          userId={currentUser?.id || 0}
          collectionId={editingCollection.id}
          initialName={editingCollection.name}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingCollectionId}
        onOpenChange={(open) => !open && setDeletingCollectionId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa tin nổi bật?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa tin nổi bật này? Hành động này không thể
              hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {openViewer && (
        <StoryViewer
          isOpen={openViewer}
          onClose={() => {
            setOpenViewer(false);
            // Reload user stories to update viewed status
            if (currentProfile?.id) {
              loadUserStories();
            }
          }}
          stories={viewerData.stories}
          initialStoryIndex={viewerData.index}
        />
      )}

      {/* Global Reel Components */}
      <ReelCommentDrawer />
      <ReelCommentDialog />
    </div>
  );
};
