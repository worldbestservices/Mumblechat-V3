import { Buffer } from 'buffer';
window.Buffer = Buffer;

import ReactDOM from 'react-dom/client'
import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

import { Toaster } from 'react-hot-toast';

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
      <Toaster position="top-center" reverseOrder={false} />
    </BrowserRouter>
  </StrictMode>
);