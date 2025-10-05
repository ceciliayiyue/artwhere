import React from 'react';
import logoImage from '../assets/logo_cropped.png';

export const Header: React.FC = () => {
  return (
    <div className="flex justify-center -mt-4 sm:-mt-8 -mb-4 sm:-mb-8">
      <img 
        src={logoImage} 
        alt="ART, WHERE?" 
        style={{ width: '20%', minWidth: '120px', height: 'auto', padding: '40px' }}
      />
    </div>
  );
};
