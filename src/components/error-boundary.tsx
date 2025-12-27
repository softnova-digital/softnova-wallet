"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// Minimal error UI component to avoid importing UI components that might trigger process polyfill
function ErrorFallback({ error, onReset }: { error: Error | null; onReset: () => void }) {
  return (
    <div style={{ 
      margin: "1rem", 
      padding: "1rem", 
      border: "1px solid #ef4444", 
      borderRadius: "0.5rem",
      backgroundColor: "#fef2f2"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
        <span style={{ fontSize: "1.25rem" }}>⚠️</span>
        <h2 style={{ margin: 0, color: "#dc2626", fontSize: "1.125rem", fontWeight: 600 }}>
          Something went wrong
        </h2>
      </div>
      <p style={{ margin: "0.5rem 0", color: "#6b7280" }}>
        An unexpected error occurred. Please try refreshing the page.
      </p>
      {error && (
        <details style={{ marginBottom: "1rem" }}>
          <summary style={{ cursor: "pointer", fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.5rem" }}>
            Error details
          </summary>
          <pre style={{ 
            fontSize: "0.75rem", 
            backgroundColor: "#f3f4f6", 
            padding: "0.5rem", 
            borderRadius: "0.25rem", 
            overflow: "auto",
            margin: 0
          }}>
            {error.message}
          </pre>
        </details>
      )}
      <button
        onClick={onReset}
        style={{
          padding: "0.5rem 1rem",
          backgroundColor: "#3b82f6",
          color: "white",
          border: "none",
          borderRadius: "0.375rem",
          cursor: "pointer",
          fontSize: "0.875rem",
          fontWeight: 500
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = "#2563eb";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = "#3b82f6";
        }}
      >
        Reload Page
      </button>
    </div>
  );
}

export class ErrorBoundary extends Component<Props, State> {
  static displayName = "ErrorBoundary";

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback error={this.state.error} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}
