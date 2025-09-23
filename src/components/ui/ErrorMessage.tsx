'use client';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  title?: string;
}

export default function ErrorMessage({ 
  message, 
  onRetry, 
  title = "حدث خطأ" 
}: ErrorMessageProps) {
  return (
    <div className="error-container">
      <div className="error-icon">⚠️</div>
      <h2 className="error-title">{title}</h2>
      <p className="error-message">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="retry-button">
          إعادة المحاولة
        </button>
      )}
    </div>
  );
}