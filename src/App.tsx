import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthLayout } from "@/layouts/AuthLayout";
import { MainLayout } from "@/layouts/MainLayout";
import { store } from "@/store";
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

// Pages
import AdminModeration from "./pages/AdminModeration";
import NotFound from "./pages/NotFound";
import PeopleSuggestions from "./pages/PeopleSuggestions";

// Auth Pages
import ForgotPasswordPage from "./features/auth/pages/ForgotPasswordPage";
import LoginPage from "./features/auth/pages/LoginPage";
import RegisterPage from "./features/auth/pages/RegisterPage";
import TwoFactorPage from "./features/auth/pages/TwoFactorPage";

// Post Pages
import { CommentPage } from "./features/interaction/pages/CommentPage";
import { CreatePostPage } from "./features/post/pages/CreatePostPage";
import { FeedPage } from "./features/post/pages/FeedPage";
import { LiveStudioPage } from "./features/post/pages/LiveStudioPage";
import { NoteCreatePage } from "./features/post/pages/NoteCreatePage";
import { PostDetailPage } from "./features/post/pages/PostDetailPage";
import { ReelCreatePage } from "./features/post/pages/ReelCreatePage";

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
import { hydrateAuthAsync } from "@/features/auth/authSlice";
import { setOnUnauthorizedNavigate } from "@/lib/axios";
import { useAppDispatch, useAppSelector } from "@/store";
import { AUTH_LOGIN_ENDPOINT } from "@/utils/constants";
import { useEffect } from "react";
import { AccountSettingsPage } from "./features/profile/pages/AccountSettingsPage";
import { BlockedUsersPage } from "./features/profile/pages/BlockedUsersPage";
import { CloseFriendsPage } from "./features/profile/pages/CloseFriendsPage";
import { EditProfilePage } from "./features/profile/pages/EditProfilePage";
import { HiddenPostsPage } from "./features/profile/pages/HiddenPostsPage";
import { ProfilePage } from "./features/profile/pages/ProfilePage";
import { WebSocketProvider } from "./utils/WebSocketProvider";
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

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, isHydrated } = useAppSelector((state) => state.auth);
  const location = useLocation();
  if (!isHydrated) {
    return null; // or a loader
  }
  if (!isAuthenticated) {
    return (
      <Navigate to={AUTH_LOGIN_ENDPOINT} replace state={{ from: location }} />
    );
  }
  return children;
};
const AuthenticatedAppWrapper = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  if (isAuthenticated) {
    return <WebSocketProvider >{children}</WebSocketProvider>;
  }

  return children;
};
const App = () => (
  <ErrorBoundary>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <NavigationBinder />
            <HydrateOnStart />
            <Routes>
              {/* Main App Routes with Layout */}
              <Route
                path="/"
                element={
                  <RequireAuth>
                    <AuthenticatedAppWrapper>
                      <MainLayout />
                    </AuthenticatedAppWrapper>
                  </RequireAuth>
                }
              >
                <Route index element={<FeedPage />} />
                <Route path="search" element={<SearchPage />} />
                <Route path="explore" element={<ExplorePage />} />
                <Route
                  path="reels"
                  element={<div className="p-6">Reels (Coming soon)</div>}
                />
                <Route path="messages" element={<InboxPage />} />
                <Route path="messages/:chatId" element={<ChatPage />} />
                <Route path="notifications" element={<NotificationPage />} />
                <Route path="friends" element={<FriendsPage />} />
                <Route path="suggested" element={<SuggestedPage />} />
                <Route path="create" element={<CreatePostPage />} />
                <Route path="posts/:postId" element={<PostDetailPage />} />
                <Route path="reels/create" element={<ReelCreatePage />} />
                <Route path="live" element={<LiveStudioPage />} />
                <Route path="notes/create" element={<NoteCreatePage />} />
                <Route path="edit-profile" element={<EditProfilePage />} />
                <Route
                  path="account/settings"
                  element={<AccountSettingsPage />}
                />
                <Route path="account/blocked" element={<BlockedUsersPage />} />
                <Route
                  path="account/hidden-posts"
                  element={<HiddenPostsPage />}
                />
                <Route
                  path="account/close-friends"
                  element={<CloseFriendsPage />}
                />
                <Route path=":username" element={<ProfilePage />} />
                <Route path="settings" element={<AccountSettingsPage />} />

                {/* AI Features */}
                <Route
                  path="people/suggestions"
                  element={<PeopleSuggestions />}
                />
                <Route path="admin/moderation" element={<AdminModeration />} />
                <Route path="comments/:postId" element={<CommentPage />} />
              </Route>

              {/* Auth Routes */}
              <Route path="/auth" element={<AuthLayout />}>
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route
                  path="forgot-password"
                  element={<ForgotPasswordPage />}
                />
                <Route path="2fa" element={<TwoFactorPage />} />
              </Route>

              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </Provider>
  </ErrorBoundary>
);

export default App;
