import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthLayout } from "@/layouts/AuthLayout";
import { MainLayout } from "@/layouts/MainLayout";
import { store, useAppDispatch, useAppSelector } from "@/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { useEffect } from "react";

// Utils & Constants
import { hydrateAuthAsync } from "@/features/auth/authSlice";
import { setOnUnauthorizedNavigate } from "@/lib/axios";
import {
  AUTH_LOGIN_ENDPOINT,
  ACCESS_TOKEN_STORAGE_KEY,
} from "@/utils/constants";
import { WebSocketProvider } from "./utils/WebSocketProvider";
import { GlobalCallHandler } from "./features/message/components/GlobalCallHandler";
import { hasAdminRole } from "@/lib/utils";

// Pages
import AdminModeration from "./pages/AdminModeration";
import NotFound from "./pages/NotFound";
import PeopleSuggestions from "./pages/PeopleSuggestions";
import About from "./pages/About";

// Auth Pages
import ForgotPasswordPage from "./features/auth/pages/ForgotPasswordPage";
import LoginPage from "./features/auth/pages/LoginPage";
import { OAuthCallbackPage } from "./features/auth/pages/OAuthCallbackPage";
import { OAuthCompleteProfilePage } from "./features/auth/pages/OAuthCompleteProfilePage";
import RegisterPage from "./features/auth/pages/RegisterPage";
import { RegisterSuccessPage } from "./features/auth/pages/RegisterSuccessPage";
import TwoFactorPage from "./features/auth/pages/TwoFactorPage";

// Post Pages
import { CreatePostPage } from "./features/post/pages/CreatePostPage";
import { FeedPage } from "./features/post/pages/FeedPage";
import { LiveStudioPage } from "./features/post/pages/LiveStudioPage";
import { NoteCreatePage } from "./features/post/pages/NoteCreatePage";
import { PostDetailPage } from "./features/post/pages/PostDetailPage";
import ReelCreatePage from "./features/reel/pages/ReelCreatePage";
import ReelEditPage from "./features/reel/pages/ReelEditPage";
import { ReelsPage } from "./features/reel";
import ReelDetailPage from "./features/reel/pages/ReelDetailPage";

// Notification Pages
import NotificationPage from "./features/notification/pages/NotificationPage";

// Friend Pages
import FriendsPage from "./features/friend/pages/FriendsPage";
import SuggestedPage from "./features/friend/pages/SuggestedPage";

// Message Pages
import { ExplorePage } from "./features/explore/pages/ExplorePage";
import { SearchPage } from "./features/explore/pages/SearchPage";
import { ChatPage } from "./features/message/pages/ChatPage";
import { InboxPage } from "./features/message/pages/InboxPage";

// Profile Pages
import { AccountSettingsPage } from "./features/profile/pages/AccountSettingsPage";
import { BlockedUsersPage } from "./features/profile/pages/BlockedUsersPage";
import { CloseFriendsPage } from "./features/profile/pages/CloseFriendsPage";
import { EditProfilePage } from "./features/profile/pages/EditProfilePage";
import { HiddenPostsPage } from "./features/profile/pages/HiddenPostsPage";
import { ProfilePage } from "./features/profile/pages/ProfilePage";

// Story Pages
import { ArchivePage } from "./features/story/pages/ArchivePage";
import { StoryCreatePage } from "./features/story/pages/StoryCreatePage";
import { StoryDetailPage } from "./features/story/pages/StoryDetailPage";

// Admin Pages
import AdminLayout from "./features/admin/pages/AdminLayout";
import Settings from "./features/admin/pages/Settings";
import Users from "./features/admin/pages/Users";
import Dashboard from "./features/admin/pages/Dashboard";
import Comments from "./features/admin/pages/Comments";
import Posts from "./features/admin/pages/Posts";
import Reports from "./features/admin/pages/Reports";

const queryClient = new QueryClient();

const NavigationBinder = () => {
  const navigate = useNavigate();
  useEffect(() => {
    setOnUnauthorizedNavigate((path) => navigate(path, { replace: true }));
  }, [navigate]);
  return null;
};

const HydrateOnStart = () => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(hydrateAuthAsync());
  }, [dispatch]);
  return null;
};

// --- GUARD COMPONENTS ---

// 1. RequireAuth: Bắt buộc phải đăng nhập mới được vào
const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, isHydrated } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (!isHydrated) return null; // Chờ load state từ localStorage

  if (!isAuthenticated)
    return (
      <Navigate to={AUTH_LOGIN_ENDPOINT} replace state={{ from: location }} />
    );
  return children;
};

