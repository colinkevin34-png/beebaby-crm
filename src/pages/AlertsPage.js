import React, { useState } from 'react';
import { STAGES, ALERT_TYPES, fmtDateTime } from '../lib/data';
import { Btn, Modal, Input, Select, EmptyState, Badge } from '../components/UI';

export default function AlertsPage({ alerts, rules, prospects, onDismiss, onAddRule, onUpdateRule, onRemoveRule, onOpenDetail, notify }) {
  const [tab, setTab]           = useState('active');
  const [showNewRule, setShowNewRule] = useState(false);
  const [editRule, setEditRule]  = useState(null);

  const active    = alerts.filter(a=>!a.dismissed);
  const dismissed = alerts.filter(a=>a.dismissed);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', gap:2, borderBottom:'1px solid var(--border)', flex:1 }}>
          {[
            {id:'active',    label:`Alertes actives`,    badge:active.length},
            {id:'history',   label:'Historique'},
            {id:'rules',     label:`Règles paramétrables`, badge:rules.length},
          ].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{ padding:'8px 14px', background:'none', border:'none', cursor:'pointer', fontSize:12, fontWeight:tab===t.id?700:400, color:tab===t.id?'var(--blue)':'var(--text2)', borderBottom:`2px solid ${tab===t.id?'var(--blue)':'transparent'}`, fontFamily:'inherit', display:'flex', alignItems:'center', gap:5 }}>
              {t.label}
              {t.badge>0 && <span style={{ background:t.id==='active'?'var(--red)':'var(--bg4)', color:t.id==='active'?'#fff':'var(--text2)', fontSize:9, fontWeight:700, padding:'1px 5px', borderRadius:8 }}>{t.badge}</span>}
            </button>
          ))}
        </div>
        {tab==='rules' && <Btn variant="primary" size="sm" onClick={()=>setShowNewRule(true)} style={{marginLeft:12}}>+ Nouvelle règle</Btn>}
      </div>

      {tab==='active' && (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {active.length===0
            ? <EmptyState icon="✅" title="Aucune alerte active" sub="Toutes vos relances sont à jour !" />
            : active.map(a=><AlertCard key={a.id} alert={a} prospects={prospects} onDismiss={onDismiss} onOpenDetail={onOpenDetail} />)
          }
        </div>
      )}

      {tab==='history' && (
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {dismissed.length===0
            ? <EmptyState icon="📋" title="Aucun historique" />
            : dismissed.map(a=>(
              <div key={a.id} style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:10, padding:'12px 14px', display:'flex', alignItems:'center', gap:12, opacity:.6 }}>
                <span style={{ fontSize:18 }}>{ALERT_TYPES.find(t=>t.id===a.type)?.icon||'🔔'}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:600, color:'var(--text)' }}>{a.prospectName}</div>
                  <div style={{ fontSize:11, color:'var(--text3)' }}>{a.message}</div>
                </div>
                <span style={{ fontSize:10, color:'var(--text3)' }}>Traité {fmtDateTime(a.dismissedAt)}</span>
              </div>
          ))}
        </div>
      )}

      {tab==='rules' && (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          <div style={{ background:'var(--blue-d)', border:'1px solid var(--blue)', borderRadius:10, padding:'10px 14px', fontSize:12, color:'var(--blue)' }}>
            💡 Ces règles sont vérifiées automatiquement sur tous vos prospects. Quand une condition est remplie, une alerte apparaît dans l'onglet "Alertes actives".
          </div>
          {rules.map(rule=>(
            <RuleCard key={rule.id} rule={rule} onEdit={()=>setEditRule(rule)} onRemove={()=>{if(window.confirm('Supprimer cette règle ?')) onRemoveRule(rule.id);}} onToggle={()=>onUpdateRule(rule.id,{active:!rule.active})} />
          ))}
          {rules.length===0 && <EmptyState icon="⚙" title="Aucune règle configurée" sub="Créez des règles pour automatiser vos relances." action={<Btn variant="primary" onClick={()=>setShowNewRule(true)}>Créer une règle</Btn>} />}
        </div>
      )}

      {(showNewRule || editRule) && (
        <RuleModal
          initial={editRule}
          onClose={()=>{setShowNewRule(false);setEditRule(null);}}
          onSave={async data => {
            if(editRule) { await onUpdateRule(editRule.id, data); notify('Règle mise à jour.'); }
            else         { await onAddRule(data); notify('Règle créée !'); }
            setShowNewRule(false); setEditRule(null);
          }}
        />
      )}
    </div>
  );
}

