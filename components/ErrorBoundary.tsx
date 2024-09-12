import React, { useState, ReactNode } from 'react';
import { View, Text, Button } from 'react-native';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: (error: Error) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// This is the class component that actually catches the errors
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // You can log the error here
    console.log('Error caught by boundary:', error, errorInfo);
    // If you're using an error logging service, you would send the error here
    // For example: Sentry.captureException(error);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback(this.state.error!);
    }

    return this.props.children;
  }
}

// This is a functional wrapper around our class error boundary
export const ErrorBoundaryWrapper: React.FC<ErrorBoundaryProps> = ({ children, fallback }) => {
  return (
    <ErrorBoundary fallback={fallback}>
      {children}
    </ErrorBoundary>
  );
};