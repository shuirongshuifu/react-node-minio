import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './assets/basic.css'
import 'antd/dist/antd.css'

import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
