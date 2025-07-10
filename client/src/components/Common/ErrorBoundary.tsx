import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log error to monitoring service if needed
    // console.error(error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-red-50">
          <h1 className="text-3xl font-bold text-red-700 mb-2">Something went wrong.</h1>
          <p className="text-lg text-red-600 mb-4">{this.state.error?.message || 'An unexpected error occurred.'}</p>
          <button
            className="bg-red-700 text-white px-6 py-2 rounded font-bold hover:bg-red-800 transition"
            onClick={this.handleReload}
            aria-label="Reload the page"
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary; 