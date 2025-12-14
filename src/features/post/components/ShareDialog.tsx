import { useState, useRef, useEffect } from 'react';
import { X, Search, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
}

interface Post {
  id: string;
  content: string;
  media: Array<{
    url: string;
    type: 'image' | 'video';
    alt?: string;
  }>;
  userName: string;
  avatarUrl: string;
  createdAt: string;
}

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
  onShare: (postId: string, userIds: string[], message: string) => void;
}

// Mock data for suggested users
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Hoang Anhh',
    username: 'bank.___',
    avatar: 'https://scontent.cdninstagram.com/v/t51.82787-19/539831242_18118861246501326_4977813644391891902_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_cat=109&ccb=7-5&_nc_sid=f7ccc5&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=sFqirEFnjroQ7kNvwFisrJ4&_nc_oc=AdmGnzZZKyNU3JEyyG-lC-Ifn-dtjaAmcPlHz-bF_UxUGSj5eSyV0XjZMxccMQ99Ggs&_nc_ad=z-m&_nc_cid=0&_nc_zt=24&_nc_ht=scontent.cdninstagram.com&_nc_gid=JWeV_PqCo8_Jo8PI7bNpmw&oh=00_AfaA0dsEG1Dx39GGENqI3of7-tMET1mDzxoIq7PwqBx0qA&oe=68CC216D'
  },
  {
    id: '2',
    name: 'nvaannhi',
    username: 'nvaannhi',
    avatar: 'https://scontent.cdninstagram.com/v/t51.82787-19/541550606_18100612621716607_8158256632058453044_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_cat=101&ccb=7-5&_nc_sid=f7ccc5&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=-NqDOf8M4FEQ7kNvwHEUDC0&_nc_oc=AdmR4226V5qJzcQM2teQ4xPoOWHuQkHtulaHkEy8Tzis8y3FB_k14O0GFBBzq4DJrP8&_nc_ad=z-m&_nc_cid=0&_nc_zt=24&_nc_ht=scontent.cdninstagram.com&_nc_gid=JWeV_PqCo8_Jo8PI7bNpmw&oh=00_AfaHVZZqAKgysnmq1JooMuTVXMijaoRdY9DQRl51NdQ-KQ&oe=68CC347D'
  },
  {
    id: '3',
    name: 'Kieu Nhii ♡︎',
    username: 'ky_nnii',
    avatar: 'https://scontent.cdninstagram.com/v/t51.82787-19/520310533_18102398989560974_7256207500490783306_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_cat=105&ccb=7-5&_nc_sid=f7ccc5&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=nL3QihCha3gQ7kNvwEA5MUq&_nc_oc=Adk3ioNMaC92czYm-wr4IblqRAkJmkFVz1g5Sy71eOx5KkoIwu9jdYhEnkRqAcEjwio&_nc_ad=z-m&_nc_cid=0&_nc_zt=24&_nc_ht=scontent.cdninstagram.com&_nc_gid=JWeV_PqCo8_Jo8PI7bNpmw&oh=00_Afa4cdF8Bm8rsmz-WZPon5q7t38guav67JTA2LDZz5T5Xw&oe=68CC1DDF'
  },
  {
    id: '4',
    name: 'Dương Miô',
    username: 'z.lam2384',
    avatar: 'https://scontent.cdninstagram.com/v/t51.2885-19/442679391_974128427639320_1800805072873373802_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_cat=109&ccb=7-5&_nc_sid=f7ccc5&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=A7rrAQbuvvMQ7kNvwHHFHAw&_nc_oc=AdmjyRVULaICZb8k3NzNXWRCuFVCy6VijU1eGpaVommWhlmPA6hDK26L0QE-j780dG0&_nc_ad=z-m&_nc_cid=0&_nc_zt=24&_nc_ht=scontent.cdninstagram.com&oh=00_AfYRJOdEzIIfyAFnvH3EqIISQuWP3PnkNl71z-20S4ltxw&oe=68CC271B'
  },
  {
    id: '5',
    name: 'Lê Quốc Nam',
    username: 'lquoc.n4m',
    avatar: 'https://scontent.cdninstagram.com/v/t51.2885-19/477023121_1806514586758668_2909017422181602541_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_cat=101&ccb=7-5&_nc_sid=f7ccc5&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4zMjAuQzMifQ%3D%3D&_nc_ohc=FoSh3Y-M6tkQ7kNvwEW73x7&_nc_oc=AdkH7jMqJnJ5gDLvENslCYi5AP9zbhbdszN1JlTLQfiQNW0jhRa2U0A1bWIn8M186y4&_nc_ad=z-m&_nc_cid=0&_nc_zt=24&_nc_ht=scontent.cdninstagram.com&oh=00_AfZFufwM2Bu6uQGj2mHsT7UTEVSGHWHp1uxeDAZlDp1dHg&oe=68CC1B48'
  },
  {
    id: '6',
    name: 'Nguyễn Trọng Hoàng',
    username: 'nguyentrhoang_',
    avatar: 'https://scontent.cdninstagram.com/v/t51.2885-19/485229624_676494775043960_5163166687117848456_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_cat=106&ccb=7-5&_nc_sid=f7ccc5&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy45NjAuQzMifQ%3D%3D&_nc_ohc=2Tl6tfRWZ54Q7kNvwFDFpli&_nc_oc=Adny5z382OHRkYwpDMQV8YOV3eCIO_CfLyRsMX39H_YYlhW3N3gm-8FxmSEaZHBFErw&_nc_ad=z-m&_nc_cid=0&_nc_zt=24&_nc_ht=scontent.cdninstagram.com&oh=00_AfaQrZYMogk_7NUfCPALV_2-wHvqge-0I0AAIlDScdjXTg&oe=68CC3A4B'
  },
  {
    id: '7',
    name: 'Thành Phát',
    username: 'nat.phatt09',
    avatar: 'https://scontent.cdninstagram.com/v/t51.82787-19/532308702_18048548141552298_4207285087474180870_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_cat=103&ccb=7-5&_nc_sid=f7ccc5&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy44MjguQzMifQ%3D%3D&_nc_ohc=lFWl-y79suAQ7kNvwEqX5k7&_nc_oc=AdnkupaGwZrebc9IuBHAcPUE6v1dqtubyg17YhFXdy5Dz36eOx9yRnRTnLhNgsyR91w&_nc_ad=z-m&_nc_cid=0&_nc_zt=24&_nc_ht=scontent.cdninstagram.com&_nc_gid=g7cl7-iMXx6rGfON9ynMoA&oh=00_AfY8Jxufpb6RRttJao5uRn1TosrJd8gW7p6z5Yk7hLGupA&oe=68CC19A4'
  },
  {
    id: '8',
    name: 'Thùy Dương',
    username: 'ntt.duonggnek',
    avatar: 'https://scontent.cdninstagram.com/v/t51.82787-19/516374925_17889644946280951_8082077746886092442_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_cat=106&ccb=7-5&_nc_sid=f7ccc5&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=O3JTYIbZlPEQ7kNvwEVil3c&_nc_oc=AdmkxmUoPhhB41rr9GbPL13o6NJGnNRlKvnPJePjMNSntxYMzcVGyhR7V8zKuQ5PWLk&_nc_ad=z-m&_nc_cid=0&_nc_zt=24&_nc_ht=scontent.cdninstagram.com&_nc_gid=CSOUzYgYZbV4N9a9veQ9PA&oh=00_AfYzytAJpDI1pHkKFihp4z0ByjTILW-ASvf5x48jdvVeGA&oe=68CC4A69'
  },
  {
    id: '9',
    name: 'Nguyen Anh Duc',
    username: '_d.wcs',
    avatar: 'https://scontent.cdninstagram.com/v/t51.75761-19/501996131_18155822227366202_5792904974359287664_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_cat=108&ccb=7-5&_nc_sid=f7ccc5&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=OZRxEPKhu4oQ7kNvwH3IVs-&_nc_oc=Adk2CjaB8OIBda3Iku505kjf9gG0yZZdp0xQvBIsagAQjlGLmCqFZO1hXsk5PpzpMvw&_nc_ad=z-m&_nc_cid=0&_nc_zt=24&_nc_ht=scontent.cdninstagram.com&_nc_gid=CSOUzYgYZbV4N9a9veQ9PA&oh=00_AfYhi1OKnjJV34-bKNWO0q5pxKOFtO2ECGZ-IGGzW8j7Wg&oe=68CC3AFB'
  },
  {
    id: '10',
    name: 'ㅤNGUYEN THANH NHII',
    username: 'thanhii___',
    avatar: 'https://scontent.cdninstagram.com/v/t51.2885-19/44884218_345707102882519_2446069589734326272_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_cat=1&ccb=7-5&_nc_sid=f7ccc5&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy5DMyJ9&_nc_ohc=Uj2LIz4c7vYQ7kNvwHmKzhB&_nc_oc=Adl0hU4LBVh-7gfRyYcDGX25FedFHswXU0J9VFbrGvEJM7AqZ7s8i7tClif2xsFfJ_A&_nc_ad=z-m&_nc_cid=0&_nc_zt=24&_nc_ht=scontent.cdninstagram.com&oh=00_AfYvLwkQruSEGWxvGjeemEI_XF2cOHrIAPSRf40C4BAZVQ&oe=68CC4C0F'
  },
  {
    id: '11',
    name: 'Trang Sức Bạc Helino',
    username: 'helino.official',
    avatar: 'https://scontent.cdninstagram.com/v/t51.2885-19/429370533_2094317174267793_1198425198114290767_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_cat=103&ccb=7-5&_nc_sid=f7ccc5&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=1j2qpD9_-lkQ7kNvwECS08d&_nc_oc=AdmclaK4sOEgV-npBXqF6ghQbv8zA7LMlMJJaixafbEkfkvkh5GWj9Kp9vN5e-iTNJo&_nc_ad=z-m&_nc_cid=0&_nc_zt=24&_nc_ht=scontent.cdninstagram.com&oh=00_AfbxsLtPuiCa8uTdCe8bTBsqeZ-pgyYv5wbx55eeeXSSGQ&oe=68CC3C58'
  },
  {
    id: '12',
    name: 'Gia Hưng',
    username: 'hungfitnit',
    avatar: 'https://scontent.cdninstagram.com/v/t51.82787-19/525277311_18070539944087137_6107182357637329483_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_cat=100&ccb=7-5&_nc_sid=f7ccc5&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=D5GJgaBVCQ0Q7kNvwH66fmh&_nc_oc=AdlxjGW_DsFYMFazjovgjHKY4R-wrwFf2TpMU8MpKF7duv0alsKvQTrXQ2aewJ-4R04&_nc_ad=z-m&_nc_cid=0&_nc_zt=24&_nc_ht=scontent.cdninstagram.com&_nc_gid=CSOUzYgYZbV4N9a9veQ9PA&oh=00_Afbua41fbkdf6DEqUzz3zg4p98PRmfGhX4j8pj276KNg_A&oe=68CC2792'
  },
  {
    id: '13',
    name: 'Phan Văn Thuận',
    username: 'vanthuank4',
    avatar: 'https://scontent.cdninstagram.com/v/t51.2885-19/430240289_967535564795166_3764393134509382273_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_cat=104&ccb=7-5&_nc_sid=f7ccc5&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=GCvzGkMZPCMQ7kNvwGKUqBg&_nc_oc=Adn8TI_K77wyAZbOVMDgEhC0-CrQ2-TnniJ2JO8k27_qF8mekmJC5C1xFyQDDtZpjLM&_nc_ad=z-m&_nc_cid=0&_nc_zt=24&_nc_ht=scontent.cdninstagram.com&oh=00_AfZN4_00GdNjLk1-aL-AA8icqsuq_PBK2eJWmfjQsQAouQ&oe=68CC1928'
  }
];

