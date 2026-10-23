import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon } from 'lucide-react';

interface DetailDrawerProps {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function DetailDrawer({ open, title, subtitle, onClose, actions, children }: DetailDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ?
      <div className="fixed inset-0 z-40 flex justify-end">
          <motion.div
          className="absolute inset-0 bg-brand-950/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
          onClick={onClose} />
        
          <motion.aside
          role="dialog"
          aria-modal="true"
          aria-label={title}
          initial={{ x: 32, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 24, opacity: 0 }}
          transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
          className="relative z-10 flex h-full w-full max-w-xl flex-col border-l border-line bg-white shadow-pop">
          
            <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
              <div className="min-w-0">
                <h3 className="truncate text-base font-semibold text-ink">{title}</h3>
                {subtitle ? <p className="mt-0.5 truncate text-xs text-ink-muted">{subtitle}</p> : null}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {actions}
                <button
                type="button"
                onClick={onClose}
                aria-label="Close details"
                className="rounded p-1 text-ink-soft transition-colors duration-150 hover:bg-canvas hover:text-ink">
                
                  <XIcon size={16} aria-hidden="true" />
                </button>
              </div>
            </header>
            <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
          </motion.aside>
        </div> :
      null}
    </AnimatePresence>);

}