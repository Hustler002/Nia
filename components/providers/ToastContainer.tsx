'use client';

import { useToastStore } from '@/lib/stores/useToastStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[1000] flex flex-col gap-2 items-center pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`pointer-events-auto px-5 py-3 rounded-2xl shadow-xl text-sm font-medium flex items-center gap-2 backdrop-blur-sm border ${
              toast.type === 'success'
                ? 'bg-white/95 border-green-200 text-[#0F1111]'
                : toast.type === 'error'
                  ? 'bg-red-50/95 border-red-200 text-red-700'
                  : 'bg-white/95 border-gray-200 text-[#0F1111]'
            }`}
          >
            {toast.type === 'success' && <span>✅</span>}
            {toast.type === 'error' && <span>❌</span>}
            {toast.type === 'info' && <span>ℹ️</span>}
            <span>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-2 text-gray-400 hover:text-gray-600 text-xs"
            >
              ✕
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
