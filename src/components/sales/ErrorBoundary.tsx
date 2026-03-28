"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import gsap from "gsap";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  name?: string;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-[200px] w-full flex items-center justify-center p-8 rounded-3xl bg-red-500/5 border border-red-500/10 backdrop-blur-sm self-healing-container h-full">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center text-red-500 mb-6 mx-auto border border-red-500/20">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="font-syne font-extrabold text-white text-xl uppercase italic tracking-tight mb-2">
              System Recovery Active
            </h3>
            <p className="text-gray2 text-sm mb-6 leading-relaxed">
              We encountered a minor render issue in the {this.props.name || 'Component'}. 
              The dashboard is isolated and safe.
            </p>
            <button 
              onClick={this.handleReset}
              className="px-6 py-3 bg-red-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)]"
            >
              Restart Module
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