// 2. GuestGuard: Đã đăng nhập thì KHÔNG được vào (dành cho trang Login/Register)
const GuestGuard = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, isHydrated } = useAppSelector((state) => state.auth);

  if (!isHydrated) return null; // Chờ xác định trạng thái đăng nhập

  if (isAuthenticated) {
    // Nếu đã login, đá về trang chủ (Sau đó UserGuard/AdminGuard sẽ lo phần còn lại)
    return <Navigate to="/" replace />;
  }

  return children;
};

// 3. AdminGuard: Chặn User thường, chỉ cho Admin vào
const AdminGuard = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);

  if (!token || !hasAdminRole(token)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

// 4. UserGuard: Chặn Admin, chỉ cho User thường vào
const UserGuard = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);

  if (token && hasAdminRole(token)) {
    return <Navigate to="/admin" replace />;
  }
  return children;
};

// ------------------------

const AuthenticatedAppWrapper = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  if (isAuthenticated)
    return (
      <WebSocketProvider>
        <GlobalCallHandler>{children}</GlobalCallHandler>
      </WebSocketProvider>
    );
  return children;
};

const App = () => (
  <ErrorBoundary>
    <ThemeProvider>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <BrowserRouter>
              <NavigationBinder />
              <HydrateOnStart />
              <Routes>
                {/* --- USER ROUTES --- */}
                <Route
                  path="/"
                  element={
                    <RequireAuth>
                      <AuthenticatedAppWrapper>
                        <UserGuard>
                          <MainLayout />
                        </UserGuard>
                      </AuthenticatedAppWrapper>
                    </RequireAuth>
                  }
                >
                  <Route index element={<FeedPage />} />
                  <Route path="search" element={<SearchPage />} />
                  <Route path="explore" element={<ExplorePage />} />
                  <Route path="reels" element={<ReelsPage />} />
                  <Route path="reels/:reelId" element={<ReelDetailPage />} />
                  <Route path="reels/create" element={<ReelCreatePage />} />
                  <Route path="reels/:reelId/edit" element={<ReelEditPage />} />
                  <Route path="messages" element={<InboxPage />} />
                  <Route path="messages/:chatId" element={<ChatPage />} />
                  <Route path="notifications" element={<NotificationPage />} />
                  <Route path="friends" element={<FriendsPage />} />
                  <Route path="suggested" element={<SuggestedPage />} />
                  <Route path="create" element={<CreatePostPage />} />
                  <Route path="posts/:postId" element={<PostDetailPage />} />
                  <Route path="live" element={<LiveStudioPage />} />
                  <Route path="notes/create" element={<NoteCreatePage />} />
                  <Route path="edit-profile" element={<EditProfilePage />} />
                  <Route
                    path="account/settings"
                    element={<AccountSettingsPage />}
                  />
                  <Route
                    path="account/blocked"
                    element={<BlockedUsersPage />}
                  />
                  <Route
                    path="account/hidden-posts"
                    element={<HiddenPostsPage />}
                  />
                  <Route
                    path="account/close-friends"
                    element={<CloseFriendsPage />}
                  />
                  <Route path="archive/stories" element={<ArchivePage />} />
                  <Route path="stories/create" element={<StoryCreatePage />} />
                  <Route path="posts/story/view-detail/:storyId" element={<StoryDetailPage />} />
                  <Route path=":username" element={<ProfilePage />} />
                  <Route path="settings" element={<AccountSettingsPage />} />
                  <Route
                    path="people/suggestions"
                    element={<PeopleSuggestions />}
                  />
                  <Route path="about" element={<About />} />
                </Route>

                {/* --- ADMIN ROUTES --- */}
                <Route
                  path="/admin"
                  element={
                    <RequireAuth>
                      <AuthenticatedAppWrapper>
                        <AdminGuard>
                          <AdminLayout />
                        </AdminGuard>
                      </AuthenticatedAppWrapper>
                    </RequireAuth>
                  }
                >
                  <Route index element={<Dashboard />} />
                  <Route path="users" element={<Users />} />
                  <Route path="posts" element={<Posts />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="comments" element={<Comments />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="moderation" element={<AdminModeration />} />
                </Route>

                {/* --- AUTH ROUTES (Đã bọc GuestGuard) --- */}
                <Route
                  path="/auth"
                  element={
                    <GuestGuard>
                      <AuthLayout />
                    </GuestGuard>
                  }
                >
                  <Route path="login" element={<LoginPage />} />
                  <Route path="register" element={<RegisterPage />} />
                  <Route
                    path="register-success"
                    element={<RegisterSuccessPage />}
                  />
                  <Route
                    path="forgot-password"
                    element={<ForgotPasswordPage />}
                  />
                  <Route path="2fa" element={<TwoFactorPage />} />
                  <Route
                    path="oauth/callback"
                    element={<OAuthCallbackPage />}
                  />
                  <Route
                    path="oauth/complete-profile"
                    element={<OAuthCompleteProfilePage />}
                  />
                </Route>

                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </Provider>
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;
