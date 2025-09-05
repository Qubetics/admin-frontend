import { Suspense } from 'react';
import './App.css';
import './index.scss';
import { RouterProvider } from 'react-router-dom';
import router from './Routing/Routes';
import ErrorBoundary from './ErrorBoundary/ErrorBoundary';

function AppContent() {
  return <RouterProvider router={router} />;
}

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div>Loading...</div>}>
        <AppContent />
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
