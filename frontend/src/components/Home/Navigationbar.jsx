import React from 'react';
import { Link } from 'react-router-dom';
import './navigation.css';

const Navigationbar = () => {
  return (
  <nav className="navbar bg-black/10 backdrop-blur-lg p-4 z-190 fixed top-0 left-0 right-0 w-full">
      <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center px-2 sm:px-4">
        {/* Navigation Links on the left */}
        <div className="flex items-center space-x-2 sm:space-x-4 mb-2 sm:mb-0">
          <Link to="/" className="text-xl sm:text-2xl font-bold text-white hover:text-gray-200">Foodgram</Link>
        </div>

        {/* Links on the right */}
        <div className="flex flex-wrap items-center space-x-3 sm:space-x-6 text-base sm:text-lg z-20">
          <Link to="/about" className="text-white hover:text-gray-300">About</Link>
          <Link to="/help" className="text-white hover:text-gray-300">Help</Link>
          <Link to="/connect" className="text-white hover:text-gray-300">Connect</Link>
          <Link to="/user/register" className= "text-white hover:text-gray-300 font-bold text-lg sm:text-xl">login</Link>
        </div>
      </div>
    </nav>
  );  
}

export default Navigationbar;