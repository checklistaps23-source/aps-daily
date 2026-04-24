

import { useState, useEffect, useRef } from 'react'
import { db } from './firebase'
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore'

const red = '#E8192C'
const card = '#1E2330'
const dark3 = '#1A1E28'
const dark = '#0D0F14'
const border = 'rgba(255,255,255,0.07)'
const text2 = '#8B90A0'
const text3 = '#555B6E'
const green = '#1DB954'
const orange = '#FF8C00'

function CarteVehicule({ vehicle, items, resolve, compact }) {
  const scrollRef = useRef(null)

  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const el = scrollRef.current
        const maxScroll = el.scrollHeight - el.clientHeight
        if (maxScroll <= 0) return
        if (el.scrollTop >= maxScroll - 10) {
          el.scrollTo({ top: 0, behavior: 'smooth' })
        } else {
          el.scrollBy({ top: 150, behavior: 'smooth' })
        }
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{
      background: card,
      border: '2px solid rgba(232,25,44,0.4)',
      borderRadius: '14px',
      padding: compact ? '8px' : '12px',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      height: '100%'
    }}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px',flexShrink:0}}>
        <span style={{fontWeight:'900',fontSize: compact ? '16px' : '20px'}}>{vehicle}</span>
        <span style={{background:'rgba(232,25,44,0.15)',color:red,padding:'2px 8px',borderRadius:'6px',fontSize: compact ? '11px' : '12px',fontWeight:'700'}}>
          {items.length} defaut{items.length > 1 ? 's' : ''}
        </span>
      </div>

      <div ref={scrollRef} style={{
        flex:1,
        overflowY:'auto',
        display:'flex',
        flexDirection:'column',
        gap:'6px',
        scrollbarWidth:'none',
        msOverflowStyle:'none'
      }}>
        {items.map((d) => (
          <div key={d.id} style={{
            background: dark3,
            borderRadius: '8px',
            padding: compact ? '6px 8px' : '8px 10px',
            borderLeft: '3px solid ' + red,
            flexShrink: 0
          }}>
            <div style={{
              fontSize: compact ? '12px' : '14px',
              fontWeight:'600',
              marginBottom:'6px',
              wordBreak:'break-word',
              lineHeight:'1.4',
              whiteSpace:'pre-wrap'
            }}>{d.description}</div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{fontSize:'11px',color:text3}}>
                👤 {d.reportedBy}
                {d.source === 'checklist' && <span style={{color:orange,marginLeft:'4px'}}>⚡</span>}
                {d.source === 'manuel' && <span style={{color:text2,marginLeft:'4px'}}>✍️</span>}
              </div>
              <button onClick={() => resolve(d.id)}
                style={{padding: compact ? '3px 8px' : '5px 12px',background:green,border:'none',borderRadius:'6px',color:'#fff',fontSize: compact ? '11px' : '12px',fontWeight:'700',cursor:'pointer',flexShrink:0}}>
                Resolu
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Garage() {
  const [defects, setDefects] = useState([])
  const [tvMode, setTvMode] = useState(false)

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'defects'), snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      data.sort((a,b) => b.createdAt?.seconds - a.createdAt?.seconds)
      setDefects(data)
    })
    return () => unsub()
  }, [])

  const resolve = async (id) => {
    await deleteDoc(doc(db, 'defects', id))
  }

  const formatDate = (ts) => {
    if (!ts) return ''
    return new Date(ts.seconds * 1000).toLocaleDateString('fr-FR', {
      day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'
    })
  }

  const grouped = {}
  defects.forEach(d => {
    if (!grouped[d.vehicle]) grouped[d.vehicle] = []
    grouped[d.vehicle].push(d)
  })

  const openCount = defects.length
  const vehiculesTouches = Object.keys(grouped).length

  if (tvMode) {
    const cols = vehiculesTouches <= 1 ? 1
      : vehiculesTouches <= 4 ? 2
      : vehiculesTouches <= 9 ? 3
      : 4
    const compact = vehiculesTouches > 6

    return (
      <div style={{
        position:'fixed',top:0,left:0,right:0,bottom:0,
        background:dark,
        display:'flex',flexDirection:'column',
        zIndex:999,
        padding:'12px'
      }}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'10px',flexShrink:0}}>
          <div style={{display:'flex',alignItems:'center',gap:'14px'}}>
            <div style={{fontSize:'22px',fontWeight:'900',color:red}}>🔧 GARAGE</div>
            <div style={{background:'rgba(232,25,44,0.1)',border:'1px solid rgba(232,25,44,0.3)',borderRadius:'10px',padding:'3px 10px'}}>
              <span style={{fontSize:'16px',fontWeight:'900',color:red}}>{openCount}</span>
              <span style={{fontSize:'11px',color:text3,marginLeft:'6px'}}>defauts</span>
            </div>
            <div style={{background:'rgba(255,140,0,0.1)',border:'1px solid rgba(255,140,0,0.3)',borderRadius:'10px',padding:'3px 10px'}}>
              <span style={{fontSize:'16px',fontWeight:'900',color:orange}}>{vehiculesTouches}</span>
              <span style={{fontSize:'11px',color:text3,marginLeft:'6px'}}>vehicules</span>
            </div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
            <div style={{fontSize:'11px',color:text3}}>
              {new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})}
            </div>
            <button onClick={() => setTvMode(false)}
              style={{padding:'5px 10px',background:'transparent',border:'1px solid '+border,borderRadius:'8px',color:text2,fontSize:'11px',cursor:'pointer'}}>
              Quitter TV
            </button>
          </div>
        </div>

        {defects.length === 0 ? (
          <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
            <div style={{fontSize:'80px',marginBottom:'20px'}}>✅</div>
            <div style={{fontSize:'28px',fontWeight:'700',color:green}}>Aucun defaut en cours</div>
          </div>
        ) : (
          <div style={{
            flex:1,
            display:'grid',
            gridTemplateColumns:`repeat(${cols},1fr)`,
            gridAutoRows:`${Math.floor(100/Math.ceil(vehiculesTouches/cols))}%`,
            gap:'10px',
            overflow:'hidden'
          }}>
            {Object.entries(grouped).map(([vehicle, items]) => (
              <CarteVehicule
                key={vehicle}
                vehicle={vehicle}
                items={items}
                resolve={resolve}
                formatDate={formatDate}
                compact={compact}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  // VUE NORMALE
  return (
    <div style={{paddingBottom:'100px'}}>
      <div style={{padding:'16px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
          <h2 style={{color:red}}>Garage</h2>
          <button onClick={() => setTvMode(true)}
            style={{padding:'8px 16px',background:'rgba(232,25,44,0.1)',border:'1px solid rgba(232,25,44,0.3)',borderRadius:'10px',color:red,fontSize:'13px',fontWeight:'700',cursor:'pointer'}}>
            📺 Mode TV
          </button>
        </div>

        <div style={{display:'flex',gap:'10px',marginBottom:'20px'}}>
          <div style={{flex:1,background:'rgba(232,25,44,0.1)',border:'1px solid rgba(232,25,44,0.3)',borderRadius:'12px',padding:'12px 16px'}}>
            <div style={{fontSize:'32px',fontWeight:'900',color:red}}>{openCount}</div>
            <div style={{fontSize:'12px',color:text3}}>Defauts actifs</div>
          </div>
          <div style={{flex:1,background:'rgba(255,140,0,0.1)',border:'1px solid rgba(255,140,0,0.3)',borderRadius:'12px',padding:'12px 16px'}}>
            <div style={{fontSize:'32px',fontWeight:'900',color:orange}}>{vehiculesTouches}</div>
            <div style={{fontSize:'12px',color:text3}}>Vehicules touches</div>
          </div>
        </div>

        {defects.length === 0 && (
          <div style={{textAlign:'center',padding:'48px',color:text3}}>
            <div style={{fontSize:'48px',marginBottom:'12px'}}>✅</div>
            <p>Aucun defaut en cours</p>
          </div>
        )}

        {Object.entries(grouped).map(([vehicle, items]) => (
          <div key={vehicle} style={{background:card,border:'1px solid rgba(232,25,44,0.3)',borderRadius:'16px',padding:'16px',marginBottom:'14px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
              <span style={{background:dark3,borderRadius:'8px',padding:'4px 12px',fontWeight:'800',fontSize:'16px'}}>{vehicle}</span>
              <span style={{padding:'4px 10px',borderRadius:'8px',fontSize:'12px',fontWeight:'700',background:'rgba(232,25,44,0.15)',color:red}}>
                {items.length} defaut{items.length > 1 ? 's' : ''}
              </span>
            </div>
            {items.map((d, idx) => (
              <div key={d.id} style={{borderTop:idx>0?'1px solid '+border:'none',paddingTop:idx>0?'10px':'0',marginTop:idx>0?'10px':'0'}}>
                <div style={{fontSize:'14px',fontWeight:'600',marginBottom:'4px',wordBreak:'break-word'}}>{d.description}</div>
                <div style={{fontSize:'12px',color:text3,display:'flex',gap:'12px',flexWrap:'wrap',marginBottom:'8px'}}>
                  <span>👤 {d.reportedBy}</span>
                  <span>📅 {formatDate(d.createdAt)}</span>
                  {d.source === 'checklist' && <span style={{color:orange}}>⚡ Via checklist</span>}
                </div>
                <button onClick={() => resolve(d.id)}
                  style={{width:'100%',padding:'10px',background:green,border:'none',borderRadius:'10px',color:'#fff',fontSize:'14px',fontWeight:'700',cursor:'pointer'}}>
                  Probleme resolu
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
