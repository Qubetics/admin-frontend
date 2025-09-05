import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/Logo.svg';
import './ErrorBoundary.scss';
import Path from '../Routing/Constant/RoutePaths';
import ButtonCustom from '../Common/ButtonCustom/ButtonCustom';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error | null) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error);
      }
      
      return (
        <div className="errorBoundary">
          <img src={Logo} alt="Logo" />
          <div className="errorBoundary_content">
            <h4>Oops! Unexpected error</h4>
            <h6>Something went wrong...</h6>
            <p>{this.state.error?.message || 'An error occurred.'}</p>
            <ButtonCustom 
              label="Return home" 
              onClick={() => window.location.href = Path.DASHBOARD} 
            />
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Export a hook version for functional components
export function useErrorHandler() {
  const navigate = useNavigate();
  
  return (error: Error) => {
    console.error('Error caught by useErrorHandler:', error);
    // You can add error reporting here
    navigate('/error', { state: { error: error.message } });
  };
}