export const ShareDialog = ({
  isOpen,
  onClose,
  post,
  onShare,
}: ShareDialogProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Lock body scroll
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('keydown', handleEscape);
      // Unlock body scroll
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      // Ensure scroll is unlocked on cleanup
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUserToggle = (userId: string, event?: React.MouseEvent) => {
    // Prevent event bubbling when clicking on checkbox
    if (event) {
      event.stopPropagation();
    }
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleShare = () => {
    if (selectedUsers.length > 0) {
      onShare(post.id, selectedUsers, message);
      setSelectedUsers([]);
      setMessage('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md h-[600px] flex flex-col animate-in fade-in-0 zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold">Share</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              To:
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Suggested Users */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Suggested
            </h3>
            <div className="space-y-2">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer"
                  onClick={() => handleUserToggle(user.id)}
                >
                  <Avatar className="w-11 h-11">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">
                        {user.name}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {user.username}
                    </div>
                  </div>
                  <div className="flex items-center" onClick={(e) => handleUserToggle(user.id, e)}>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => {}} // Controlled by parent click
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 pointer-events-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Message Input and Action Buttons */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-3">
            <Input
              placeholder="Write a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full"
            />
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare();
                }}
                disabled={selectedUsers.length === 0}
                className="px-6"
              >
                <Send className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
