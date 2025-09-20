import React, { useEffect, useRef } from 'react';
import { Button } from '../ui/button';

export interface ActionMenuItem {
  label: string;
  action: () => void;
  isDestructive?: boolean;
  href?: string;
}

interface ActionMenuProps {
  isOpen: boolean;
  onClose: () => void;
  items: ActionMenuItem[];
  position?: {
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
  };
  className?: string;
}

export const ActionMenu: React.FC<ActionMenuProps> = ({
  isOpen,
  onClose,
  items,
  position,
  className = ''
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80]"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      />
      
      {/* Menu */}
      <div 
        ref={menuRef}
        className={`fixed bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden z-[81] w-full max-w-md ${className}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        style={position ? {
          top: position.top || 'auto',
          left: position.left || 'auto',
          right: position.right || 'auto',
          bottom: position.bottom || 'auto',
          transform: position.top && position.left ? 'translate(-50%, -50%)' : 'none'
        } : {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        <div className="flex flex-col">
          {items.map((item, index) => (
            <React.Fragment key={index}>
              {item.href ? (
                <a
                  href={item.href}
                  className={`px-6 py-4 text-center text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
                    item.isDestructive 
                      ? 'text-red-600 dark:text-red-400' 
                      : 'text-gray-900 dark:text-gray-100'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    item.action();
                    onClose();
                  }}
                >
                  {item.label}
                </a>
              ) : (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    item.action();
                    onClose();
                  }}
                  className={`px-6 py-4 text-center text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
                    item.isDestructive 
                      ? 'text-red-600 dark:text-red-400' 
                      : 'text-gray-900 dark:text-gray-100'
                  }`}
                >
                  {item.label}
                </button>
              )}
              {index < items.length - 1 && (
                <div className="border-t border-gray-200 dark:border-gray-700" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </>
  );
};
