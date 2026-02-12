import React, { useState } from 'react';
import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  className = '',
  type = 'text',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="input-wrapper">
      {label && (
        <label className="input-label">
          {label}
        </label>
      )}
      
      <div className={`input-container ${error ? 'input-container--error' : ''} ${isFocused ? 'input-container--focused' : ''}`}>
        {icon && <span className="input-icon">{icon}</span>}
        <input
          type={type}
          className={`input ${className}`}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
      </div>
      
      {error && (
        <span className="input-error">
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;