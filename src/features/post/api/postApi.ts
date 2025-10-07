import { api } from '@/lib/axios';
import type {
  CreatePostRequest,
  CreatePostResponse,
  UpdatePostRequest,
  UpdatePostResponse,
  GetPostsRequest,
  GetPostsResponse,
  TogglePostActiveResponse,
  DeletePostResponse,
  CreateCommentRequest,
  CreateCommentResponse,
  LikePostRequest,
  LikePostResponse,
  BookmarkPostRequest,
  BookmarkPostResponse,
  GetMutualFollowersRequest,
  GetMutualFollowersResponse,
  GetMutualFollowersApiResponse,
} from '../types';

// Create post API
export const createPost = async (
  files: File[],
  postData: CreatePostRequest
): Promise<CreatePostResponse> => {
  try {
    const formData = new FormData();
    
    // Append each file with the same key name 'files'
    // Backend will receive as array: files = [file1, file2, file3]
    files.forEach((file) => {
      formData.append('files', file);
    });
    
    formData.append('postRequestDTO', JSON.stringify(postData));
    
    const response = await api.post<CreatePostResponse>('/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      throw new Error(apiError.response?.data?.message || 'Có lỗi xảy ra khi tạo bài viết');
    }
    
    throw new Error('Không thể kết nối đến server. Vui lòng thử lại.');
  }
};

// Get posts list API - only for specific user
export const getPosts = async (params: GetPostsRequest): Promise<GetPostsResponse> => {
  try {
    const { userId, pageNo = 0, pageSize = 10 } = params;
    
    const response = await api.get<{ status: number; message: string; data: GetPostsResponse }>(`/posts/users/${userId}`, {
      params: {
        pageNo,
        pageSize,
      },
    });
    return response.data.data;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      throw new Error(apiError.response?.data?.message || 'Có lỗi xảy ra khi tải danh sách bài viết');
    }
    
    throw new Error('Không thể kết nối đến server. Vui lòng thử lại.');
  }
};

// Update post API
export const updatePost = async (
  files: File[],
  postData: UpdatePostRequest
): Promise<UpdatePostResponse> => {
  try {
    const formData = new FormData();
    
    // Append each file with the same key name 'files'
    // Backend will receive as array: files = [file1, file2, file3]
    files.forEach((file) => {
      formData.append('files', file);
    });
    
    formData.append('postRequestDTO', JSON.stringify(postData));
    
    const response = await api.put<UpdatePostResponse>('/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      throw new Error(apiError.response?.data?.message || 'Có lỗi xảy ra khi cập nhật bài viết');
    }
    
    throw new Error('Không thể kết nối đến server. Vui lòng thử lại.');
  }
};

// Toggle post active status API
export const togglePostActive = async (postId: number): Promise<TogglePostActiveResponse> => {
  try {
    const response = await api.patch<TogglePostActiveResponse>(`/posts/${postId}`);
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      throw new Error(apiError.response?.data?.message || 'Có lỗi xảy ra khi thay đổi trạng thái bài viết');
    }
    
    throw new Error('Không thể kết nối đến server. Vui lòng thử lại.');
  }
};

// Delete post API
export const deletePost = async (postId: number): Promise<DeletePostResponse> => {
  try {
    const response = await api.delete<DeletePostResponse>(`/posts/${postId}`);
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      throw new Error(apiError.response?.data?.message || 'Có lỗi xảy ra khi xóa bài viết');
    }
    
    throw new Error('Không thể kết nối đến server. Vui lòng thử lại.');
  }
};

// Like/Unlike post API
export const likePost = async (postId: string): Promise<LikePostResponse> => {
  try {
    const response = await api.post<LikePostResponse>(`/posts/${postId}/like`);
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      throw new Error(apiError.response?.data?.message || 'Có lỗi xảy ra khi thích bài viết');
    }
    
    throw new Error('Không thể kết nối đến server. Vui lòng thử lại.');
  }
};

// Bookmark/Unbookmark post API
export const bookmarkPost = async (postId: string): Promise<BookmarkPostResponse> => {
  try {
    const response = await api.post<BookmarkPostResponse>(`/posts/${postId}/bookmark`);
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      throw new Error(apiError.response?.data?.message || 'Có lỗi xảy ra khi lưu bài viết');
    }
    
    throw new Error('Không thể kết nối đến server. Vui lòng thử lại.');
  }
};

// Create comment API
export const createComment = async (commentData: CreateCommentRequest): Promise<CreateCommentResponse> => {
  try {
    const response = await api.post<CreateCommentResponse>(`/posts/${commentData.postId}/comments`, {
      content: commentData.content,
      parentId: commentData.parentId,
    });
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      throw new Error(apiError.response?.data?.message || 'Có lỗi xảy ra khi tạo bình luận');
    }
    
    throw new Error('Không thể kết nối đến server. Vui lòng thử lại.');
  }
};

// Get mutual followers API
export const getMutualFollowers = async (params: GetMutualFollowersRequest = {}): Promise<GetMutualFollowersResponse> => {
  try {
    const { pageNo = 0, pageSize = 10 } = params;
    
    const response = await api.get<GetMutualFollowersApiResponse>('/users/mutuals', {
      params: {
        pageNo,
        pageSize,
      },
    });
    return response.data.data;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      throw new Error(apiError.response?.data?.message || 'Có lỗi xảy ra khi tải danh sách bạn bè chung');
    }
    
    throw new Error('Không thể kết nối đến server. Vui lòng thử lại.');
  }
};
