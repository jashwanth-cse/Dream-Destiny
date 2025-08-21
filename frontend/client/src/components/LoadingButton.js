import React from 'react';
import './LoadingButton.css';

/**
 * Reusable Loading Button Component
 * @param {object} props - Component props
 * @param {boolean} props.isLoading - Loading state
 * @param {string} props.loadingText - Text to show when loading
 * @param {string} props.children - Button content when not loading
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.variant - Button variant (primary, secondary, danger, success)
 * @param {string} props.size - Button size (small, medium, large)
 * @param {boolean} props.disabled - Disabled state
 * @param {function} props.onClick - Click handler
 * @param {string} props.type - Button type
 * @param {object} props.style - Inline styles
 * @param {string} props.loadingIcon - Custom loading icon
 */
const LoadingButton = ({
  isLoading = false,
  loadingText = 'Loading...',
  children,
  className = '',
  variant = 'primary',
  size = 'medium',
  disabled = false,
  onClick,
  type = 'button',
  style = {},
  loadingIcon = null,
  ...props
}) => {
  const handleClick = (e) => {
    if (!isLoading && !disabled && onClick) {
      onClick(e);
    }
  };

  const getVariantClass = () => {
    switch (variant) {
      case 'secondary':
        return 'loading-btn-secondary';
      case 'danger':
        return 'loading-btn-danger';
      case 'success':
        return 'loading-btn-success';
      case 'outline':
        return 'loading-btn-outline';
      case 'ghost':
        return 'loading-btn-ghost';
      default:
        return 'loading-btn-primary';
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'small':
        return 'loading-btn-small';
      case 'large':
        return 'loading-btn-large';
      default:
        return 'loading-btn-medium';
    }
  };

  const renderLoadingIcon = () => {
    if (loadingIcon) {
      return <span className="loading-btn-custom-icon">{loadingIcon}</span>;
    }
    
    return (
      <div className="loading-btn-spinner">
        <div className="loading-btn-spinner-ring">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    );
  };

  return (
    <button
      type={type}
      className={`
        loading-btn 
        ${getVariantClass()} 
        ${getSizeClass()} 
        ${isLoading ? 'loading-btn-loading' : ''} 
        ${disabled ? 'loading-btn-disabled' : ''}
        ${className}
      `.trim()}
      disabled={disabled || isLoading}
      onClick={handleClick}
      style={style}
      {...props}
    >
      <div className="loading-btn-content">
        {isLoading && (
          <div className="loading-btn-loading-content">
            {renderLoadingIcon()}
            <span className="loading-btn-loading-text">{loadingText}</span>
          </div>
        )}
        
        <div className={`loading-btn-default-content ${isLoading ? 'loading-btn-hidden' : ''}`}>
          {children}
        </div>
      </div>
      
      {/* Ripple effect */}
      <div className="loading-btn-ripple"></div>
    </button>
  );
};

export default LoadingButton;
