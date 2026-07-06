# Nexo - Social Network Platform (Front-End)

Chào mừng bạn đến với mã nguồn Front-End của **Nexo** – một nền tảng mạng xã hội hiện đại, đầy đủ tính năng và trải nghiệm người dùng tối ưu. Dự án được phát triển bằng **React**, **Vite**, **TypeScript**, và sử dụng phong cách thiết kế hiện đại với **Tailwind CSS** kết hợp cùng hệ thống component **Shadcn UI**.

---

## Giao diện & Trải nghiệm
Nexo được thiết kế hướng tới sự hiện đại, mượt mà và trực quan với:
*   **Chế độ Sáng/Tối (Light/Dark Mode)** tích hợp mượt mà.
*   **Thiết kế tương thích (Responsive Design)** tối ưu hóa cho cả thiết bị di động và máy tính.
*   **Các hiệu ứng chuyển động vi mô (Micro-animations)** tạo cảm giác cao cấp và nhạy bén khi tương tác.

---

## Công nghệ sử dụng (Tech Stack)

### Core & Framework
*   **React 18**: Thư viện UI cốt lõi.
*   **Vite**: Build tool siêu tốc cho môi trường phát triển hiện đại.
*   **TypeScript**: Đảm bảo an toàn kiểu dữ liệu (type-safe) và tăng tốc độ phát triển.

### Quản lý Trạng thái & Dữ liệu (State & Data Fetching)
*   **Redux Toolkit & React Redux**: Quản lý các trạng thái toàn cục của ứng dụng (Authentication, Post state, v.v.).
*   **Axios**: HTTP Client được cấu hình sẵn với interceptors để xử lý tự động refresh token và xử lý lỗi tập trung.

### Giao diện & Styling
*   **Tailwind CSS**: Framework CSS tiện dụng giúp viết CSS nhanh chóng.
*   **Shadcn UI & Radix UI**: Bộ component UI nguyên tử, chất lượng cao, dễ tùy chỉnh.
*   **Lucide React**: Thư viện icon phong phú, hiện đại.
*   **Sonner**: Thư viện hiển thị toast notification trực quan.

### Kết nối Thời gian thực (Real-time)
*   **SockJS Client & STOMP JS**: Kết nối WebSocket tin cậy với Backend giúp cập nhật tin nhắn và thông báo ngay lập tức.

### Form & Validation
*   **React Hook Form & Zod**: Xử lý form và validate dữ liệu chặt chẽ ở phía client.

---

## Các Tính năng Chính

*   **Xác thực & Phân quyền**: Hỗ trợ Đăng ký, Đăng nhập, Quên mật khẩu và Route Guards (Admin / User / Guest).
*   **Bài viết (Feed & Post)**: Tạo bài viết kèm hình ảnh/video, chỉnh sửa, xóa và xem chi tiết.
*   **Stories & Reels**: Tạo và xem Tin (Story) với thanh thời gian chạy tự động, lưu trữ tin cũ; xem và tải lên Thước phim (Reels) ngắn cuộn dọc với video mượt mà.
*   **Nhắn tin Real-time**: Trò chuyện trực tiếp, quản lý hộp thư đến (Inbox), hỗ trợ cuộc gọi Video/Audio trực tuyến qua kết nối thời gian thực.
*   **Thông báo (Notification)**: Nhận thông báo tức thì khi có lượt thích, bình luận, người theo dõi mới hoặc tin nhắn mới.
*   **Bạn bè & Kết nối**: Gợi ý kết bạn, danh sách bạn bè, theo dõi/hủy theo dõi (Follow/Unfollow).
*   **Khám phá & Tìm kiếm**: Trang khám phá (Explore) hiển thị xu hướng và tìm kiếm người dùng/bài viết nâng cao.
*   **Quản lý Trang cá nhân**: Chỉnh sửa thông tin cá nhân, cài đặt tài khoản, danh sách bạn thân (Close Friends), chặn người dùng (Blocked Users).
*   **Trang quản trị (Admin Panel)**: Dashboard thống kê tổng quan, quản lý danh sách người dùng, kiểm duyệt bài viết & bình luận, xử lý báo cáo (Reports) vi phạm từ cộng đồng.

---

## Cấu trúc Thư mục Dự án

Cấu trúc mã nguồn được thiết kế theo dạng **Feature-based** giúp dễ dàng mở rộng và bảo trì:

