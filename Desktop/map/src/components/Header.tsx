import React from 'react';
import logoImage from '../assets/logo.png';

export const Header: React.FC = () => {
  return (
    <div className="flex justify-center -mt-4 sm:-mt-8 -mb-4 sm:-mb-8">
      <img 
        src={logoImage} 
        alt="ART, WHERE?" 
        className="h-48 sm:h-80 w-auto drop-shadow-lg hover:scale-105 transition-transform duration-300" 
      />
    </div>
  );
};
