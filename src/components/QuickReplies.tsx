import { motion } from 'framer-motion';
import { useChatContext } from '../context/ChatContext';
import type { QuickReply } from '../types';

interface QuickRepliesProps {
  replies: QuickReply[];
}

export function QuickReplies({ replies }: QuickRepliesProps) {
  const { sendQuickReply } = useChatContext();

  return (
    <motion.div 
      className="quick-replies"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      {replies.map((reply, index) => (
        <motion.button
          key={reply.payload}
          className="quick-reply-btn"
          onClick={() => sendQuickReply(reply.payload, reply.title)}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {reply.title}
        </motion.button>
      ))}
    </motion.div>
  );
}
