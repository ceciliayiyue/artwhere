import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../contexts/GameContext';

export const InstructionsPanel: React.FC = () => {
  return (
    <div className="py-4 sm:py-6 flex justify-center">
      <div className="w-full md:w-[75%] p-4 sm:p-6">
        <h3 className="text-2xl sm:text-3xl font-fraunces mb-2 sm:mb-3 tracking-tight uppercase text-center">
          <span className="font-bold bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 bg-clip-text text-transparent drop-shadow-lg">
            ART
          </span>
          <span className="text-purple-primary font-bold">, </span>
          <span className="inline-block font-extrabold italic bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent drop-shadow-lg" style={{ transform: 'rotate(-2deg)' }}>
            WHERE
          </span>
          <span className="text-pink-400 font-extrabold italic">?</span>
        </h3>
        <ol className="space-y-2 text-sm sm:text-base font-outfit">
          <li className="flex items-center">
            <span className="text-white rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0 font-black text-sm sm:text-base" style={{ backgroundColor: '#A0826D' }}>
              1
            </span>
            <span className="font-medium text-gray-800">Drop the <strong className="text-amber-700 font-bold">light brown pin</strong> where you think the painting was created</span>
          </li>
          <li className="flex items-center">
            <span className="text-white rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0 font-black text-sm sm:text-base" style={{ backgroundColor: '#8B6F47' }}>
              2
            </span>
            <span className="font-medium text-gray-800">Drop the <strong className="text-yellow-800 font-bold">dark brown pin</strong> where you think the painting is located now</span>
          </li>
          <li className="flex items-center">
            <span className="bg-green-500 text-white rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0 font-black text-sm sm:text-base">
              3
            </span>
            <span className="font-medium text-gray-800">Click Submit to check your answers</span>
          </li>
        </ol>
      </div>
    </div>
  );
};
