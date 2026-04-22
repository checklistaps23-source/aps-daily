


import { useState, useEffect } from 'react'
import { db } from './firebase'
import { collection, onSnapshot, deleteDoc, doc, addDoc, setDoc, getDoc } from 'firebase/firestore'
import { useVehicules } from './useVehicules'
import { CHECKLIST_ALPHA, CHECKLIST_TPMR, CHECKLIST_VSL } from './checklists'

const red = '#E8192C'
const dark3 = '#1A1E28'
const card = '#1E2330'
const border = 'rgba(255,255,255,0.07)'
const text2 = '#8B90A0'
const text3 = '#555B6E'
const green = '#1DB954'
const ADMIN_PIN = '9819'
const CHECKLIST_BASE = { alpha: CHECKLIST_ALPHA, tpmr: CHECKLIST_TPMR, vsl: CHECKLIST_VSL }

export default function Parametres() {
  const [unlocked, setUnlocked] = useState(false)
  const [pin, setPin] = useState('')
  const [tab, setTab] = useState('vehicules')
  const [newNom, setNewNom] = useState('')
  const [newType, setNewType] = useState('alpha')
  const [defects, setDefects] = useState([])
  const [checklists, setChecklists] = useState([])
  const { vehicules, addVehicule, deleteVehicule } = useVehicules()
  const [editingVehicule, setEditingVehicule] = useState(null)
  const [editingSections, setEditingSections] = useState([])
  const [saving, setSaving] = useState(false)
  const [newItemLabel, setNewItemLabel] = useState({})
  const [newSectionLabel, setNewSectionLabel] = useState('')

  useEffect(() => {
    const unsub1 = onSnapshot(collection(db, 'defects'), snap => {
      setDefects(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    const unsub2 = onSnapshot(collection(db, 'checklists'), snap => {
      setChecklists(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return () => { unsub1(); unsub2() }
  }, [])

  const checkPin = () => {
    if (pin === ADMIN_PIN) { setUnlocked(true); setPin('') }
    else { alert('Code incorrect'); setPin('') }
  }

  const handleAdd = async () => {
    if (!newNom.trim()) { alert('Entrez un nom'); return }
    await addVehicule(newNom.trim(), newType)
    setNewNom('')
  }

  const handleDelete = async (id, nom) => {
    if (!window.confirm('Supprimer ' + nom + ' ?')) return
    await deleteVehicule(id)
  }

  const initFlotte = async () => {
    if (!window.confirm('Initialiser la flotte de base ?')) return
    const vehiculesBase = [
      {nom:'Alpha 1',type:'alpha'},{nom:'Alpha 2',type:'alpha'},{nom:'Alpha 3',type:'alpha'},
      {nom:'Alpha 4',type:'alpha'},{nom:'Alpha 5',type:'alpha'},{nom:'Alpha 6',type:'alpha'},
      {nom:'Alpha 7',type:'alpha'},
      {nom:'TPMR 1',type:'tpmr'},{nom:'TPMR 2',type:'tpmr'},{nom:'TPMR 3',type:'tpmr'},
      {nom:'TPMR 4',type:'tpmr'},{nom:'TPMR 5',type:'tpmr'},{nom:'TPMR 6',type:'tpmr'},
      {nom:'TPMR 7',type:'tpmr'},{nom:'TPMR 8',type:'tpmr'},
      {nom:'VSL 1',type:'vsl'},{nom:'VSL 2',type:'vsl'}
    ]
    for (const v of vehiculesBase) { await addDoc(collection(db, 'vehicules'), v) }
    alert('Flotte initialisee !')
  }

  const openChecklistEditor = async (vehicule) => {
    setEditingVehicule(vehicule)
    const ref = doc(db, 'checklistsTemplate', vehicule.id)
    const snap = await getDoc(ref)
    if (snap.exists()) {
      setEditingSections(JSON.parse(JSON.stringify(snap.data().sections)))
    } else {
      const base = CHECKLIST_BASE[vehicule.type] || CHECKLIST_ALPHA
      setEditingSections(JSON.parse(JSON.stringify(base)))
    }
  }

  const closeEditor = () => {
    setEditingVehicule(null)
    setEditingSections([])
    setNewItemLabel({})
    setNewSectionLabel('')
  }

  const saveChecklist = async () => {
    if (!editingVehicule) return
    setSaving(true)
    await setDoc(doc(db, 'checklistsTemplate', editingVehicule.id), {
      vehiculeId: editingVehicule.id,
      vehiculeNom: editingVehicule.nom,
      type: editingVehicule.type,
      sections: editingSections,
      updatedAt: new Date().toISOString()
    })
    setSaving(false)
    alert('Checklist sauvegardee !')
    closeEditor()
  }

  const deleteItem = (sIdx, iIdx) => {
    const s = JSON.parse(JSON.stringify(editingSections))
    s[sIdx].items.splice(iIdx, 1)
    setEditingSections(s)
  }

  const addItem = (sIdx) => {
    const label = (newItemLabel[sIdx] || '').trim()
    if (!label) return
    const s = JSON.parse(JSON.stringify(editingSections))
    s[sIdx].items.push({ id: 'custom_' + Date.now(), label, type: 'ok_nok', required: true })
    setEditingSections(s)
    setNewItemLabel(prev => ({ ...prev, [sIdx]: '' }))
  }

  const addSection = () => {
    if (!newSectionLabel.trim()) return
    setEditingSections(prev => [...prev, { section: newSectionLabel.trim(), items: [] }])
    setNewSectionLabel('')
  }

  const deleteSection = (sIdx) => {
    if (!window.confirm('Supprimer cette section ?')) return
    const s = JSON.parse(JSON.stringify(editingSections))
    s.splice(sIdx, 1)
    setEditingSections(s)
  }

  if (editingVehicule) {
    return (
      <div style={{paddingBottom:'100px'}}>
        <div style={{padding:'16px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'20px'}}>
            <button onClick={closeEditor} style={{background:card,border:'1px solid '+border,color:'#fff',padding:'8px 14px',borderRadius:'10px',cursor:'pointer'}}>
              Retour
            </button>
            <div>
              <div style={{fontWeight:'800',fontSize:'18px',color:red}}>{editingVehicule.nom}</div>
              <div style={{fontSize:'12px',color:text3}}>Edition de la checklist</div>
            </div>
          </div>

          {editingSections.map((section, sIdx) => (
            <div key={sIdx} style={{background:card,border:'1px solid '+border,borderRadius:'16px',padding:'14px',marginBottom:'14px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'10px'}}>
                <div style={{fontWeight:'700',fontSize:'14px'}}>{section.section}</div>
                <button onClick={() => deleteSection(sIdx)} style={{background:'transparent',border:'1px solid rgba(232,25,44,0.3)',color:red,borderRadius:'7px',padding:'3px 8px',fontSize:'11px',cursor:'pointer'}}>
                  Supprimer section
                </button>
              </div>
              {section.items.map((item, iIdx) => (
                <div key={item.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px solid '+border}}>
                  <div>
                    <span style={{fontSize:'13px',fontWeight:'600'}}>{item.label}</span>
                    <span style={{fontSize:'11px',color:text3,marginLeft:'8px'}}>{item.type}</span>
                    {item.required && <span style={{fontSize:'10px',color:red,marginLeft:'6px'}}>*</span>}
                  </div>
                  <button onClick={() => deleteItem(sIdx, iIdx)} style={{background:'transparent',border:'1px solid rgba(232,25,44,0.3)',color:red,borderRadius:'7px',padding:'3px 8px',fontSize:'11px',cursor:'pointer'}}>
                    Suppr
                  </button>
                </div>
              ))}
              <div style={{display:'flex',gap:'8px',marginTop:'10px'}}>
                <input type="text" placeholder="Nouvel item..." value={newItemLabel[sIdx] || ''} onChange={e => setNewItemLabel(prev => ({ ...prev, [sIdx]: e.target.value }))} onKeyDown={e => e.key === 'Enter' && addItem(sIdx)} style={{flex:1,background:dark3,border:'1px solid '+border,borderRadius:'8px',padding:'7px 10px',color:'#fff',fontSize:'13px'}}/>
                <button onClick={() => addItem(sIdx)} style={{background:red,border:'none',borderRadius:'8px',color:'#fff',padding:'7px 12px',fontWeight:'700',cursor:'pointer'}}>+</button>
              </div>
            </div>
          ))}

          <div style={{background:card,border:'1px solid '+border,borderRadius:'16px',padding:'14px',marginBottom:'14px'}}>
            <div style={{fontWeight:'700',fontSize:'13px',marginBottom:'10px',color:text2}}>Nouvelle section</div>
            <div style={{display:'flex',gap:'8px'}}>
              <input type="text" placeholder="Ex: Equipement special" value={newSectionLabel} onChange={e => setNewSectionLabel(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSection()} style={{flex:1,background:dark3,border:'1px solid '+border,borderRadius:'8px',padding:'9px 10px',color:'#fff',fontSize:'13px'}}/>
              <button onClick={addSection} style={{background:red,border:'none',borderRadius:'8px',color:'#fff',padding:'9px 14px',fontWeight:'700',cursor:'pointer'}}>+</button>
            </div>
          </div>

          <button onClick={saveChecklist} disabled={saving} style={{width:'100%',padding:'14px',background:saving?text3:green,border:'none',borderRadius:'12px',color:'#fff',fontWeight:'800',fontSize:'16px',cursor:'pointer'}}>
            {saving ? 'Sauvegarde...' : 'Sauvegarder la checklist'}
          </button>
        </div>
      </div>
    )
  }

  if (!unlocked) {
    return (
      <div style={{padding:'24px 16px'}}>
        <div style={{background:card,border:'1px solid '+border,borderRadius:'16px',padding:'24px',textAlign:'center'}}>
          <div style={{fontSize:'40px',marginBottom:'12px'}}>🔐</div>
          <h3 style={{marginBottom:'8px'}}>Acces Administrateur</h3>
          <p style={{color:text2,fontSize:'14px',marginBottom:'16px'}}>Entrez le code administrateur</p>
          <div style={{display:'flex',gap:'10px',justifyContent:'center',marginBottom:'16px'}}>
            {[0,1,2,3].map(i => (
              <input key={i} type="password" inputMode="numeric" maxLength="1" value={pin[i] || ''} onChange={e => { const arr = pin.split(''); arr[i] = e.target.value; setPin(arr.join('')); if (e.target.value && i < 3) document.getElementById('apin'+(i+1)) && document.getElementById('apin'+(i+1)).focus() }} id={'apin'+i} style={{width:'48px',height:'56px',borderRadius:'12px',background:dark3,border:'1px solid '+border,color:'#fff',fontSize:'24px',fontWeight:'700',textAlign:'center'}}/>
            ))}
          </div>
          <button onClick={checkPin} style={{padding:'12px 24px',background:red,border:'none',borderRadius:'10px',color:'#fff',fontWeight:'700',fontSize:'16px',cursor:'pointer'}}>
            Deverrouiller
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{paddingBottom:'100px'}}>
      <div style={{padding:'16px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
          <h2 style={{color:red}}>Parametres</h2>
          <button onClick={() => setUnlocked(false)} style={{padding:'6px 12px',background:'transparent',border:'1px solid '+border,borderRadius:'8px',color:text3,fontSize:'12px',cursor:'pointer'}}>
            Verrouiller
          </button>
        </div>

        <div style={{display:'flex',gap:'8px',marginBottom:'20px'}}>
          {[['vehicules','Vehicules'],['stats','Statistiques']].map(([val,label]) => (
            <button key={val} onClick={() => setTab(val)} style={{padding:'8px 16px',borderRadius:'20px',border:'1px solid '+(tab===val?red:border),background:tab===val?red:'transparent',color:tab===val?'#fff':text2,fontSize:'13px',fontWeight:'600',cursor:'pointer'}}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'vehicules' && (
          <div>
            {vehicules.length === 0 && (
              <div style={{background:card,border:'1px solid '+border,borderRadius:'16px',padding:'16px',marginBottom:'14px',textAlign:'center'}}>
                <p style={{color:text2,marginBottom:'12px'}}>Aucun vehicule</p>
                <button onClick={initFlotte} style={{padding:'10px 20px',background:red,border:'none',borderRadius:'10px',color:'#fff',fontWeight:'700',cursor:'pointer'}}>Initialiser la flotte</button>
              </div>
            )}
            <div style={{background:card,border:'1px solid '+border,borderRadius:'16px',padding:'16px',marginBottom:'14px'}}>
              <div style={{fontWeight:'700',fontSize:'14px',marginBottom:'12px'}}>Ajouter un vehicule</div>
              <input type="text" placeholder="Ex: Alpha 8" value={newNom} onChange={e => setNewNom(e.target.value)} style={{width:'100%',background:dark3,border:'1px solid '+border,borderRadius:'9px',padding:'10px 12px',color:'#fff',fontSize:'14px',marginBottom:'10px'}}/>
              <div style={{display:'flex',gap:'8px',marginBottom:'12px'}}>
                {[['alpha','Alpha'],['tpmr','TPMR'],['vsl','VSL']].map(([val,label]) => (
                  <button key={val} onClick={() => setNewType(val)} style={{flex:1,padding:'8px',borderRadius:'9px',border:'1px solid '+(newType===val?red:border),background:newType===val?'rgba(232,25,44,0.12)':'transparent',color:newType===val?red:text2,fontSize:'12px',fontWeight:'700',cursor:'pointer'}}>
                    {label}
                  </button>
                ))}
              </div>
              <button onClick={handleAdd} style={{width:'100%',padding:'10px',background:red,border:'none',borderRadius:'9px',color:'#fff',fontWeight:'700',cursor:'pointer'}}>Ajouter</button>
            </div>

            <div style={{background:card,border:'1px solid '+border,borderRadius:'16px',padding:'16px'}}>
              <div style={{fontWeight:'700',fontSize:'14px',marginBottom:'12px'}}>Vehicules ({vehicules.length})</div>
              {vehicules.map(v => (
                <div key={v.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid '+border}}>
                  <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                    <span>{v.type==='alpha'?'🚑':v.type==='tpmr'?'♿':'🚗'}</span>
                    <span style={{fontSize:'14px',fontWeight:'600'}}>{v.nom}</span>
                  </div>
                  <div style={{display:'flex',gap:'8px'}}>
                    <button onClick={() => openChecklistEditor(v)} style={{padding:'4px 10px',background:'rgba(29,185,84,0.12)',border:'1px solid rgba(29,185,84,0.3)',borderRadius:'7px',color:green,fontSize:'12px',cursor:'pointer'}}>Checklist</button>
                    <button onClick={() => handleDelete(v.id, v.nom)} style={{padding:'4px 10px',background:'transparent',border:'1px solid rgba(232,25,44,0.3)',borderRadius:'7px',color:red,fontSize:'12px',cursor:'pointer'}}>Suppr</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'stats' && (
          <div style={{background:card,border:'1px solid '+border,borderRadius:'16px',padding:'16px'}}>
            <div style={{fontWeight:'700',fontSize:'16px',marginBottom:'14px'}}>Statistiques</div>
            <div style={{display:'flex',gap:'10px'}}>
              <div style={{flex:1,background:dark3,borderRadius:'12px',padding:'12px',textAlign:'center'}}>
                <div style={{fontSize:'28px',fontWeight:'900',color:red}}>{checklists.length}</div>
                <div style={{fontSize:'12px',color:text3}}>Checklists</div>
              </div>
              <div style={{flex:1,background:dark3,borderRadius:'12px',padding:'12px',textAlign:'center'}}>
                <div style={{fontSize:'28px',fontWeight:'900',color:'#FF8C00'}}>{defects.filter(d=>d.status==='open').length}</div>
                <div style={{fontSize:'12px',color:text3}}>Defauts</div>
              </div>
              <div style={{flex:1,background:dark3,borderRadius:'12px',padding:'12px',textAlign:'center'}}>
                <div style={{fontSize:'28px',fontWeight:'900',color:green}}>{vehicules.length}</div>
                <div style={{fontSize:'12px',color:text3}}>Vehicules</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
