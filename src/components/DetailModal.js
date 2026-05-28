import React, { useState } from 'react';
import { STAGES, fmtAmount, fmtDate } from '../lib/data';
import { Avatar, StagePill, SectorTag, PriorityDot, Modal, Btn, Textarea } from './UI';
import ProspectModal from './ProspectModal';

export default function DetailModal({ prospect:p, allProspects, onClose, onUpdate, onDelete, onCompose, notify }) {
  const [editing, setEditing]       = useState(false);
  const [notes, setNotes]           = useState(p.notes||'');
  const [editingNotes, setEditNotes]= useState(false);
  const idx = allProspects.findIndex(x=>x.id===p.id);

  if(editing) return (
    <ProspectModal initial={p} onClose={()=>setEditing(false)} onSave={async data => {
      await onUpdate(p.id, data); setEditing(false); notify('Prospect mis à jour.');
    }} />
  );

  return (
    <Modal title="Fiche prospect" onClose={onClose} width={520}
      footer={<>
        <Btn variant="danger" size="sm" onClick={()=>{ if(window.confirm('Supprimer ?')){ onDelete(p.id); onClose(); } }}>Supprimer</Btn>
        <div style={{ flex:1 }} />
        <Btn size="sm" onClick={()=>{ onCompose(p); onClose(); }}>✉ Email</Btn>
        <Btn size="sm" onClick={()=>setEditing(true)}>✏ Modifier</Btn>
        <Btn size="sm" onClick={onClose}>Fermer</Btn>
      </>}
    >
      <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:18, padding:14, background:'var(--bg4)', borderRadius:10 }}>
        <Avatar prospect={p} index={idx} size={46} />
        <div style={{ flex:1 }}>
          <div style={{ fontSize:17, fontWeight:700, color:'var(--text)', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{p.prenom} {p.nom}</div>
          <div style={{ fontSize:13, color:'var(--text2)', marginTop:2 }}>{p.entreprise}</div>
          <div style={{ display:'flex', gap:6, marginTop:6 }}><SectorTag sector={p.secteur} /><PriorityDot priorite={p.priorite} /></div>
        </div>
        <StagePill stageId={p.stage} />
      </div>

      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13, marginBottom:16 }}>
        {[['Email',p.email||'—',true],['Téléphone',p.tel||'—',false],['Montant',p.montant?p.montant.toLocaleString('fr-FR')+'€':'—',false],['Ajouté le',fmtDate(p.createdAt?.toDate?.()?.toISOString()||p.createdAt),false]].map(([l,v,blue])=>(
          <tr key={l} style={{ borderBottom:'1px solid var(--border)' }}>
            <td style={{ padding:'9px 0', color:'var(--text3)', fontWeight:500, width:'40%' }}>{l}</td>
            <td style={{ padding:'9px 0', color:blue?'var(--blue)':'var(--text)', fontWeight:500 }}>{v}</td>
          </tr>
        ))}
      </table>

      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:11, fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'.4px', marginBottom:8 }}>Changer l'étape</div>
        <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
          {STAGES.map(s=>(
            <button key={s.id} onClick={()=>{ onUpdate(p.id,{stage:s.id, stageChangedAt:new Date().toISOString()}); notify('Étape mise à jour.'); }}
              style={{ padding:'5px 11px', borderRadius:8, fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:'inherit', border:`1px solid ${p.stage===s.id?s.color:'var(--border)'}`, background:p.stage===s.id?s.dim:'transparent', color:p.stage===s.id?s.color:'var(--text3)', transition:'all .14s' }}
            >{s.label}</button>
          ))}
        </div>
      </div>

      <div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
          <div style={{ fontSize:11, fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'.4px' }}>Notes</div>
          <button onClick={()=>setEditNotes(!editingNotes)} style={{ background:'none', border:'none', color:'var(--blue)', cursor:'pointer', fontSize:12, fontFamily:'inherit' }}>{editingNotes?'Annuler':'Modifier'}</button>
        </div>
        {editingNotes ? (
          <div>
            <Textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={4} placeholder="Notes..." />
            <div style={{ display:'flex', justifyContent:'flex-end', marginTop:6 }}>
              <Btn variant="success" size="sm" onClick={()=>{ onUpdate(p.id,{notes}); setEditNotes(false); notify('Notes sauvegardées.'); }}>💾 Sauvegarder</Btn>
            </div>
          </div>
        ) : (
          <div style={{ padding:'10px 12px', background:'var(--bg4)', borderRadius:8, fontSize:13, color:notes?'var(--text2)':'var(--text3)', lineHeight:1.6, minHeight:50 }}>{notes||'Aucune note.'}</div>
        )}
      </div>
    </Modal>
  );
}
