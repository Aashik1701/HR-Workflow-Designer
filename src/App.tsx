import { Toaster } from 'react-hot-toast';
import { Router } from './router';

export default function App() {
  return (
    <>
      <Router />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1a1a2e',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#8b5cf6', secondary: '#fff' } },
        }}
      />
    </>
  );
}
