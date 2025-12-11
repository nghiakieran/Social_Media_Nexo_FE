import React, { useState } from 'react';
import { useAppDispatch } from '../../../store';
import { createCollectionWithPosts } from '../savedSlice';
import { CreateCollectionStep1 } from './CreateCollectionStep1';
import { CreateCollectionStep2 } from './CreateCollectionStep2';
import { CreateCollectionStep3 } from './CreateCollectionStep3';

interface CreateCollectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onViewCollection?: (collectionId: string) => void;
}

type CreateStep = 'name' | 'select-posts' | 'complete' | null;

export const CreateCollectionDialog: React.FC<CreateCollectionDialogProps> = ({
  isOpen,
  onClose,
  onViewCollection,
}) => {
  const dispatch = useAppDispatch();
  const [currentStep, setCurrentStep] = useState<CreateStep>(null);
  const [collectionName, setCollectionName] = useState('');
  const [createdCollectionId, setCreatedCollectionId] = useState<string>('');

  const handleStep1Complete = (name: string) => {
    setCollectionName(name);
    setCurrentStep('select-posts');
  };

  const handleStep2Complete = (selectedPostIds: string[]) => {
    const action = createCollectionWithPosts({
      collection: {
        name: collectionName,
      },
      selectedPostIds,
    });
    
    dispatch(action);
    
    // Get the created collection ID (we'll generate it here since we know the timestamp)
    const collectionId = `collection-${Date.now()}`;
    setCreatedCollectionId(collectionId);
    setCurrentStep('complete');
  };

  const handleBack = () => {
    if (currentStep === 'select-posts') {
      setCurrentStep('name');
    } else if (currentStep === 'complete') {
      setCurrentStep('select-posts');
    }
  };

  const handleViewCollection = () => {
    if (onViewCollection && createdCollectionId) {
      onViewCollection(createdCollectionId);
    }
    handleClose();
  };

  const handleClose = () => {
    setCurrentStep(null);
    setCollectionName('');
    setCreatedCollectionId('');
    onClose();
  };

  // Show step 1 when dialog opens
  if (isOpen && currentStep === null) {
    setCurrentStep('name');
  }

  if (!isOpen) return null;

  if (currentStep === 'name') {
    return (
      <CreateCollectionStep1
        onNext={handleStep1Complete}
        onClose={handleClose}
      />
    );
  }

  if (currentStep === 'select-posts') {
    return (
      <CreateCollectionStep2
        collectionName={collectionName}
        onBack={handleBack}
        onComplete={handleStep2Complete}
        onClose={handleClose}
      />
    );
  }

  if (currentStep === 'complete') {
    return (
      <CreateCollectionStep3
        collectionId={createdCollectionId}
        onBack={handleBack}
        onViewCollection={handleViewCollection}
        onClose={handleClose}
      />
    );
  }

  return null;
};
