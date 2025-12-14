import { SavedPost } from '../types';

export const mockSavedPosts: SavedPost[] = [
  {
    id: 'saved-1',
    postId: 'post-1',
    collectionId: 'all-posts',
    savedAt: '2024-01-15T10:30:00Z',
    post: {
      id: 'post-1',
      userId: 'user-1',
      userName: 'tech_developer',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      content: '(Save ❤️) API Calling Redux With Redux Toolkit\n\n-> Redux Toolkit Makes API Handling Easier & More Efficient. With createAsyncThunk, You Can Manage Asynchronous Requests Like A Pro!\n\n#nodejs #javascriptdeveloper #reduxtoolkit #merstack #jsbrasil #codinglife #apidevelopment #react #javascripttricks #javascripttips',
      media: [{
        id: 'media-1',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=400&fit=crop',
        alt: 'Redux Toolkit API calling diagram'
      }],
      likesCount: 1250,
      commentsCount: 89,
      createdAt: '2024-01-14T09:15:00Z',
    },
  },
  {
    id: 'saved-2',
    postId: 'post-2',
    collectionId: 'all-posts',
    savedAt: '2024-01-15T09:45:00Z',
    post: {
      id: 'post-2',
      userId: 'user-2',
      userName: 'react_roadmap',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      content: 'ReactJS roadmap 🔥\n\nFollow @theindiandev for more!!\n\n#reactjs #reactnative #javascript #developer #coding #programming #webdevelopment #webdev\n\nAre you learning React?',
      media: [{
        id: 'media-2',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
        alt: 'ReactJS roadmap infographic'
      }],
      likesCount: 2100,
      commentsCount: 156,
      createdAt: '2024-01-13T14:20:00Z',
    },
  },
  {
    id: 'saved-3',
    postId: 'post-3',
    collectionId: 'haha',
    savedAt: '2024-01-14T16:30:00Z',
    post: {
      id: 'post-3',
      userId: 'user-3',
      userName: 'funny_memes',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      content: 'Cuối tháng hết xiền hẹn hò ăn vặt siu ngon giá sinh viên thoiii 😘\n\n#foodreview #foodinsta #foodporn #foodblogger #foodie #trending #viralreels #xuhuong #yummy #amthuc #henho #flan #pannacotta #cavienchien #vietnamesefood #quanbinhthanh #streetfood #homnayangi #diadiemanuong #dianthoi #fyp #anvat #saigon #date #reels #reelsinstagram',
      media: [{
        id: 'media-3',
        type: 'video',
        url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop',
        alt: 'Food review video'
      }],
      likesCount: 890,
      commentsCount: 45,
      createdAt: '2024-01-12T18:45:00Z',
    },
  },
  {
    id: 'saved-4',
    postId: 'post-4',
    collectionId: 'tech',
    savedAt: '2024-01-13T11:20:00Z',
    post: {
      id: 'post-4',
      userId: 'user-4',
      userName: 'coding_tips',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      content: 'Dịp ở nhà này cậu đã học thêm gì rồi?\nHọc nấu ăn, trau dồi ngôn ngữ mới hay chỉ đơn giản là học yêu bản thân hơn? 🥰🥰\n\nHôm nay hãy cùng tớ lưu lại 4 khóa học hữu ích miễn phí của Coursera để có thêm nhiều kiến thức nhen.\n\nTruy cập Coursera.org thui nào. Link khóa học tớ sẽ đính kèm ở mục story highlight với tiêu đề là Study nhé.',
      media: [{
        id: 'media-4',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=400&fit=crop',
        alt: 'Coursera courses infographic'
      }],
      likesCount: 1560,
      commentsCount: 78,
      createdAt: '2024-01-11T10:15:00Z',
    },
  },
  {
    id: 'saved-5',
    postId: 'post-5',
    collectionId: 'food',
    savedAt: '2024-01-12T15:10:00Z',
    post: {
      id: 'post-5',
      userId: 'user-5',
      userName: 'saigon_foodie',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      content: 'List 40 cafe theo từng quận p1 🫶',
      media: [{
        id: 'media-5',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
        alt: 'Cafe list in Saigon districts'
      }],
      likesCount: 3200,
      commentsCount: 234,
      createdAt: '2024-01-10T13:30:00Z',
    },
  },
  {
    id: 'saved-6',
    postId: 'post-6',
    collectionId: 'food',
    savedAt: '2024-01-11T20:45:00Z',
    post: {
      id: 'post-6',
      userId: 'user-6',
      userName: 'food_lover_sg',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
      content: 'Hướng dẫn đường đến quán cóc bờ kè có view trực diện LM81 cực chill #lacasaigon #saigon #bokequan2 #songsaigon #landmark81 #lm81 #view #fyp',
      media: [{
        id: 'media-6',
        type: 'video',
        url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop',
        alt: 'Food spot with Landmark 81 view'
      }],
      likesCount: 1800,
      commentsCount: 92,
      createdAt: '2024-01-09T16:20:00Z',
    },
  },
];


