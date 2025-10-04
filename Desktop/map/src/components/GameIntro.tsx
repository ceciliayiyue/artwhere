import React from 'react';

export const GameIntro: React.FC = () => {
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg max-w-sm">
      <div className="space-y-2 text-gray-700">
        <p className="text-xs leading-relaxed">
          <strong>📍 GUESS WHERE IT WAS CREATED:</strong> Pin the location where the artist painted this masterpiece
        </p>
        <p className="text-xs leading-relaxed">
          <strong>📍 GUESS WHERE IT IS NOW:</strong> Pin where you think this artwork lives today
        </p>
        <p className="text-xs leading-relaxed">
          <strong>🚢 LEARN THE JOURNEY:</strong> Discover the amazing story behind the art!
        </p>
      </div>
    </div>
  );
};
