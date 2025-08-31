import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FollowButton } from '../components/FollowButton';
import { FriendRequestCard } from '../components/FriendRequestCard';
import { BlockDialog } from '../components/BlockDialog';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  setFriends,
  setFriendRequests,
  followUser,
  unfollowUser,
  acceptFriendRequest,
  declineFriendRequest,
  blockUser,
  toggleCloseFriend,
  User,
} from '../friendSlice';
import {
  mockFriends,
  mockFriendRequests,
  mockBlockedUsers,
} from '../__mocks__/users';
import {
  Users,
  UserPlus,
  Search,
  Star,
  MoreHorizontal,
  UserMinus,
  Shield,
  Heart,
  Verified,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function FriendsPage() {
  const dispatch = useAppDispatch();
  const { friends, friendRequests } = useAppSelector((state) => state.friend);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);

  useEffect(() => {
    dispatch(setFriends(mockFriends));
    dispatch(setFriendRequests(mockFriendRequests));
  }, [dispatch]);

  const filteredFriends = friends.filter(
    (friend) =>
      friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const closeFriends = friends.filter((friend) => friend.isCloseFriend);

  const handleFollow = (userId: string) => {
    dispatch(followUser(userId));
  };

  const handleUnfollow = (userId: string) => {
    dispatch(unfollowUser(userId));
  };

  const handleAcceptRequest = (requestId: string) => {
    dispatch(acceptFriendRequest(requestId));
  };

  const handleDeclineRequest = (requestId: string) => {
    dispatch(declineFriendRequest(requestId));
  };

  const handleBlockUser = (user: User) => {
    setSelectedUser(user);
    setIsBlockDialogOpen(true);
  };

  const handleConfirmBlock = (userId: string) => {
    dispatch(blockUser(userId));
  };

  const handleToggleCloseFriend = (userId: string) => {
    dispatch(toggleCloseFriend(userId));
  };

  const FriendCard = ({ friend }: { friend: User }) => (
    <Card className="hover:shadow-soft transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className="w-12 h-12">
                <AvatarImage src={friend.avatar} alt={friend.name} />
                <AvatarFallback className="bg-gradient-instagram text-white font-medium">
                  {friend.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {friend.isCloseFriend && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-story rounded-full flex items-center justify-center">
                  <Star className="w-3 h-3 text-white fill-current" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <h3 className="font-semibold text-sm truncate">{friend.name}</h3>
                {friend.isVerified && (
                  <Verified className="w-4 h-4 text-primary fill-current" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">@{friend.username}</p>
              {friend.mutualFriends > 0 && (
                <p className="text-xs text-muted-foreground">
                  {friend.mutualFriends} bạn chung
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <FollowButton
              userId={friend.id}
              isFollowing={friend.isFollowing}
              isFollowingYou={friend.isFollowingYou}
              onFollow={handleFollow}
              onUnfollow={handleUnfollow}
              size="sm"
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-8 h-8">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => handleToggleCloseFriend(friend.id)}
                >
                  <Heart className={`w-4 h-4 mr-2 ${friend.isCloseFriend ? 'fill-current text-red-500' : ''}`} />
                  {friend.isCloseFriend ? 'Bỏ khỏi bạn thân' : 'Thêm vào bạn thân'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBlockUser(friend)}>
                  <Shield className="w-4 h-4 mr-2" />
                  Chặn
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-instagram flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Bạn bè</h1>
            <p className="text-muted-foreground">Quản lý kết nối của bạn</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Tìm kiếm bạn bè..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Tất cả ({friends.length})
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Lời mời ({friendRequests.length})
          </TabsTrigger>
          <TabsTrigger value="close" className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            Bạn thân ({closeFriends.length})
          </TabsTrigger>
          <TabsTrigger value="blocked" className="flex items-center gap-2">
            <UserMinus className="w-4 h-4" />
            Đã chặn ({mockBlockedUsers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredFriends.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery ? 'Không tìm thấy bạn bè nào' : 'Chưa có bạn bè nào'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredFriends.map((friend) => (
                <FriendCard key={friend.id} friend={friend} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          {friendRequests.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Không có lời mời kết bạn nào</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {friendRequests.map((request) => (
                <FriendRequestCard
                  key={request.id}
                  request={request}
                  onAccept={handleAcceptRequest}
                  onDecline={handleDeclineRequest}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="close" className="space-y-4">
          {closeFriends.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Chưa có bạn thân nào</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Thêm bạn bè vào danh sách bạn thân để chia sẻ nội dung riêng tư
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {closeFriends.map((friend) => (
                <FriendCard key={friend.id} friend={friend} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="blocked" className="space-y-4">
          <Card>
            <CardContent className="p-8 text-center">
              <UserMinus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Danh sách người dùng đã chặn</p>
              <p className="text-xs text-muted-foreground mt-2">
                Các người dùng bị chặn sẽ không thể tương tác với bạn
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <BlockDialog
        isOpen={isBlockDialogOpen}
        onClose={() => setIsBlockDialogOpen(false)}
        user={selectedUser}
        onConfirm={handleConfirmBlock}
      />
    </div>
  );
}