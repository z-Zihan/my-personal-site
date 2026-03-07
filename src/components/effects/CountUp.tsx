import { useEffect, useRef } from 'react'
import { useInView } from 'framer-motion'
import CountUp from 'react-countup'

interface CountUpNumberProps {
  end: number
  start?: number
  duration?: number
  delay?: number
  decimals?: number
  separator?: string
  prefix?: string
  suffix?: string
  className?: string
  onStart?: () => void
  onEnd?: () => void
}

export default function CountUpNumber({
  end,
  start = 0,
  duration = 2,
  delay = 0,
  decimals = 0,
  separator = ',',
  suffix = '',
  prefix = '',
  className = '',
  onStart,
  onEnd,
}: CountUpNumberProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, {
    once: true,
    margin: '-100px',
  })

  return (
    <span
      ref={ref}
      className={`${className} inline-block tabular-nums`}
      style={{ fontVariantNumeric: 'tabular-nums' }}
    >
      {isInView && (
        <CountUp
          start={start}
          end={end}
          duration={duration}
          delay={delay}
          decimals={decimals}
          separator={separator}
          prefix={prefix}
          suffix={suffix}
          onStart={onStart}
          onEnd={onEnd}
        />
      )}
    </span>
  )
}
