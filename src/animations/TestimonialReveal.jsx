import React from 'react';
import { motion } from 'framer-motion';

export default function TestimonialReveal({ testimonials }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {testimonials.map((t, i) => (
        <motion.blockquote
          key={t.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.3, duration: 0.6, ease: 'easeOut' }}
          className="p-6 rounded border bg-gray-50 text-gray-900"
        >
          <p>"{t.comment}"</p>
          <footer className="mt-2 text-sm font-semibold">- {t.name}</footer>
        </motion.blockquote>
      ))}
    </div>
  );
}
