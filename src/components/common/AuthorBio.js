import { motion } from 'framer-motion';

const AuthorBio = ({ author }) => {
  return (
    <motion.div 
      className="bg-gray-50 p-6 rounded-lg border border-gray-200"
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-4">
          <img
            className="h-16 w-16 rounded-full object-cover"
            src={author.avatar}
            alt={author.name}
          />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">About {author.name}</h3>
          <p className="text-gray-600 mt-1">{author.bio}</p>
          <div className="mt-3 flex space-x-4">
            {author.twitter && (
              <a
                href={`https://twitter.com/${author.twitter}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700"
              >
                Twitter
              </a>
            )}
            {author.website && (
              <a
                href={author.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700"
              >
                Website
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AuthorBio;