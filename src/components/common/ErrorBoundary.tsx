import { Component, ReactNode } from "react";
import { ErrorDisplay } from "./ErrorDisplay";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    // Log error to monitoring service if needed
    // For now, just output to console to avoid unused variable error
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorDisplay
          title="Component Error"
          message={this.state.error?.message || "An unexpected error occurred."}
          onRetry={this.handleRetry}
        />
      );
    }
    return this.props.children;
  }
}
