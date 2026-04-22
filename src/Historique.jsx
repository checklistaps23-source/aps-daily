

import { useState, useEffect } from 'react'
import { db } from './firebase'
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore'
import { CHECKLIST_ALPHA, CHECKLIST_TPMR, CHECKLIST_VSL } from './checklists'

const red = '#E8192C'
const card = '#1E2330'
const dark3 = '#1A1E28'
const border = 'rgba(255,255,255,0.07)'
const text2 = '#8B90A0'
const text3 = '#555B6E'
const green = '#1DB954'
const orange = '#FF8C00'
const HISTORY_PIN = '0220'
const TEMPLATES = { alpha: CHECKLIST_ALPHA, tpmr: CHECKLIST_TPMR, vsl: CHECKLIST_VSL }

export default function Historique() {
  const [checklists, setChecklists] = useState([])
  const [filter, setFilter] = useState('all')
  const [unlocked, setUnlocked] = useState(false)
  const [pin, setPin] = useState('')
  const [selectMode, setSelectMode] = useState(false)
  const [selected, setSelected] = useState([])
  const [detail, setDetail] = useState(null)

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'checklists'), snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      data.sort((a,b) => b.createdAt?.seconds - a.createdAt?.seconds)
      setChecklists(data)
    })
    return () => unsub()
  }, [])

  const checkPin = () => {
    if (pin === HISTORY_PIN) { setUnlocked(true); setPin('') }
    else { alert('Code incorrect'); setPin('') }
  }

  const deleteSelected = async () => {
    if (!window.confirm('Supprimer ' + selected.length + ' checklist(s) ?')) return
    for (const id of selected) { await deleteDoc(doc(db, 'checklists', id)) }
    setSelected([])
    setSelectMode(false)
  }

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const formatDate = (ts) => {
    if (!ts) return ''
    return new Date(ts.seconds * 1000).toLocaleDateString('fr-FR', {
      weekday:'long', day:'numeric', month:'long', year:'numeric'
    })
  }

  const formatTime = (ts) => {
    if (!ts) return ''
    return new Date(ts.seconds * 1000).toLocaleTimeString('fr-FR', {
      hour:'2-digit', minute:'2-digit'
    })
  }

  const renderValue = (val) => {
    if (val === null || val === undefined || val === '') return { text: 'Non rempli', color: text3 }
    const v = String(val).toLowerCase()
    if (v === 'ok') return { text: 'OK', color: green }
    if (v === 'nok') return { text: 'NOK', color: red }
    if (v === 'np') return { text: 'N/P', color: text2 }
    if (v === 'propre' || v === 'bon') return { text: val, color: green }
    if (v === 'sale' || v === 'remplacer') return { text: val, color: red }
    if (v === 'insuf' || v === 'usure') return { text: val, color: orange }
    if (v === 'vide') return { text: 'Vide', color: green }
    if (v === 'pleine') return { text: 'Pleine', color: red }
    if (v === 'full') return { text: 'Plein', color: green }
    if (v === '75') return { text: '3/4', color: green }
    if (v === '50') return { text: '1/2', color: orange }
    if (v === '25') return { text: '1/4', color: red }
    if (v === '0') return { text: 'Vide', color: red }
    return { text: String(val), color: text2 }
  }

  const filtered = checklists.filter(c => filter === 'all' ? true : c.type === filter)
  const groups = {}
  filtered.forEach(c => {
    const date = c.createdAt ? formatDate(c.createdAt) : 'Date inconnue'
    if (!groups[date]) groups[date] = []
    groups[date].push(c)
  })

  if (!unlocked) {
    return (
      <div style={{padding:'24px 16px'}}>
        <div style={{background:card,border:'1px solid '+border,borderRadius:'16px',padding:'24px',textAlign:'center'}}>
          <div style={{fontSize:'40px',marginBottom:'12px'}}>🔐</div>
          <h3 style={{marginBottom:'8px'}}>Acces Historique</h3>
          <p style={{color:text2,fontSize:'14px',marginBottom:'16px'}}>Entrez le code pour consulter l historique</p>
          <div style={{display:'flex',gap:'10px',justifyContent:'center',marginBottom:'16px'}}>
            {[0,1,2,3].map(i => (
              <input key={i} type="password" inputMode="numeric" maxLength="1" value={pin[i] || ''}
                onChange={e => {
                  const newPin = pin.split('')
                  newPin[i] = e.target.value
                  setPin(newPin.join(''))
                  if (e.target.value && i < 3) document.getElementById('hpin'+(i+1)) && document.getElementById('hpin'+(i+1)).focus()
                }}
                id={'hpin'+i}
                style={{width:'48px',height:'56px',borderRadius:'12px',background:dark3,border:'1px solid '+border,color:'#fff',fontSize:'24px',fontWeight:'700',textAlign:'center'}}/>
            ))}
          </div>
          <button onClick={checkPin} style={{padding:'12px 24px',background:red,border:'none',borderRadius:'10px',color:'#fff',fontWeight:'700',fontSize:'16px',cursor:'pointer'}}>
            Deverrouiller
          </button>
        </div>
      </div>
    )
  }

  if (detail) {
    const template = TEMPLATES[detail.type] || CHECKLIST_ALPHA
    const values = detail.values || {}
    return (
      <div style={{paddingBottom:'100px'}}>
        <div style={{padding:'16px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'20px'}}>
            <button onClick={() => setDetail(null)} style={{background:card,border:'1px solid '+border,color:'#fff',padding:'8px 14px',borderRadius:'10px',cursor:'pointer'}}>
              Retour
            </button>
            <div>
              <div style={{fontWeight:'800',fontSize:'18px',color:red}}>{detail.vehicle}</div>
              <div style={{fontSize:'12px',color:text3}}>{formatDate(detail.createdAt)} a {formatTime(detail.createdAt)}</div>
            </div>
            <span style={{marginLeft:'auto',padding:'4px 10px',borderRadius:'8px',fontSize:'11px',fontWeight:'700',
              background:detail.hasDefects?'rgba(232,25,44,0.15)':'rgba(29,185,84,0.12)',
              color:detail.hasDefects?red:green}}>
              {detail.hasDefects ? 'Defaut' : 'RAS'}
            </span>
          </div>

          <div style={{background:card,border:'1px solid '+border,borderRadius:'14px',padding:'14px',marginBottom:'14px'}}>
            <div style={{display:'flex',gap:'24px',flexWrap:'wrap'}}>
              <div>
                <div style={{fontSize:'11px',color:text3,marginBottom:'2px'}}>Ambulancier(s)</div>
                <div style={{fontWeight:'700'}}>{detail.submittedBy || 'Non renseigne'}</div>
              </div>
              {values.km && (
                <div>
                  <div style={{fontSize:'11px',color:text3,marginBottom:'2px'}}>Kilometrage</div>
                  <div style={{fontWeight:'700'}}>{values.km} km</div>
                </div>
              )}
            </div>
            {values.remarques && (
              <div style={{marginTop:'10px',padding:'10px',background:dark3,borderRadius:'9px'}}>
                <div style={{fontSize:'11px',color:text3,marginBottom:'4px'}}>Remarques</div>
                <div style={{color:text2,fontSize:'13px'}}>{values.remarques}</div>
              </div>
            )}
          </div>

          {template.map((section, sIdx) => (
            <div key={sIdx} style={{background:card,border:'1px solid '+border,borderRadius:'14px',padding:'14px',marginBottom:'12px'}}>
              <div style={{fontWeight:'700',fontSize:'13px',marginBottom:'10px',color:text2}}>{section.section}</div>
              {section.items.map((item, iIdx) => {
                const val = values[item.id]
                const rendered = renderValue(val)
                const hasIssue = rendered.color === red || rendered.color === orange
                return (
                  <div key={iIdx} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px solid '+border}}>
                    <span style={{fontSize:'13px',flex:1,paddingRight:'8px',color:hasIssue?'#fff':text2}}>{item.label}</span>
                    <span style={{fontSize:'12px',fontWeight:'700',color:rendered.color,background:'rgba(255,255,255,0.05)',padding:'3px 10px',borderRadius:'6px',whiteSpace:'nowrap'}}>
                      {rendered.text}
                    </span>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{paddingBottom:'100px'}}>
      <div style={{padding:'16px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
          <h2 style={{color:red}}>Historique</h2>
          <div style={{display:'flex',gap:'8px'}}>
            <button onClick={() => {setSelectMode(!selectMode);setSelected([])}}
              style={{padding:'6px 12px',background:'transparent',border:'1px solid '+border,borderRadius:'8px',color:selectMode?red:text2,fontSize:'12px',cursor:'pointer'}}>
              {selectMode ? 'Annuler' : 'Selectionner'}
            </button>
            <button onClick={() => {setUnlocked(false);setSelectMode(false)}}
              style={{padding:'6px 12px',background:'transparent',border:'1px solid '+border,borderRadius:'8px',color:text3,fontSize:'12px',cursor:'pointer'}}>
              🔒
            </button>
          </div>
        </div>

        {selectMode && selected.length > 0 && (
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',background:'rgba(232,25,44,0.08)',border:'1px solid rgba(232,25,44,0.3)',borderRadius:'12px',padding:'10px 14px',marginBottom:'12px'}}>
            <span style={{fontSize:'13px',color:text2}}>{selected.length} selectionne(s)</span>
            <button onClick={deleteSelected} style={{padding:'7px 14px',background:red,border:'none',borderRadius:'8px',color:'#fff',fontSize:'13px',fontWeight:'700',cursor:'pointer'}}>
              Supprimer
            </button>
          </div>
        )}

        <div style={{display:'flex',gap:'8px',marginBottom:'16px',overflowX:'auto'}}>
          {[['all','Tout'],['alpha','Alpha'],['tpmr','TPMR'],['vsl','VSL']].map(([val,label]) => (
            <button key={val} onClick={() => setFilter(val)}
              style={{padding:'7px 14px',borderRadius:'20px',border:'1px solid '+(filter===val?red:border),
                background:filter===val?red:'transparent',color:filter===val?'#fff':text2,
                fontSize:'13px',fontWeight:'600',cursor:'pointer',whiteSpace:'nowrap'}}>
              {label}
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{textAlign:'center',padding:'48px',color:text3}}>
            <div style={{fontSize:'48px',marginBottom:'12px'}}>📋</div>
            <p>Aucune checklist enregistree</p>
          </div>
        )}

        {Object.entries(groups).map(([date, items]) => (
          <div key={date} style={{marginBottom:'16px'}}>
            <div style={{fontSize:'12px',fontWeight:'700',letterSpacing:'2px',color:text3,textTransform:'uppercase',marginBottom:'8px'}}>
              📅 {date}
            </div>
            {items.map(c => (
              <div key={c.id}
                onClick={() => selectMode ? toggleSelect(c.id) : setDetail(c)}
                style={{background:selected.includes(c.id)?'rgba(232,25,44,0.05)':card,border:'1px solid '+(selected.includes(c.id)?red:border),borderRadius:'14px',padding:'14px',marginBottom:'8px',cursor:'pointer'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  {selectMode && (
                    <div style={{width:'20px',height:'20px',borderRadius:'6px',border:'2px solid '+(selected.includes(c.id)?red:border),
                      background:selected.includes(c.id)?red:'transparent',marginRight:'10px',flexShrink:0,
                      display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:'12px'}}>
                      {selected.includes(c.id)?'v':''}
                    </div>
                  )}
                  <span style={{background:dark3,borderRadius:'8px',padding:'4px 10px',fontWeight:'700',fontSize:'14px'}}>{c.vehicle}</span>
                  <span style={{padding:'4px 10px',borderRadius:'8px',fontSize:'11px',fontWeight:'700',
                    background:c.hasDefects?'rgba(232,25,44,0.15)':'rgba(29,185,84,0.12)',
                    color:c.hasDefects?red:green}}>
                    {c.hasDefects?'Defaut':'RAS'}
                  </span>
                </div>
                <div style={{fontSize:'12px',color:text3,marginTop:'6px',display:'flex',gap:'12px'}}>
                  <span>🕐 {formatTime(c.createdAt)}</span>
                  <span>👤 {c.submittedBy}</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
