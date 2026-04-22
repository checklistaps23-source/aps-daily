

import { useState } from 'react'
import { CHECKLIST_ALPHA, CHECKLIST_TPMR, CHECKLIST_VSL } from './checklists'
import { db } from './firebase'
import { collection, addDoc, getDocs, query, where, Timestamp } from 'firebase/firestore'

const red = '#E8192C'
const dark3 = '#1A1E28'
const card = '#1E2330'
const border = 'rgba(255,255,255,0.07)'
const text2 = '#8B90A0'
const text3 = '#555B6E'
const green = '#1DB954'
const orange = '#FF8C00'

export default function Checklist({ vehicle, type, onBack }) {
  const [values, setValues] = useState({})

  const template = type === 'alpha' ? CHECKLIST_ALPHA
    : type === 'tpmr' ? CHECKLIST_TPMR : CHECKLIST_VSL

  const set = (id, val) => setValues(v => ({ ...v, [id]: val }))

  const handleSubmit = async () => {
    const missing = []
    template.forEach(s => s.items.forEach(item => {
      if (item.required && !values[item.id] && item.type !== 'textarea') {
        missing.push(item.id)
      }
    }))
    


if (missing.length > 0) {
  const firstMissing = missing[0]
  const el = document.getElementById('field_' + firstMissing)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.style.outline = '3px solid #E8192C'
    setTimeout(() => { el.style.outline = '' }, 3000)
  }
  return
}

    try {
      const BAD_VALUES = ['nok', 'remplacer', 'insuf', 'usure', 'sale', 'pleine']
      const defautsAuto = []

      template.forEach(section => {
        section.items.forEach(item => {
          const val = values[item.id]

          if (item.id === 'ct' && val) {
            const dateCT = new Date(val)
            const today = new Date()
            today.setHours(0,0,0,0)
            if (dateCT < today) {
              defautsAuto.push({
                vehicle, type,
                description: 'Controle technique depasse : ' + new Date(val).toLocaleDateString('fr-FR'),
                reportedBy: values.nom1 || 'Inconnu',
                source: 'checklist',
                defectKey: vehicle + '_ct_depasse',
                createdAt: Timestamp.now()
              })
            }
          }

          if (val && BAD_VALUES.includes(String(val).toLowerCase())) {
            defautsAuto.push({
              vehicle, type,
              description: item.label + ' : ' + val.toUpperCase(),
              reportedBy: values.nom1 || 'Inconnu',
              source: 'checklist',
              defectKey: vehicle + '_' + item.id,
              createdAt: Timestamp.now()
            })
          }
        })
      })

      if (values.remarques && values.remarques.trim().length > 0) {
        defautsAuto.push({
          vehicle, type,
          description: 'Remarque : ' + values.remarques.trim(),
          reportedBy: values.nom1 || 'Inconnu',
          source: 'checklist',
          defectKey: vehicle + '_remarque_' + Date.now(),
          createdAt: Timestamp.now()
        })
      }

      let nbNouveaux = 0
      for (const defaut of defautsAuto) {
        if (defaut.defectKey.includes('_remarque_')) {
          await addDoc(collection(db, 'defects'), defaut)
          nbNouveaux++
          continue
        }
        const existing = await getDocs(query(
          collection(db, 'defects'),
          where('defectKey', '==', defaut.defectKey)
        ))
        if (existing.empty) {
          await addDoc(collection(db, 'defects'), defaut)
          nbNouveaux++
        }
      }

      await addDoc(collection(db, 'checklists'), {
        vehicle, type,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'}),
        submittedBy: values.nom1 || 'Inconnu',
        hasDefects: defautsAuto.length > 0,
        values,
        createdAt: Timestamp.now()
      })

      if (nbNouveaux > 0) {
        alert(nbNouveaux + ' nouveau(x) defaut(s) signale(s) au Garage !')
      } else if (defautsAuto.length > 0) {
        alert('Defauts deja connus dans le Garage — pas de doublon !')
      } else {
        alert('Checklist soumise — aucun defaut !')
      }
      onBack()
    } catch(e) {
      alert('Erreur: ' + e.message)
    }
  }

  const renderItem = (item) => {
    const val = values[item.id] || ''
    const req = item.required ? <span style={{color:red}}> *</span> : null
    let control = null

    if (item.type === 'fuel') {
      const opts = [['full','Plein','green'],['75','3/4','green'],['50','1/2','orange'],['25','1/4','red'],['0','0','red']]
      control = (
        <div style={{display:'flex',gap:'6px'}}>
          {opts.map(([v,label,color]) => (
            <div key={v} onClick={() => set(item.id, v)}
              style={{flex:1,padding:'9px 4px',borderRadius:'9px',textAlign:'center',cursor:'pointer',fontSize:'12px',fontWeight:'700',
                background:val===v?(color==='green'?'rgba(29,185,84,0.15)':color==='orange'?'rgba(255,140,0,0.15)':'rgba(232,25,44,0.15)'):dark3,
                border:'1px solid '+(val===v?(color==='green'?green:color==='orange'?orange:red):border),
                color:val===v?(color==='green'?green:color==='orange'?orange:red):text2
              }}>{label}</div>
          ))}
        </div>
      )
    } else if (['ok_nok','ok_insuf','pneus','propre_sale','vide_pleine','ok_nok_np'].includes(item.type)) {
      const optMap = {
        ok_nok:[['ok','OK','green'],['nok','NOK','red']],
        ok_insuf:[['ok','OK','green'],['insuf','Insuffisant','orange']],
        pneus:[['bon','Bon etat','green'],['usure','Usure','orange'],['remplacer','Remplacer','red']],
        propre_sale:[['propre','Propre','green'],['sale','Sale','red']],
        vide_pleine:[['vide','Vide','green'],['pleine','Pleine','red']],
        ok_nok_np:[['ok','OK','green'],['nok','Defectueux','red'],['np','Absent','purple']],
      }
      control = (
        <div style={{display:'flex',gap:'8px'}}>
          {optMap[item.type].map(([v,label,color]) => (
            <div key={v} onClick={() => set(item.id, v)}
              style={{flex:1,padding:'10px',borderRadius:'9px',textAlign:'center',cursor:'pointer',fontSize:'13px',fontWeight:'700',
                background:val===v?(color==='green'?'rgba(29,185,84,0.12)':color==='orange'?'rgba(255,140,0,0.12)':color==='purple'?'rgba(139,92,246,0.12)':'rgba(232,25,44,0.12)'):dark3,
                border:'1px solid '+(val===v?(color==='green'?green:color==='orange'?orange:color==='purple'?'#8B5CF6':red):border),
                color:val===v?(color==='green'?green:color==='orange'?orange:color==='purple'?'#8B5CF6':red):text2
              }}>{label}</div>
          ))}
        </div>
      )
    } else if (item.type === 'o2') {
      const num = parseInt(val)||0
      const col = num/300>0.5?green:num/300>0.2?orange:red
      control = (
        <div>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:'6px'}}>
            <span style={{fontSize:'12px',color:text2}}>{item.label}</span>
            <span style={{fontSize:'14px',fontWeight:'700',color:col}}>{num} bar</span>
          </div>
         <div style={{position:'relative',height:'28px',display:'flex',alignItems:'center'}}>
  <div style={{position:'absolute',left:0,right:0,height:'4px',borderRadius:'2px',background:'#333'}}/>
  <div style={{position:'absolute',left:0,height:'4px',borderRadius:'2px',background:col,width:((num/300)*100)+'%',transition:'width 0.1s,background 0.3s'}}/>
  <input type="range" min="0" max="300" step="10" value={num}
    onChange={e => set(item.id, e.target.value)}
    style={{position:'relative',width:'100%',WebkitAppearance:'none',appearance:'none',background:'transparent',cursor:'pointer',zIndex:1}}/>
</div>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:'10px',marginTop:'4px'}}>
            <span style={{color:red}}>0</span><span style={{color:text3}}>100</span><span style={{color:text3}}>200</span><span style={{color:green}}>300 bar</span>
          </div>
        </div>
      )
    } else if (item.type === 'date') {
      control = <input type="date" value={val} onChange={e => set(item.id, e.target.value)}
        style={{width:'100%',background:dark3,border:'1px solid '+border,borderRadius:'9px',padding:'10px 12px',color:'#fff',fontSize:'14px',colorScheme:'dark'}}/>
    } else if (item.type === 'number') {
      control = <input type="number" placeholder="Ex: 125430" value={val} onChange={e => set(item.id, e.target.value)}
        style={{width:'100%',background:dark3,border:'1px solid '+border,borderRadius:'9px',padding:'10px 12px',color:'#fff',fontSize:'14px'}}/>
    } else if (item.type === 'textarea') {
      control = <textarea placeholder="Aucune remarque..." value={val} onChange={e => set(item.id, e.target.value)}
        style={{width:'100%',background:dark3,border:'1px solid '+border,borderRadius:'9px',padding:'10px 12px',color:'#fff',fontSize:'14px',minHeight:'80px',resize:'vertical'}}/>
    } else if (item.type === 'text') {
      control = <input type="text" placeholder="Prenom Nom" value={val} onChange={e => set(item.id, e.target.value)}
        style={{width:'100%',background:dark3,border:'1px solid '+border,borderRadius:'9px',padding:'10px 12px',color:'#fff',fontSize:'14px'}}/>
    }

    const hasIssue = val==='nok'||val==='remplacer'||val==='insuf'
    return (
      <div id={'field_' + item.id} key={item.id} style={{background:card,border:'1px solid '+(hasIssue?'rgba(232,25,44,0.3)':border),borderRadius:'12px',padding:'14px',marginBottom:'8px'}}>
        <div style={{fontSize:'14px',fontWeight:'500',marginBottom:'10px'}}>{item.label}{req}</div>
        {control}
      </div>
    )
  }

  return (
    <div style={{paddingBottom:'120px'}}>
      <div style={{padding:'16px'}}>
        <button onClick={onBack} style={{background:card,border:'1px solid '+border,color:'#fff',padding:'8px 16px',borderRadius:'10px',cursor:'pointer',marginBottom:'16px'}}>Retour</button>
        <div style={{fontWeight:'800',fontSize:'26px',color:red}}>{vehicle}</div>
        <div style={{fontSize:'12px',color:text3}}>{new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})}</div>
      </div>
      {template.map(section => (
        <div key={section.section} style={{padding:'0 16px',marginBottom:'8px'}}>
          <div style={{fontSize:'12px',fontWeight:'700',letterSpacing:'2px',color:text3,textTransform:'uppercase',marginBottom:'10px'}}>{section.section}</div>
          {section.items.map(item => renderItem(item))}
        </div>
      ))}
      <div style={{padding:'16px'}}>
        <button onClick={handleSubmit} style={{width:'100%',padding:'16px',background:red,border:'none',borderRadius:'14px',color:'#fff',fontSize:'18px',fontWeight:'800',cursor:'pointer'}}>
          Soumettre la Checklist
        </button>
      </div>
    </div>
  )
}
