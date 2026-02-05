import { motion, AnimatePresence } from 'framer-motion';
import { useChatContext } from '../context/ChatContext';

interface TypingIndicatorProps {
  avatarUrl?: string;
}

export function TypingIndicator({ avatarUrl }: TypingIndicatorProps) {
  const { isTyping } = useChatContext();

  return (
    <AnimatePresence>
      {isTyping && (
        <motion.div
          className="typing-indicator"
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {avatarUrl && (
            <div className="typing-indicator-avatar">
              <img src={avatarUrl} alt="Bot" />
            </div>
          )}
          <div className="typing-indicator-bubble">
            <div className="typing-dots">
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
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
