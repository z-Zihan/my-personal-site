import { motion } from 'framer-motion'

export default function ShinyText({ text, className = '', duration = 2 }: { text: string; className?: string; duration?: number }) {
  return (
    <span className={`relative inline-block ${className}`}>
      <motion.span
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent z-10"
        initial={{ x: '-100%', opacity: 0 }}
        animate={{
          x: '100%',
          opacity: [0, 0.8, 0]
        }}
        transition={{
          duration,
          repeat: Infinity,
          repeatDelay: 3,
          ease: 'easeInOut'
        }}
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)'
        }}
      />
      <span className="bg-gradient-to-r from-white via-pink-200 to-white bg-clip-text text-transparent">
        {text}
      </span>
    </span>
  )
}
