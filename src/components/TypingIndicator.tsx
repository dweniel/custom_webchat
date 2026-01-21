import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatContext } from '../context/ChatContext';

export function TypingIndicator() {
  const { isTyping } = useChatContext();

  return (
    <AnimatePresence>
      {isTyping && (
        <motion.div
          className="typing-indicator"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <div className="typing-indicator-bubble">
            <motion.span
              className="typing-dot"
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
            />
            <motion.span
              className="typing-dot"
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }}
            />
            <motion.span
              className="typing-dot"
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
