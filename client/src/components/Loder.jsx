import React, { useState } from 'react';

// Option A: Brutalist Circular Spinner (Best for inside buttons)
export const BrutalistSpinner = ({ className = "" }) => {
  return (
    <div 
      className={`
        inline-block w-5 h-5 
        border-[3px] border-black/20 border-t-black 
        rounded-full animate-spin 
        ${className}
      `}
      role="status"
    />
  );
};

// Option B: Bouncing Brutalist Blocks (Alternative style)
export const BrutalistBlocksLoader = () => {
  return (
    <div className="flex items-center space-x-1">
      <div className="w-2.5 h-2.5 bg-black animate-bounce [animation-delay:-0.3s]"></div>
      <div className="w-2.5 h-2.5 bg-black animate-bounce [animation-delay:-0.15s]"></div>
      <div className="w-2.5 h-2.5 bg-black animate-bounce"></div>
    </div>
  );
};