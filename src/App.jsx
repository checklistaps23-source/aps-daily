

import { useState } from 'react'
import Checklist from './Checklist'
import Garage from './Garage'
import Signaler from './Signaler'
import Historique from './Historique'
import Parametres from './Parametres'
import { useVehicules } from './useVehicules'

const FLEET = {
  alpha: { name: 'ALPHA', icon: '🚑', vehicles: ['Alpha 1','Alpha 2','Alpha 3','Alpha 4','Alpha 5','Alpha 6','Alpha 7'] },
  tpmr:  { name: 'TPMR',  icon: '♿', vehicles: ['TPMR 1','TPMR 2','TPMR 3','TPMR 4','TPMR 5','TPMR 6','TPMR 7','TPMR 8'] },
  vsl:   { name: 'VSL',   icon: '🚗', vehicles: ['VSL 1','VSL 2'] }
}

const red = '#E8192C'
const dark = '#0D0F14'
const card = '#1E2330'
const border = 'rgba(255,255,255,0.07)'
const text2 = '#8B90A0'
const text3 = '#555B6E'

export default function App() {
  const [screen, setScreen] = useState('home')
  const [fleetType, setFleetType] = useState(null)
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const { vehicules } = useVehicules()

  return (
    <div style={{background:dark,minHeight:'100vh',color:'#F0F2F7',fontFamily:'sans-serif',paddingBottom:'70px'}}>

      {/* HEADER */}
      <div style={{background:'#13161D',padding:'12px 16px',borderBottom:'1px solid '+border,position:'sticky',top:0,zIndex:100}}>
        <strong style={{color:'#fff',fontSize:'16px'}}>A.P.S. Ambulance</strong>
        <div style={{fontSize:'11px',color:text3}}>Checklist Journalière</div>
      </div>

      {/* ACCUEIL */}
      {screen === 'home' && (
        <div style={{padding:'24px 16px'}}>
          <h1 style={{color:red,fontSize:'36px',textAlign:'center',marginBottom:'8px'}}>Checklist</h1>
          <p style={{textAlign:'center',color:text2,marginBottom:'24px'}}>Selectionnez un type de vehicule</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px',marginBottom:'24px'}}>
            {Object.entries(FLEET).map(([key,fleet]) => (
              <div key={key} onClick={() => {setFleetType(key);setScreen('vehicles')}}
                style={{background:card,border:'1px solid '+border,borderRadius:'16px',padding:'20px 12px',textAlign:'center',cursor:'pointer'}}>
                <div style={{fontSize:'36px'}}>{fleet.icon}</div>
                <div style={{fontWeight:'800',fontSize:'16px',marginTop:'8px'}}>{fleet.name}</div>
                <div style={{fontSize:'11px',color:text3}}>{fleet.vehicles.length} vehicules</div>
              </div>
            ))}
          </div>
        </div>
      )}

      

      {/* LISTE VEHICULES */}
      {screen === 'vehicles' && fleetType && !selectedVehicle && (
        <div style={{padding:'16px'}}>
          <button onClick={() => setScreen('home')}
            style={{background:card,border:'1px solid '+border,color:'#fff',padding:'8px 16px',borderRadius:'10px',cursor:'pointer',marginBottom:'16px'}}>
            Retour
          </button>
          <h2 style={{color:red,marginBottom:'16px'}}>{FLEET[fleetType].name}</h2>
          {vehicules.filter(v => v.type === fleetType).map(v => (
            <div key={v.id} onClick={() => setSelectedVehicle(v.nom)}
              style={{background:card,border:'1px solid '+border,borderRadius:'14px',padding:'16px',marginBottom:'10px',cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                <span style={{fontSize:'22px'}}>{FLEET[fleetType].icon}</span>
                <strong>{v.nom}</strong>
              </div>
              <span style={{color:text3,fontSize:'12px'}}>→</span>
            </div>
          ))}
        </div>
      )}

      {/* CHECKLIST */}
      {screen === 'vehicles' && selectedVehicle && (
        <Checklist
          vehicle={selectedVehicle}
          type={fleetType}
          onBack={() => setSelectedVehicle(null)}
        />
      )}


      {/* GARAGE */}
      {screen === 'garage' && <Garage />}

      {/* SIGNALER */}
      {screen === 'report' && <Signaler onBack={() => setScreen('home')} />}

      {/* HISTORIQUE */}
      {screen === 'history' && <Historique />}

      {/* PARAMETRES */}
      {screen === 'settings' && <Parametres />}

      {/* BOTTOM NAV */}
      <div style={{position:'fixed',bottom:0,left:0,right:0,background:'rgba(13,15,20,0.97)',borderTop:'1px solid '+border,display:'flex',height:'64px',zIndex:100}}>
        {[
          {id:'home',icon:'🏠',label:'Accueil'},
          {id:'garage',icon:'🔧',label:'Garage'},
          {id:'report',icon:'🚨',label:'Signaler',big:true},
          {id:'history',icon:'📋',label:'Historique'},
          {id:'settings',icon:'⚙️',label:'Parametres'},
        ].map(item => (
          <div key={item.id} onClick={() => setScreen(item.id)}
            style={{flex:item.big?1.2:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',cursor:'pointer',gap:'2px'}}>
            {item.big ? (
              <div style={{background:red,borderRadius:'14px',padding:'8px 16px',display:'flex',flexDirection:'column',alignItems:'center',gap:'2px',boxShadow:'0 4px 16px rgba(232,25,44,0.45)'}}>
                <span style={{fontSize:'22px'}}>{item.icon}</span>
                <span style={{fontSize:'10px',color:'#fff',fontWeight:'700'}}>{item.label.toUpperCase()}</span>
              </div>
            ) : (
              <>
                <span style={{fontSize:'20px'}}>{item.icon}</span>
                <span style={{fontSize:'10px',color:screen===item.id?red:text3,fontWeight:'600'}}>{item.label.toUpperCase()}</span>
              </>
            )}
          </div>
        ))}
      </div>

    </div>
  )
}
