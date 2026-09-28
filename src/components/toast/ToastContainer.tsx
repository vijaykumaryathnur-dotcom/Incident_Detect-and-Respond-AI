import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { ToastNotification } from './ToastNotification';
import { P1ToastData } from '../../types/toast';

interface ToastContainerProps {
  toasts: P1ToastData[];
  onDismiss: (id: string) => void;
  onInspect: (incidentId: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onDismiss,
  onInspect,
}) => {
  return (
    <div 
      className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none max-w-md w-full px-4 sm:px-0"
      aria-label="Notifications"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastNotification
            key={toast.id}
            toast={toast}
            onDismiss={onDismiss}
            onInspect={onInspect}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
