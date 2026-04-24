

function CarteVehicule({ vehicle, items, resolve, compact }) {
  const [currentIdx, setCurrentIdx] = useState(0)

  useEffect(() => {
    if (items.length <= 1) return
    const interval = setInterval(() => {
      setCurrentIdx(prev => (prev + 1) % items.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [items.length])

  const d = items[currentIdx]

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
          {currentIdx + 1}/{items.length} defaut{items.length > 1 ? 's' : ''}
        </span>
      </div>

      <div style={{flex:1,display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
        <div style={{
          background: dark3,
          borderRadius: '8px',
          padding: compact ? '8px 10px' : '10px 12px',
          borderLeft: '3px solid ' + red,
          flex:1,
          display:'flex',
          flexDirection:'column',
          justifyContent:'space-between'
        }}>
          <div style={{
            fontSize: compact ? '13px' : '15px',
            fontWeight:'600',
            marginBottom:'8px',
            wordBreak:'break-word',
            lineHeight:'1.4',
            overflowY:'auto',
            flex:1
          }}>{d.description}</div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0}}>
            <div style={{fontSize:'11px',color:text3}}>
              👤 {d.reportedBy}
              {d.source === 'checklist' && <span style={{color:orange,marginLeft:'4px'}}>⚡</span>}
              {d.source === 'manuel' && <span style={{color:text2,marginLeft:'4px'}}>✍️</span>}
            </div>
            <button onClick={() => resolve(d.id)}
              style={{padding: compact ? '4px 10px' : '6px 14px',background:green,border:'none',borderRadius:'6px',color:'#fff',fontSize: compact ? '12px' : '13px',fontWeight:'700',cursor:'pointer'}}>
              Resolu
            </button>
          </div>
        </div>

        {items.length > 1 && (
          <div style={{display:'flex',justifyContent:'center',gap:'6px',marginTop:'8px',flexShrink:0}}>
            {items.map((_, i) => (
              <div key={i} onClick={() => setCurrentIdx(i)} style={{
                width:'8px',height:'8px',borderRadius:'50%',
                background: i === currentIdx ? red : text3,
                cursor:'pointer'
              }}/>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
