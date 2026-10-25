import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { CashFlowProvider } from './context/CashFlowContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <CashFlowProvider>
        <App />
      </CashFlowProvider>
    </AuthProvider>
  </StrictMode>,
)
