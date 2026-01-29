import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const ReadingProgressBar = () => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const updateWidth = () => {
      const scrollTop = window.pageYOffset;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      const totalScroll = docHeight - windowHeight;
      const scrollProgress = (scrollTop / totalScroll) * 100;
      setWidth(scrollProgress);
    };

    window.addEventListener('scroll', updateWidth);
    window.addEventListener('resize', updateWidth);
    return () => {
      window.removeEventListener('scroll', updateWidth);
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 h-1 bg-blue-500 z-50"
      style={{ width: `${width}%` }}
      initial={{ width: 0 }}
      animate={{ width: `${width}%` }}
      transition={{ duration: 0.2 }}
    />
  );
};

export default ReadingProgressBar;