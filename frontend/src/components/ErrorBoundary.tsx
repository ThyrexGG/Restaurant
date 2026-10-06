import React from 'react';

interface State {
  hasError: boolean;
}

// Catches render errors so one broken component shows a message instead of a blank white page.
export default class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    console.error('Unhandled UI error:', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div role="alert" className="min-h-screen bg-[#05080f] text-white flex flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="text-gray-400 max-w-md">The page hit an unexpected problem. Reloading usually fixes it. Any order already sent is safe.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-6 py-3 rounded-xl bg-yellow-300 text-black font-bold"
        >
          Reload page
        </button>
      </div>
    );
  }
}
