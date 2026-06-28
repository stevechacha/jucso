import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled UI error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-jucso-slate flex items-center justify-center px-6">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
            <h1 className="font-display font-bold text-xl text-jucso-navy mb-2">Something went wrong</h1>
            <p className="text-sm text-gray-500 mb-6">
              The portal hit an unexpected error. Refresh the page or return home to continue.
            </p>
            <div className="flex flex-col gap-2">
              <Button variant="navy" full onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
              <Button variant="outline" full onClick={() => window.location.assign("/")}>
                Go Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
