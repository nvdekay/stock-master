import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import '@fortawesome/fontawesome-free/css/all.min.css';
import App from './App.jsx'
import { AuthProvider } from './auth/AuthProvider.jsx'
import { CartProvider } from "./contexts/CartContext";
import { PurchaseProvider } from './contexts/PurchaseContext.jsx';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <PurchaseProvider>
          <App />
        </PurchaseProvider>
      </CartProvider>
    </AuthProvider>
  </StrictMode>,
)
