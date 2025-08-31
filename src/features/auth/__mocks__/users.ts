export const mockUsers = [
  {
    id: '1',
    email: 'demo@instagram.com',
    name: 'Demo User',
    username: 'demouser',
    avatar: 'https://picsum.photos/100/100?random=1',
    isVerified: true,
    password: 'password123',
    hasTwoFactor: true,
  },
  {
    id: '2',
    email: 'user@example.com',
    name: 'John Doe',
    username: 'johndoe',
    isVerified: false,
    password: 'password123',
    hasTwoFactor: false,
  },
];

export const mockAuthDelay = () => 
  new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));