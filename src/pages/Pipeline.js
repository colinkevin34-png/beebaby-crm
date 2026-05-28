import React, { useState } from 'react';
import { STAGES, getAvatar, fmtAmount } from '../lib/data';
import { Avatar, StagePill, SectorTag, PriorityDot } from '../components/UI';

export default function Pipeline({ prospects, onUpdate, onOpenDetail, onAdd }) {
  const [dragging, setDragging] = useState(null);
  const [over, setOver]         = useState(null);

  const drop = stageId => {
    if (dragging) onUpdate(dragging.id, { stage: stageId, stageChangedAt: new Date().toISOString() });
    setDragging(null); setOver(null);
  };

  return (
    <div style={{ display:'flex', gap:12, overflowX:'auto', paddingBottom:8, alignItems:'flex-start', minHeight:400 }}>
      {STAGES.map(stage => {
        const cards = prospects.filter(p => p.stage===stage.id);
        const total = cards.reduce((s,p)=>s+p.montant,0);
        return (
          <div key={stage.id} style={{ width:232, flexShrink:0 }}
            onDragOver={e=>{e.preventDefault();setOver(stage.id)}}
            onDragLeave={()=>setOver(null)}
            onDrop={()=>drop(stage.id)}
          >
            <div style={{ padding:'7px 10px', background:stage.dim, borderRadius:'10px 10px 0 0', display:'flex', alignItems:'center', gap:7, marginBottom:8 }}>
              <span style={{ width:8, height:8, borderRadius:'50%', background:stage.color, flexShrink:0 }} />
              <span style={{ fontSize:11, fontWeight:700, color:stage.color, flex:1 }}>{stage.label}</span>
              <span style={{ fontSize:10, color:stage.color, opacity:.8 }}>{cards.length} · {fmtAmount(total)}</span>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:7, minHeight:60, padding:3, borderRadius:8, background: over===stage.id ? stage.dim : 'transparent', transition:'background .15s' }}>
              {cards.map((p,i) => <KCard key={p.id} prospect={p} stage={stage} idx={prospects.indexOf(p)} onOpen={onOpenDetail} onDragStart={()=>setDragging(p)} />)}
              <button onClick={onAdd} style={{ padding:'7px', border:'1px dashed var(--border2)', borderRadius:8, background:'transparent', color:'var(--text3)', fontSize:11, cursor:'pointer', fontFamily:'inherit', transition:'all .14s' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=stage.color;e.currentTarget.style.color=stage.color;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border2)';e.currentTarget.style.color='var(--text3)';}}
              >+ Ajouter</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function KCard({ prospect:p, stage, idx, onOpen, onDragStart }) {
  const [hov, setHov] = useState(false);
  return (
    <div draggable onDragStart={onDragStart} onClick={()=>onOpen(p)}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ background:'var(--bg3)', border:`1px solid ${hov?stage.color+'55':'var(--border)'}`, borderRadius:10, padding:'11px 12px', cursor:'pointer', transition:'all .15s', transform:hov?'translateY(-1px)':'none' }}
    >
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:7 }}>
        <Avatar prospect={p} index={idx} size={26} />
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:12, fontWeight:600, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.prenom} {p.nom}</div>
          <div style={{ fontSize:10, color:'var(--text3)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.entreprise}</div>
        </div>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:5, flexWrap:'wrap' }}>
        <SectorTag sector={p.secteur} />
        <PriorityDot priorite={p.priorite} />
        <span style={{ marginLeft:'auto', fontSize:11, fontWeight:700, color:'var(--text2)', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{fmtAmount(p.montant)}</span>
      </div>
    </div>
  );
}
