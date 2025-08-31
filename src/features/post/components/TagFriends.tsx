import { useState } from 'react';
import { Search, X, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockFriends } from '../__mocks__/friends';

interface TagFriendsProps {
  selectedFriends: string[];
  onSelectionChange: (friends: string[]) => void;
  onClose: () => void;
}

export const TagFriends = ({ selectedFriends, onSelectionChange, onClose }: TagFriendsProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFriends = mockFriends.filter(friend =>
    friend.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    friend.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFriend = (friendUsername: string) => {
    if (selectedFriends.includes(friendUsername)) {
      onSelectionChange(selectedFriends.filter(f => f !== friendUsername));
    } else {
      onSelectionChange([...selectedFriends, friendUsername]);
    }
  };

  const selectedFriendsList = mockFriends.filter(f => selectedFriends.includes(f.username));

  return (
    <div className="space-y-4 p-4 border border-border rounded-lg bg-background">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Gắn thẻ bạn bè</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm bạn bè..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Selected Friends */}
      {selectedFriendsList.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">Đã chọn ({selectedFriendsList.length})</p>
          <div className="flex flex-wrap gap-2">
            {selectedFriendsList.map((friend) => (
              <Badge key={friend.id} variant="secondary" className="gap-1">
                {friend.name}
                <button
                  onClick={() => toggleFriend(friend.username)}
                  className="hover:bg-destructive/20 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Friends List */}
      <div className="max-h-60 overflow-y-auto space-y-2">
        {filteredFriends.map((friend) => {
          const isSelected = selectedFriends.includes(friend.username);
          
          return (
            <div
              key={friend.id}
              onClick={() => toggleFriend(friend.username)}
              className={`
                flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors
                ${isSelected 
                  ? 'bg-primary/10 border border-primary/20' 
                  : 'hover:bg-muted'
                }
              `}
            >
              <div className="relative">
                <img
                  src={friend.avatar}
                  alt={friend.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                {friend.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-background"></div>
                )}
              </div>
              
              <div className="flex-1">
                <p className="font-medium">{friend.name}</p>
                <p className="text-sm text-muted-foreground">@{friend.username}</p>
              </div>

              {isSelected && (
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredFriends.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Không tìm thấy bạn bè nào</p>
        </div>
      )}
    </div>
  );
};