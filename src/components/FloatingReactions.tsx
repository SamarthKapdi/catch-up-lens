import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePredictionStore } from '../store/usePredictionStore';

export const FloatingReactions: React.FC = () => {
  const { floatingReactions, removeReaction } = usePredictionStore();

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {floatingReactions.map((reaction) => (
          <motion.div
            key={reaction.id}
            initial={{ opacity: 1, y: '85vh', scale: 0.6 }}
            animate={{ opacity: 0, y: '20vh', scale: 1.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.2, ease: 'easeOut' }}
            onAnimationComplete={() => removeReaction(reaction.id)}
            style={{ left: `${reaction.x}%` }}
            className="absolute text-3xl sm:text-4xl select-none filter drop-shadow-lg"
          >
            {reaction.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
