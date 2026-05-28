import React, { useState } from 'react';
import { STAGES, getAvatar, fmtAmount, fmtDate } from '../lib/data';
import { Avatar, StagePill, SectorTag, PriorityDot, Btn, Input, Select } from '../components/UI';

export default function Contacts({ prospects, onUpdate, onDelete, onOpenDetail, onAdd }) {
  const [search, setSearch]   = useState('');
  const [fStage, setFStage]   = useState('');
  const [fPrio, setFPrio]     = useState('');
  const [sort, setSort]       = useState('createdAt');

  const filtered = prospects
    .filter(p => {
      const q = search.toLowerCase();
      return (!q || `${p.prenom} ${p.nom} ${p.entreprise} ${p.email}`.toLowerCase().includes(q))
          && (!fStage || p.stage === fStage)
          && (!fPrio  || p.priorite === fPrio);
    })
    .sort((a,b) => sort==='montant' ? b.montant-a.montant : sort==='nom' ? a.nom.localeCompare(b.nom) : 0);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
        <div style={{ flex:1, minWidth:180, position:'relative' }}>
          <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--text3)', fontSize:13 }}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher..."
            style={{ width:'100%', padding:'8px 10px 8px 30px', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text)', fontSize:12, outline:'none', fontFamily:'inherit' }} />
        </div>
        {[
          { value:fStage, onChange:setFStage, options:[['','Toutes étapes'],...STAGES.map(s=>[s.id,s.label])] },
          { value:fPrio,  onChange:setFPrio,  options:[['','Toutes priorités'],['Haute','Haute'],['Moyenne','Moyenne'],['Faible','Faible']] },
          { value:sort,   onChange:setSort,   options:[['createdAt','Plus récents'],['montant','Montant ↓'],['nom','Nom A→Z']] },
        ].map((sel,i) => (
          <select key={i} value={sel.value} onChange={e=>sel.onChange(e.target.value)} style={{ padding:'8px 10px', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text2)', fontSize:12, outline:'none', fontFamily:'inherit', cursor:'pointer' }}>
            {sel.options.map(([v,l])=><option key={v} value={v}>{l}</option>)}
          </select>
        ))}
        <span style={{ fontSize:11, color:'var(--text3)' }}>{filtered.length} résultat{filtered.length>1?'s':''}</span>
        <Btn variant="primary" onClick={onAdd} size="sm">+ Nouveau</Btn>
      </div>

      <div style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ background:'var(--bg4)', borderBottom:'1px solid var(--border)' }}>
              {['Contact','Entreprise','Secteur','Étape','Priorité','Montant','Ajouté',''].map((h,i)=>(
                <th key={i} style={{ padding:'9px 12px', textAlign:'left', fontSize:10, fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'.4px', whiteSpace:'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p,i)=>(
              <tr key={p.id} style={{ borderBottom:'1px solid var(--border)', cursor:'pointer', transition:'background .1s' }}
                onMouseEnter={e=>e.currentTarget.style.background='var(--bg4)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                onClick={()=>onOpenDetail(p)}
              >
                <td style={{ padding:'10px 12px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                    <Avatar prospect={p} index={prospects.indexOf(p)} />
                    <div>
                      <div style={{ fontSize:12, fontWeight:600, color:'var(--text)' }}>{p.prenom} {p.nom}</div>
                      <div style={{ fontSize:10, color:'var(--text3)' }}>{p.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding:'10px 12px', fontSize:12, color:'var(--text2)' }}>{p.entreprise}</td>
                <td style={{ padding:'10px 12px' }}><SectorTag sector={p.secteur} /></td>
                <td style={{ padding:'10px 12px' }}><StagePill stageId={p.stage} /></td>
                <td style={{ padding:'10px 12px' }}><PriorityDot priorite={p.priorite} /></td>
                <td style={{ padding:'10px 12px', fontSize:12, fontWeight:700, color:'var(--text)', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{p.montant?p.montant.toLocaleString('fr-FR')+'€':'—'}</td>
                <td style={{ padding:'10px 12px', fontSize:11, color:'var(--text3)' }}>{fmtDate(p.createdAt?.toDate?.()?.toISOString()||p.createdAt)}</td>
                <td style={{ padding:'10px 12px' }} onClick={e=>e.stopPropagation()}>
                  <button onClick={()=>{ if(window.confirm('Supprimer ?')) onDelete(p.id); }}
                    style={{ padding:'4px 8px', background:'transparent', border:'1px solid var(--border)', borderRadius:6, color:'var(--red)', cursor:'pointer', fontSize:12, fontFamily:'inherit' }}
                    onMouseEnter={e=>e.currentTarget.style.background='var(--red-d)'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                  >✕</button>
                </td>
              </tr>
            ))}
            {filtered.length===0 && (
              <tr><td colSpan={8} style={{ padding:40, textAlign:'center', color:'var(--text3)', fontSize:13 }}>Aucun prospect trouvé</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
