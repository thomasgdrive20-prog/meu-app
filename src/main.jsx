import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
// A linha abaixo foi comentada para ignorar o erro do arquivo sumido
// import './index.css' 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)