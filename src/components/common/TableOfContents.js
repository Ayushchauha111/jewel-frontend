import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiList } from 'react-icons/fi';

const TableOfContents = ({ headings }) => {
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '0% 0% -80% 0%', threshold: 0.1 }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      headings.forEach((heading) => {
        const element = document.getElementById(heading.id);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [headings]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center mb-4 text-gray-700">
        <FiList className="mr-2" />
        <h3 className="font-semibold">Table of Contents</h3>
      </div>
      <ul className="space-y-2">
        {headings.map((heading) => (
          <li key={heading.id}>
            <motion.a
              whileHover={{ x: 4 }}
              href={`#${heading.id}`}
              className={`block text-sm ${heading.level === 'h3' ? 'pl-4' : ''} ${
                activeId === heading.id
                  ? 'text-blue-600 font-medium'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {heading.text}
            </motion.a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TableOfContents;