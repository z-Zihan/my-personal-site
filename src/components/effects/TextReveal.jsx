import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

export default function TextReveal({ text, className = '' }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  })

  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1])
  const y = useTransform(scrollYProgress, [0, 0.5], [50, 0])

  const words = text.split(' ')

  return (
    <motion.h1
      ref={ref}
      className={`text-5xl md:text-7xl font-bold text-white mb-6 ${className}`}
      style={{ opacity, y }}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{
            delay: i * 0.1,
            duration: 0.6,
            ease: 'easeOut'
          }}
          className="inline-block mr-2"
        >
          {word}
        </motion.span>
      ))}
    </motion.h1>
  )
}
