import { useAppDispatch, useAppSelector } from '@/store';
import { Button } from '@/components/ui/button';
import { 
  updatePostThunk, 
  togglePostActiveThunk, 
  deletePostThunk,
  clearError 
} from '../postSlice';
import { Edit, Archive, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { EditPostDialog } from './EditPostDialog';
import type { Post, UpdatePostRequest } from '../types';

interface PostActionsProps {
  post: Post;
  onEditComplete?: () => void;
}

export const PostActions = ({ post, onEditComplete }: PostActionsProps) => {
  const dispatch = useAppDispatch();
  const { error } = useAppSelector(state => state.post);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleEdit = () => {
    setShowEditDialog(true);
  };

  const handleUpdatePost = (files: File[], updateData: UpdatePostRequest) => {
    dispatch(updatePostThunk({ files, postData: updateData }))
      .unwrap()
      .then(() => {
        setShowEditDialog(false);
        onEditComplete?.();
      })
      .catch((error) => {
        console.error('Update post error:', error);
      });
  };

  const handleToggleActive = () => {
    dispatch(togglePostActiveThunk(parseInt(post.id)))
      .unwrap()
      .then(() => {
        onEditComplete?.();
      })
      .catch((error) => {
        console.error('Toggle active error:', error);
      });
  };

  const handleDelete = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) {
      dispatch(deletePostThunk(parseInt(post.id)))
        .unwrap()
        .then(() => {
          onEditComplete?.();
        })
        .catch((error) => {
          console.error('Delete post error:', error);
        });
    }
  };

  const handleCloseEditDialog = () => {
    setShowEditDialog(false);
  };

  // Clear error when component unmounts
  const handleClearError = () => {
    dispatch(clearError());
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleEdit}
          className="h-8 px-2"
        >
          <Edit className="w-4 h-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleActive}
          className="h-8 px-2"
        >
          <Archive className="w-4 h-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          className="h-8 px-2 text-red-500 hover:text-red-700"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          <div className="flex items-center justify-between">
            <span className="text-sm">{error}</span>
            <button
              onClick={handleClearError}
              className="ml-4 text-red-700 hover:text-red-900"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      {showEditDialog && (
        <EditPostDialog
          isOpen={showEditDialog}
          onClose={handleCloseEditDialog}
          postId={parseInt(post.id)}
          userId={parseInt(post.userId)}
          initialContent={post.content}
          initialVisibility={post.visibility.toUpperCase() as 'PUBLIC' | 'PRIVATE'}
          initialMediaUrl={post.media.map(m => m.url)}
          onSave={handleUpdatePost}
        />
      )}
    </>
  );
};
