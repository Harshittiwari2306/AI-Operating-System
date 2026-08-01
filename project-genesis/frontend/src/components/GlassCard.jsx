import React from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({ children, className = '', onClick, hover = true, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay }}
      whileHover={hover ? { y: -4, borderColor: 'rgba(159, 122, 234, 0.3)', boxShadow: '0 12px 30px rgba(159, 122, 234, 0.08)' } : {}}
      onClick={onClick}
      className={`glass-panel rounded-2xl p-6 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
