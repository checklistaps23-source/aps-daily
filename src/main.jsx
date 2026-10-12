import { Component, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Si l'app plante, on affiche un message et on recharge la page toute seule
// (important pour la TV du garage : plus d'écran gris à rafraichir a la main).
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(error) {
    console.error('Erreur app:', error)
    setTimeout(() => window.location.reload(), 5000)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{background:'#0D0F14',color:'#F0F2F7',minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',fontFamily:'sans-serif',textAlign:'center',padding:'24px'}}>
          <div style={{fontSize:'48px',marginBottom:'12px'}}>⚠️</div>
          <div style={{fontSize:'20px',fontWeight:'700',marginBottom:'8px'}}>Un probleme est survenu</div>
          <div style={{color:'#8B90A0'}}>Rechargement automatique dans quelques secondes...</div>
        </div>
      )
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
