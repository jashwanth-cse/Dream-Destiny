import "./LoadingSpinner.css";

function LoadingSpinner({ message = "Loading...", size = "medium", overlay = false }) {
  const spinnerContent = (
    <div className={`loading-spinner-container ${size}`}>
      <div className="loading-spinner-wrapper">
        <div className="loading-spinner-ring">
          <div className="loading-spinner-circle"></div>
          <div className="loading-spinner-circle"></div>
          <div className="loading-spinner-circle"></div>
          <div className="loading-spinner-circle"></div>
        </div>
        <div className="loading-spinner-icon">❄️</div>
      </div>
      <div className="loading-spinner-text">{message}</div>
    </div>
  );

  if (overlay) {
    return (
      <div className="loading-overlay">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
}

export default LoadingSpinner;
