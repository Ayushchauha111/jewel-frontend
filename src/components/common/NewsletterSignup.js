import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail } from 'react-icons/fi';

const NewsletterSignup = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubscribed(true);
      setEmail('');
    }, 1500);
  };

  return (
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
      <div className="max-w-2xl mx-auto">
        {isSubscribed ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h3 className="text-xl font-bold mb-2">Thanks for subscribing!</h3>
            <p>You'll receive our next newsletter in your inbox.</p>
          </motion.div>
        ) : (
          <>
            <div className="flex items-center mb-4">
              <FiMail className="mr-2 text-xl" />
              <h3 className="text-xl font-bold">Stay updated</h3>
            </div>
            <p className="mb-4 opacity-90">
              Get the latest articles and resources sent straight to your inbox.
            </p>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="flex-1 px-4 py-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  required
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLoading}
                  className="px-6 py-2 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white"
                >
                  {isLoading ? 'Subscribing...' : 'Subscribe'}
                </motion.button>
              </div>
            </form>
            <p className="mt-3 text-sm opacity-80">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default NewsletterSignup;