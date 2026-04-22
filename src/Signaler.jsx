

import { useState } from 'react'
import { db } from './firebase'
import { collection, addDoc, Timestamp } from 'firebase/firestore'
import { useVehicules } from './useVehicules'

const red = '#E8192C'
const dark3 = '#1A1E28'
const card = '#1E2330'
const border = 'rgba(255,255,255,0.07)'
const text2 = '#8B90A0'
const text3 = '#555B6E'

export default function Signaler({ onBack }) {
  const [vehicle, setVehicle] = useState('')
  const [description, setDescription] = useState('')
  const [nom, setNom] = useState('')
  const [loading, setLoading] = useState(false)
  const { vehicules } = useVehicules()

  const handleSubmit = async () => {
    if (!vehicle) { alert('Selectionnez un vehicule'); return }
    if (!description.trim()) { alert('Decrivez le probleme'); return }
    if (!nom.trim()) { alert('Entrez votre nom'); return }
    setLoading(true)
    try {
      const type = vehicle.toLowerCase().startsWith('alpha') ? 'alpha'
        : vehicle.toLowerCase().startsWith('tpmr') ? 'tpmr' : 'vsl'
      await addDoc(collection(db, 'defects'), {
        vehicle, type, description: description.trim(),
        reportedBy: nom.trim(),
        source: 'manuel',
        defectKey: vehicle + '_manuel_' + Date.now(),
        status: 'open',
        createdAt: Timestamp.now()
      })
      alert('Probleme signale au garage !')
      setVehicle(''); setDescription(''); setNom('')
      onBack()
    } catch(e) {
      alert('Erreur: ' + e.message)
    }
    setLoading(false)
  }

  const alphas = vehicules.filter(v => v.type === 'alpha')
  const tpmrs = vehicules.filter(v => v.type === 'tpmr')
  const vsls = vehicules.filter(v => v.type === 'vsl')

  const renderGroupe = (label, items, icon) => (
    <div style={{marginBottom:'12px'}}>
      <div style={{fontSize:'11px',fontWeight:'700',color:text3,marginBottom:'6px'}}>{icon} {label}</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'6px'}}>
        {items.map(v => (
          <div key={v.id} onClick={() => setVehicle(v.nom)}
            style={{padding:'8px 4px',borderRadius:'10px',textAlign:'center',cursor:'pointer',fontSize:'12px',fontWeight:'700',
              background: vehicle===v.nom ? 'rgba(232,25,44,0.12)' : card,
              border: '1px solid '+(vehicle===v.nom ? red : border),
              color: vehicle===v.nom ? red : text2
            }}>{v.nom}</div>
        ))}
      </div>
    </div>
  )

  return (
    <div style={{padding:'16px',paddingBottom:'100px'}}>
      <h2 style={{color:red,marginBottom:'20px'}}>Signaler un Probleme</h2>

      <div style={{marginBottom:'14px'}}>
        <div style={{fontSize:'11px',fontWeight:'700',color:text3,textTransform:'uppercase',letterSpacing:'1px',marginBottom:'8px'}}>Vehicule concerne</div>
        {renderGroupe('Alpha', alphas, '🚑')}
        {renderGroupe('TPMR', tpmrs, '♿')}
        {renderGroupe('VSL', vsls, '🚗')}
      </div>

      <div style={{marginBottom:'14px'}}>
        <div style={{fontSize:'11px',fontWeight:'700',color:text3,textTransform:'uppercase',letterSpacing:'1px',marginBottom:'8px'}}>Description du probleme *</div>
        <textarea value={description} onChange={e => setDescription(e.target.value)}
          placeholder="Decrivez le probleme en detail..."
          style={{width:'100%',background:dark3,border:'1px solid '+border,borderRadius:'9px',padding:'10px 12px',color:'#fff',fontSize:'14px',minHeight:'100px',resize:'vertical'}}/>
      </div>

      <div style={{marginBottom:'20px'}}>
        <div style={{fontSize:'11px',fontWeight:'700',color:text3,textTransform:'uppercase',letterSpacing:'1px',marginBottom:'8px'}}>Votre nom *</div>
        <input type="text" value={nom} onChange={e => setNom(e.target.value)}
          placeholder="Prenom Nom"
          style={{width:'100%',background:dark3,border:'1px solid '+border,borderRadius:'9px',padding:'10px 12px',color:'#fff',fontSize:'14px'}}/>
      </div>

      <button onClick={handleSubmit} disabled={loading}
        style={{width:'100%',padding:'16px',background:red,border:'none',borderRadius:'14px',color:'#fff',fontSize:'18px',fontWeight:'800',cursor:'pointer',opacity:loading?0.7:1}}>
        {loading ? 'Envoi...' : 'Envoyer le signalement'}
      </button>
    </div>
  )
}
