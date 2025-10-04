import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../contexts/GameContext';
import { getStoryImage } from '../utils/storyImageHelper';

export const StoryPanel: React.FC = () => {
  const { gameState, result, painting } = useGame();

  const shouldShow = gameState === 'submitted' && result && (!result.createdCorrect || !result.currentCorrect);

  // Get dynamic emoji based on story content
  const storyImage = getStoryImage(painting?.story);

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent z-40 pb-24"
        >
          <div className="max-w-4xl mx-auto px-6 py-6">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200"
            >
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3">
                <h3 className="text-white font-bold text-lg flex items-center">
                  <svg
                    className="w-6 h-6 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  The Story Behind This Painting
                </h3>
              </div>

              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    {painting?.storyImageUrl ? (
                      <div className="w-32 h-32 rounded-lg overflow-hidden">
                        <img
                          src={painting.storyImageUrl}
                          alt="Story illustration"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className={`w-32 h-32 bg-gradient-to-br ${storyImage.backgroundColor} rounded-lg flex items-center justify-center`}>
                        <span className="text-6xl" role="img" aria-label={storyImage.altText}>
                          {storyImage.emoji}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-700 leading-relaxed">
                        {painting?.story || (
                          <span className="italic text-gray-500">
                            [This is a placeholder for the painting's story. The story will explain
                            the journey of this artwork - where it was created, significant events
                            in its history, how it moved from place to place, and where it resides
                            today. This could include details about theft, sales, donations, wars,
                            or other historical events that affected the painting's location.]
                          </span>
                        )}
                      </p>
                    </div>

                    {!result?.createdCorrect && painting?.createdLocation.name && (
                      <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                        <p className="text-sm text-blue-800">
                          <strong>Created in:</strong> {painting.createdLocation.name}
                        </p>
                      </div>
                    )}

                    {!result?.currentCorrect && painting?.currentLocation.name && (
                      <div className="mt-2 p-3 bg-red-50 border-l-4 border-red-500 rounded">
                        <p className="text-sm text-red-800">
                          <strong>Currently located in:</strong> {painting.currentLocation.name}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
