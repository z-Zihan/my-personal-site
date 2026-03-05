import { motion, useAnimation } from 'framer-motion';
import { useEffect, useState } from 'react';

const BlurText = ({
  text = '',
  delay = 200,
  className = '',
  animateTo = 'visible',
  onAnimationComplete,
}) => {
  const [displayedText, setDisplayedText] = useState(text);
  const controls = useAnimation();
  const [blurredText, setBlurredText] = useState(text);

  const blurChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/\\|~`';

  useEffect(() => {
    if (animateTo === 'visible') {
      const blurInterval = setInterval(() => {
        setBlurredText(
          text
            .split('')
            .map((char, i) => {
              if (char === ' ') return ' ';
              return blurChars[Math.floor(Math.random() * blurChars.length)];
            })
            .join('')
        );
      }, 50);

      const timeout = setTimeout(() => {
        clearInterval(blurInterval);
        setBlurredText(text);
        controls.start({ opacity: 1, filter: 'blur(0px)' });
        onAnimationComplete?.();
      }, delay * text.length);

      return () => {
        clearInterval(blurInterval);
        clearTimeout(timeout);
      };
    }
  }, [text, animateTo, delay]);

  return (
    <motion.span
      className={`inline-block ${className}`}
      initial={{ opacity: 0, filter: 'blur(10px)' }}
      animate={controls}
      transition={{ duration: 0.5 }}
    >
      {blurredText}
    </motion.span>
  );
};

export default BlurText;
