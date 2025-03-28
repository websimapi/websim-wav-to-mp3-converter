import React from 'react';

// Simple placeholder Button component matching the structure used in app.js
export const Button = ({ onClick, children, className, disabled }) => {
  return (
    <button onClick={onClick} className={className} disabled={disabled}>
      {children}
    </button>
  );
};

import React from 'react';

// Simple placeholder Button component matching the structure used in app.js
// It forwards className, onClick, and disabled props to a standard HTML button.
export const Button = ({ onClick, children, className, disabled }) => {
  return (
    <button
        onClick={onClick}
        className={className} // Pass className for styling
        disabled={disabled}   // Pass disabled state
    >
      {children}
    </button>
  );
};

