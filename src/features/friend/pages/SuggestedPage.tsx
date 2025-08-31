import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SuggestedUserCard } from '../components/SuggestedUserCard';
import { BlockDialog } from '../components/BlockDialog';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  setSuggestedUsers,
  followUser,
  unfollowUser,
  blockUser,
  User,
} from '../friendSlice';
import { mockSuggestedUsers } from '../__mocks__/users';
import { useToast } from '@/hooks/use-toast';
import {
  UserPlus,
  Search,
  Sparkles,
  TrendingUp,
  Users,
  MapPin,
  Briefcase,
  RefreshCw,
} from 'lucide-react';

export default function SuggestedPage() {
  const dispatch = useAppDispatch();
  const { suggestedUsers } = useAppSelector((state) => state.friend);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    dispatch(setSuggestedUsers(mockSuggestedUsers));
  }, [dispatch]);

  const filteredUsers = suggestedUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFollow = (userId: string) => {
    dispatch(followUser(userId));
  };

  const handleUnfollow = (userId: string) => {
    dispatch(unfollowUser(userId));
  };

  const handleRemoveSuggestion = (userId: string) => {
    const updatedUsers = suggestedUsers.filter(user => user.id !== userId);
    dispatch(setSuggestedUsers(updatedUsers));
    toast({
      description: 'Đã xóa gợi ý',
    });
  };

  const handleBlockUser = (user: User) => {
    setSelectedUser(user);
    setIsBlockDialogOpen(true);
  };

  const handleConfirmBlock = (userId: string) => {
    dispatch(blockUser(userId));
    const updatedUsers = suggestedUsers.filter(user => user.id !== userId);
    dispatch(setSuggestedUsers(updatedUsers));
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    dispatch(setSuggestedUsers([...mockSuggestedUsers]));
    setIsRefreshing(false);
    toast({
      description: 'Đã cập nhật danh sách gợi ý',
    });
  };

  const suggestionCategories = [
    {
      title: 'Bạn có thể biết',
      icon: Users,
      users: filteredUsers.filter(user => user.mutualFriends > 2),
    },
    {
      title: 'Cùng sở thích',
      icon: TrendingUp,
      users: filteredUsers.filter(user => user.mutualFriends <= 2 && user.bio?.includes('📸')),
    },
    {
      title: 'Phổ biến',
      icon: Sparkles,
      users: filteredUsers.filter(user => user.isVerified),
    },
    {
      title: 'Gần bạn',
      icon: MapPin,
      users: filteredUsers.filter(user => user.mutualFriends === 0),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-instagram flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Gợi ý kết bạn</h1>
              <p className="text-muted-foreground">Khám phá những người bạn có thể biết</p>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Tìm kiếm người dùng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-bold">{suggestedUsers.length}</p>
            <p className="text-xs text-muted-foreground">Gợi ý</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <p className="text-2xl font-bold">87%</p>
            <p className="text-xs text-muted-foreground">Độ chính xác</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-2">
              <Sparkles className="w-5 h-5 text-accent" />
            </div>
            <p className="text-2xl font-bold">{suggestedUsers.filter(u => u.isVerified).length}</p>
            <p className="text-xs text-muted-foreground">Đã xác minh</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-2">
              <MapPin className="w-5 h-5 text-warning" />
            </div>
            <p className="text-2xl font-bold">{suggestedUsers.filter(u => u.mutualFriends > 0).length}</p>
            <p className="text-xs text-muted-foreground">Bạn chung</p>
          </CardContent>
        </Card>
      </div>

      {/* Categorized Suggestions */}
      <div className="space-y-8">
        {suggestionCategories.map((category) => {
          if (category.users.length === 0) return null;
          
          return (
            <div key={category.title}>
              <div className="flex items-center gap-2 mb-4">
                <category.icon className="w-5 h-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold">{category.title}</h2>
                <span className="text-sm text-muted-foreground">({category.users.length})</span>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.users.map((user) => (
                  <SuggestedUserCard
                    key={user.id}
                    user={user}
                    onFollow={handleFollow}
                    onUnfollow={handleUnfollow}
                    onRemove={handleRemoveSuggestion}
                    onBlock={() => handleBlockUser(user)}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {filteredUsers.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? 'Không tìm thấy người dùng nào' : 'Không có gợi ý nào'}
              </p>
              {!searchQuery && (
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  className="mt-4"
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Tải gợi ý mới
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <BlockDialog
        isOpen={isBlockDialogOpen}
        onClose={() => setIsBlockDialogOpen(false)}
        user={selectedUser}
        onConfirm={handleConfirmBlock}
      />
    </div>
  );
}