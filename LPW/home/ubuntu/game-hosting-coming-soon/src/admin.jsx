import React from 'react'
import ReactDOM from 'react-dom/client'
import AdminPanel from './AdminPanel.jsx'
import './App.css'

ReactDOM.createRoot(document.getElementById('admin-root')).render(
  <React.StrictMode>
    <AdminPanel />
  </React.StrictMode>,
)

