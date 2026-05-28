import React from 'react';

const NAV = [
  { id:'dashboard',  label:'Tableau de bord', icon:'⊞' },
  { id:'pipeline',   label:'Pipeline',         icon:'⠿' },
  { id:'contacts',   label:'Contacts',         icon:'⊙' },
  { id:'email',      label:'Email',            icon:'✉' },
  { id:'alerts',     label:'Alertes & Relances',icon:'🔔' },
  { id:'activities', label:'Activités',        icon:'⏱' },
  { id:'settings',   label:'Paramètres',       icon:'⚙' },
];

export default function Sidebar({ page, onNavigate, alertCount, unreadCount, prospectsCount }) {
  return (
    <aside style={{ width:216, background:'var(--bg2)', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', flexShrink:0 }}>
      <div style={{ padding:'18px 16px 14px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:34, height:34, borderRadius:10, background:'linear-gradient(135deg,#4f8ef7,#9b6dff)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>🐝</div>
        <div>
          <div style={{ fontSize:13, fontWeight:700, color:'var(--text)', fontFamily:"'Plus Jakarta Sans',sans-serif", letterSpacing:'-.2px' }}>BeeBaby CRM</div>
          <div style={{ fontSize:10, color:'var(--text3)', marginTop:1 }}>{prospectsCount} prospects</div>
        </div>
      </div>

      <nav style={{ flex:1, padding:'10px 8px', display:'flex', flexDirection:'column', gap:1, overflowY:'auto' }}>
        {NAV.map(item => {
          const active = page === item.id;
          const badge = item.id==='alerts' ? alertCount : item.id==='email' ? unreadCount : 0;
          return (
            <button key={item.id} onClick={() => onNavigate(item.id)} style={{
              display:'flex', alignItems:'center', gap:9, padding:'8px 10px',
              borderRadius:8, border:'none', background: active ? 'var(--blue-d2)' : 'transparent',
              color: active ? 'var(--blue)' : 'var(--text2)', fontSize:12, fontWeight: active ? 600 : 400,
              width:'100%', textAlign:'left', cursor:'pointer', fontFamily:'inherit',
              transition:'all .13s',
            }}
              onMouseEnter={e => { if(!active) e.currentTarget.style.background='var(--bg4)'; }}
              onMouseLeave={e => { if(!active) e.currentTarget.style.background='transparent'; }}
            >
              <span style={{ fontSize:15, opacity: active ? 1 : .65, width:18, textAlign:'center' }}>{item.icon}</span>
              <span style={{ flex:1 }}>{item.label}</span>
              {badge > 0 && (
                <span style={{ background: item.id==='alerts' ? 'var(--red)' : 'var(--blue)', color:'#fff', fontSize:9, fontWeight:700, padding:'1px 5px', borderRadius:8, minWidth:16, textAlign:'center' }}>
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
              {item.id==='alerts' && alertCount===0 && <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--green)' }} />}
            </button>
          );
        })}
      </nav>

      <div style={{ padding:'12px 14px', borderTop:'1px solid var(--border)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:28, height:28, borderRadius:'50%', background:'rgba(251,191,36,.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'var(--yellow)' }}>B</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:11, fontWeight:600, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>BeeBaby</div>
            <div style={{ fontSize:10, color:'var(--text3)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>beebaby.microcreche@gmail.com</div>
          </div>
          <span style={{ width:7, height:7, borderRadius:'50%', background:'var(--green)', flexShrink:0 }} />
        </div>
      </div>
    </aside>
  );
}