function AlertCard({ alert:a, prospects, onDismiss, onOpenDetail }) {
  const p = prospects.find(pr=>pr.id===a.prospectId);
  const typeInfo = ALERT_TYPES.find(t=>t.id===a.type)||{icon:'🔔',color:'var(--blue)'};
  return (
    <div style={{ background:'var(--bg3)', border:`1px solid ${a.priority==='high'?'var(--red)':'var(--border)'}`, borderRadius:12, padding:'14px 16px', display:'flex', alignItems:'flex-start', gap:12, animation:'fadeIn .2s ease' }}>
      <div style={{ width:36, height:36, borderRadius:'50%', background:typeInfo.color+'22', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>{typeInfo.icon}</div>
      <div style={{ flex:1 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
          <span style={{ fontSize:13, fontWeight:700, color:'var(--text)' }}>{a.prospectName}</span>
          {a.entreprise && <span style={{ fontSize:11, color:'var(--text3)' }}>— {a.entreprise}</span>}
          <span style={{ fontSize:9, fontWeight:700, padding:'2px 6px', borderRadius:6, background:a.priority==='high'?'var(--red-d)':'var(--orange-d)', color:a.priority==='high'?'var(--red)':'var(--orange)' }}>
            {a.priority==='high'?'URGENT':'NORMAL'}
          </span>
        </div>
        <div style={{ fontSize:12, color:'var(--text2)', marginBottom:8 }}>{a.message}</div>
        <div style={{ fontSize:10, color:'var(--text3)' }}>{fmtDateTime(a.createdAt?.toDate?.()?.toISOString()||a.createdAt)}</div>
      </div>
      <div style={{ display:'flex', gap:6, flexShrink:0 }}>
        {p && <Btn size="sm" onClick={()=>onOpenDetail(p)}>Voir fiche</Btn>}
        <Btn size="sm" variant="success" onClick={()=>onDismiss(a.id)}>✓ Traité</Btn>
      </div>
    </div>
  );
}

function RuleCard({ rule, onEdit, onRemove, onToggle }) {
  const typeInfo = ALERT_TYPES.find(t=>t.id===rule.type)||{icon:'🔔',color:'var(--blue)',label:rule.type};
  return (
    <div style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:12, padding:'13px 16px', display:'flex', alignItems:'center', gap:12 }}>
      <div style={{ width:34, height:34, borderRadius:'50%', background:typeInfo.color+'22', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, flexShrink:0 }}>{typeInfo.icon}</div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>{rule.label || typeInfo.label}</div>
        <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>
          {rule.type==='no_contact' && `Sans contact depuis ${rule.days||7} jours`}
          {rule.type==='stage_time' && `En étape "${rule.stage||'toutes'}" depuis ${rule.days||14} jours`}
          {rule.type==='follow_up'  && `Email sans réponse depuis ${rule.days||3} jours`}
          {rule.type==='manual'     && rule.description}
        </div>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <div onClick={onToggle} style={{ width:36, height:20, borderRadius:10, background:rule.active?'var(--green)':'var(--bg5)', cursor:'pointer', position:'relative', transition:'background .2s', flexShrink:0 }}>
          <div style={{ width:14, height:14, borderRadius:'50%', background:'#fff', position:'absolute', top:3, left:rule.active?18:3, transition:'left .2s' }} />
        </div>
        <span style={{ fontSize:11, color:rule.active?'var(--green)':'var(--text3)', fontWeight:600 }}>{rule.active?'Active':'Inactive'}</span>
        <Btn size="sm" onClick={onEdit}>✏</Btn>
        <Btn size="sm" variant="danger" onClick={onRemove}>✕</Btn>
      </div>
    </div>
  );
}

function RuleModal({ initial, onClose, onSave }) {
  const [type,  setType]  = useState(initial?.type  || 'no_contact');
  const [label, setLabel] = useState(initial?.label || '');
  const [days,  setDays]  = useState(initial?.days  || 7);
  const [stage, setStage] = useState(initial?.stage || '');
  const [desc,  setDesc]  = useState(initial?.description || '');

  return (
    <Modal title={initial ? 'Modifier la règle' : 'Nouvelle règle d\'alerte'} onClose={onClose} width={480}
      footer={<>
        <Btn onClick={onClose}>Annuler</Btn>
        <Btn variant="primary" onClick={()=>onSave({type,label,days:parseInt(days),stage,description:desc,active:true})}>
          {initial?'Enregistrer':'Créer la règle'}
        </Btn>
      </>}
    >
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        <div>
          <div style={{ fontSize:11, fontWeight:600, color:'var(--text3)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.4px' }}>Type d'alerte</div>
          <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
            {ALERT_TYPES.map(t=>(
              <label key={t.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:8, background:type===t.id?t.color+'15':'var(--bg4)', border:`1px solid ${type===t.id?t.color:'var(--border)'}`, cursor:'pointer', transition:'all .14s' }}>
                <input type="radio" name="type" value={t.id} checked={type===t.id} onChange={()=>setType(t.id)} style={{ accentColor:t.color }} />
                <span style={{ fontSize:16 }}>{t.icon}</span>
                <span style={{ fontSize:12, fontWeight:type===t.id?600:400, color:type===t.id?t.color:'var(--text2)' }}>{t.label}</span>
              </label>
            ))}
          </div>
        </div>

        <Input label="Nom de la règle (optionnel)" value={label} onChange={e=>setLabel(e.target.value)} placeholder="ex: Relance urgente prospects chauds" />

        {['no_contact','stage_time','follow_up'].includes(type) && (
          <div>
            <div style={{ fontSize:11, fontWeight:600, color:'var(--text3)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.4px' }}>Délai déclencheur</div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <input type="number" min={1} max={365} value={days} onChange={e=>setDays(e.target.value)} style={{ width:80, padding:'8px 11px', background:'var(--bg4)', border:'1px solid var(--border2)', borderRadius:8, color:'var(--text)', fontSize:13, outline:'none', fontFamily:'inherit', textAlign:'center' }} />
              <span style={{ fontSize:13, color:'var(--text2)' }}>jours</span>
            </div>
          </div>
        )}

        {type==='stage_time' && (
          <Select label="Étape concernée (laissez vide = toutes)" value={stage} onChange={e=>setStage(e.target.value)}>
            <option value="">Toutes les étapes</option>
            {STAGES.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
          </Select>
        )}

        {type==='manual' && (
          <Input label="Description du rappel" value={desc} onChange={e=>setDesc(e.target.value)} placeholder="ex: Appeler avant fin de mois" />
        )}
      </div>
    </Modal>
  );
}
