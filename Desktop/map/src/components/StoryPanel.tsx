import React from 'react';
import { useGame } from '../contexts/GameContext';
import { getStoryImage } from '../utils/storyImageHelper';

export const StoryPanel: React.FC = () => {
  const { gameState, result, painting } = useGame();

  const shouldShow = gameState === 'submitted' && result && (!result.createdCorrect || !result.currentCorrect);

  // Get dynamic emoji based on story content
  const storyImage = getStoryImage(painting?.story);

  if (!shouldShow) return null;

  return (
    <div className="w-full bg-white">
      <div className="bg-white rounded-none shadow-lg overflow-hidden border-t border-gray-200">
        <div className="bg-gradient-to-r from-purple-primary to-purple-dark px-3 py-2 sm:px-6 sm:py-4">
          <h3 className="text-white font-spartan font-black text-lg sm:text-2xl flex items-center uppercase tracking-wide">
            <svg
              className="w-4 h-4 sm:w-6 sm:h-6 mr-2"
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
            <span className="hidden sm:inline">The Story Behind This Painting</span>
            <span className="sm:hidden">The Story</span>
          </h3>
        </div>

        <div className="p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
            <div className="flex-shrink-0 mx-auto sm:mx-0">
              {painting?.storyImageUrl ? (
                <div className="w-20 h-20 sm:w-32 sm:h-32 rounded-lg overflow-hidden">
                  <img
                    src={painting.storyImageUrl}
                    alt="Story illustration"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className={`w-20 h-20 sm:w-32 sm:h-32 bg-gradient-to-br ${storyImage.backgroundColor} rounded-lg flex items-center justify-center`}>
                  <span className="text-4xl sm:text-6xl" role="img" aria-label={storyImage.altText}>
                    {storyImage.emoji}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="prose prose-sm sm:prose-base max-w-none">
                <p className="text-gray-700 text-sm sm:text-lg leading-relaxed font-medium">
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
                <div className="mt-3 sm:mt-4 p-2 sm:p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                  <p className="text-xs sm:text-base text-blue-800 font-semibold">
                    <strong className="text-sm sm:text-lg">Created in:</strong> {painting.createdLocation.name}
                  </p>
                </div>
              )}

              {!result?.currentCorrect && painting?.currentLocation.name && (
                <div className="mt-2 sm:mt-3 p-2 sm:p-4 bg-red-50 border-l-4 border-red-500 rounded">
                  <p className="text-xs sm:text-base text-red-800 font-semibold">
                    <strong className="text-sm sm:text-lg">Currently located in:</strong> {painting.currentLocation.name}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
