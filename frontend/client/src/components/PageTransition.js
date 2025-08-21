import { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';
import './PageTransition.css';

function PageTransition({
  children,
  isLoading = false,
  loadingMessage = "Loading...",
  transitionType = "fade",
  duration = 300
}) {
  const [showContent, setShowContent] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setShowContent(true);
        setIsTransitioning(false);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
      setIsTransitioning(false);
    }
  }, [isLoading]);

  if (isLoading) {
    return <LoadingSpinner message={loadingMessage} overlay={true} />;
  }

  const getTransitionClass = () => {
    switch (transitionType) {
      case 'slide-up':
        return 'page-transition-slide-up';
      case 'slide-down':
        return 'page-transition-slide-down';
      case 'slide-left':
        return 'page-transition-slide-left';
      case 'slide-right':
        return 'page-transition-slide-right';
      case 'scale':
        return 'page-transition-scale';
      case 'rotate':
        return 'page-transition-rotate';
      default:
        return 'page-transition-fade';
    }
  };

  return (
    <div
      className={`
        page-transition-container
        ${getTransitionClass()}
        ${showContent ? 'page-transition-visible' : 'page-transition-hidden'}
        ${isTransitioning ? 'page-transition-transitioning' : ''}
      `}
      style={{ '--transition-duration': `${duration}ms` }}
    >
      {children}
    </div>
  );
}

export default PageTransition;
