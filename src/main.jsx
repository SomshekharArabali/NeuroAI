import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Toaster } from 'react-hot-toast'; // Import Toaster

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Toaster /> {/* Add Toaster component here */}
  </StrictMode>,
)