```text
src/
├── assets/          # Hình ảnh, font, và các tài nguyên tĩnh khác
├── components/      # Các component dùng chung cho toàn dự án (UI, Common, ErrorBoundary...)
├── contexts/        # React Contexts toàn cục (ví dụ: ThemeContext)
├── features/        # Các module tính năng cốt lõi (Mỗi thư mục chứa pages, components, slices riêng)
│   ├── admin/       # Trang quản trị, thống kê
│   ├── auth/        # Đăng ký, đăng nhập, phân quyền, 2FA
│   ├── explore/     # Khám phá, tìm kiếm bài viết & user
│   ├── friend/      # Quản lý bạn bè, đề xuất theo dõi
│   ├── message/     # Tin nhắn thời gian thực & cuộc gọi
│   ├── notification/# Danh sách & thông báo đẩy
│   ├── post/        # Quản lý bài viết, feeds, bình luận, lượt thích, livestream
│   ├── reel/        # Thước phim ngắn dạng video cuộn dọc
│   ├── story/       # Tin nhắn ảnh biến mất trong 24 giờ
│   └── profile/     # Trang cá nhân, cài đặt bảo mật và thông tin tài khoản
├── hooks/           # Các custom hooks dùng chung
├── layouts/         # Các khung giao diện chính (AuthLayout, MainLayout)
├── lib/             # Cấu hình thư viện bên thứ ba (Axios, Utils...)
├── store/           # Thiết lập Redux Store
├── utils/           # Định nghĩa các hằng số, helper functions và WebSocketProvider
├── App.tsx          # Router và Cấu trúc tổng thể của App
└── main.tsx         # File khởi tạo chính của dự án React
```

---

## Hướng dẫn Cài đặt & Chạy Dự án

### Yêu cầu hệ thống
*   Đã cài đặt **Node.js** (Phiên bản khuyến nghị `>= 18`)
*   Khuyên dùng **Bun** hoặc **npm** làm Package Manager.

### Các bước cài đặt:

1.  **Tải mã nguồn về máy local:**
    ```bash
    git clone <repository_url>
    cd Social_Media_Nexo_FE
    ```

2.  **Cấu hình biến môi trường (`.env`):**
    Tạo hoặc chỉnh sửa file `.env` ở thư mục gốc của dự án với các cấu hình tương tự bên dưới:
    ```env
    VITE_API_URL=https://api.nexosocial.id.vn/api
    VITE_OAUTH_AUTH_BASE_URL=https://auth.nexosocial.id.vn/realms/nexo-network/protocol/openid-connect/auth
    VITE_OAUTH_REDIRECT_URI=https://nexo.nayamishop.id.vn/auth/oauth/callback
    VITE_WS_URL=https://api.nexosocial.id.vn
    ```

3.  **Cài đặt các gói phụ thuộc (Dependencies):**
    *Nếu sử dụng Bun:*
    ```bash
    bun install
    ```
    *Nếu sử dụng NPM:*
    ```bash
    npm install
    ```

4.  **Chạy dự án ở chế độ phát triển (Development Mode):**
    *Nếu sử dụng Bun:*
    ```bash
    bun dev
    ```
    *Nếu sử dụng NPM:*
    ```bash
    npm run dev
    ```
    Sau khi chạy, ứng dụng sẽ khả dụng tại: `http://localhost:5173` (hoặc cổng được hiển thị trong terminal).

5.  **Build dự án cho Production:**
    ```bash
    # Sử dụng Bun
    bun run build
    
    # Sử dụng NPM
    npm run build
    ```
    Thư mục build sẽ được tạo ra tại `/dist`, sẵn sàng để deploy lên Vercel, Netlify hoặc Docker.

---

## Kiểm thử (Testing)
Dự án được tích hợp sẵn cấu hình kiểm thử với **Vitest**:
```bash
# Chạy bộ test
npm run test # hoặc bun test nếu có cấu hình tương đương
```

---

## Nguyên tắc hoạt động & Bảo mật của FE
1.  **JWT Authentication**: Mã truy cập (`access_token`) được lưu trữ bảo mật và gửi kèm trong HTTP Header `Authorization: Bearer <token>` thông qua cấu hình interceptor của Axios.
2.  **Token Refreshing**: Tự động gửi yêu cầu lấy token mới khi phát hiện token cũ hết hạn (Mã lỗi HTTP 401).
3.  **Bảo vệ tuyến đường (Router Guards)**:
    *   `RequireAuth`: Chỉ cho phép người dùng đã xác thực truy cập.
    *   `GuestGuard`: Ngăn người dùng đã đăng nhập quay lại các trang như đăng nhập/đăng ký.
    *   `AdminGuard`: Chỉ cho phép tài khoản có phân quyền quản trị tiếp cận Dashboard quản trị.
