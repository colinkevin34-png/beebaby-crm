import React, { useState, useCallback } from 'react';
import { useProspects, useEmails, useAlerts, useAlertRules, useActivities } from './hooks/useFirestore';
import { useAlertEngine } from './hooks/useAlertEngine';
import Sidebar from './components/Sidebar';
import DetailModal from './components/DetailModal';
import ProspectModal from './components/ProspectModal';
import Dashboard from './pages/Dashboard';
import Pipeline from './pages/Pipeline';
import Contacts from './pages/Contacts';
import EmailModule from './pages/EmailModule';
import AlertsPage from './pages/AlertsPage';
import { ActivitiesPage, SettingsPage } from './pages/Other';

export default function App() {
  const [page, setPage]             = useState('dashboard');
  const [showAdd, setShowAdd]       = useState(false);
  const [detail, setDetail]         = useState(null);
  const [toast, setToast]           = useState(null);

  const { prospects, loading:lP, add:addP, update:updP, remove:delP } = useProspects();
  const { emails,    loading:lE, addEmail, markRead }                 = useEmails();
  const { alerts,    addAlert, dismissAlert, removeAlert }            = useAlerts();
  const { rules,     addRule, updateRule, removeRule }                = useAlertRules();
  const { activities, log }                                           = useActivities();

  useAlertEngine({ prospects, emails, rules, alerts, addAlert, log });

  const notify = useCallback((msg, type='success') => {
    setToast({msg,type});
    setTimeout(()=>setToast(null), 3500);
  },[]);

  const handleAddProspect = async data => {
    try {
      await addP({...data, createdAt: new Date().toISOString(), lastContactAt: null});
      setShowAdd(false);
      await log('prospect', `Nouveau prospect : ${data.prenom} ${data.nom} (${data.entreprise})`);
      notify('Prospect ajouté !');
    } catch(e) { notify('Erreur ajout.','error'); }
  };

  const handleUpdateProspect = async (id, updates) => {
    try {
      await updP(id, updates);
      if(detail?.id===id) setDetail(p=>({...p,...updates}));
      if(updates.stage) await log('stage', `Étape modifiée → ${updates.stage}`, id);
    } catch(e) { notify('Erreur mise à jour.','error'); }
  };

  const handleDeleteProspect = async id => {
    try {
      await delP(id);
      if(detail?.id===id) setDetail(null);
      notify('Prospect supprimé.');
    } catch(e) { notify('Erreur suppression.','error'); }
  };

  const handleSendEmail = async data => {
    try {
      await addEmail(data);
      if(data.prospectId) await updP(data.prospectId, {lastContactAt: new Date().toISOString()});
      await log('email', `Email envoyé à ${data.to} — "${data.subject}"`, data.prospectId||null);
    } catch(e) {}
  };

  const activeAlertCount = alerts.filter(a=>!a.dismissed).length;
  const unreadCount      = emails.filter(e=>e.type==='inbox'&&!e.read).length;

  if(lP||lE) return <LoadingScreen />;

  const pages = {
    dashboard:  <Dashboard  prospects={prospects} emails={emails} alerts={alerts} onOpenDetail={setDetail} onNavigate={setPage} />,
    pipeline:   <Pipeline   prospects={prospects} onUpdate={handleUpdateProspect} onOpenDetail={setDetail} onAdd={()=>setShowAdd(true)} />,
    contacts:   <Contacts   prospects={prospects} onUpdate={handleUpdateProspect} onDelete={handleDeleteProspect} onOpenDetail={setDetail} onAdd={()=>setShowAdd(true)} />,
    email:      <EmailModule prospects={prospects} emails={emails} onSendEmail={handleSendEmail} onMarkRead={markRead} notify={notify} />,
    alerts:     <AlertsPage  alerts={alerts} rules={rules} prospects={prospects} onDismiss={dismissAlert} onAddRule={addRule} onUpdateRule={updateRule} onRemoveRule={removeRule} onOpenDetail={setDetail} notify={notify} />,
    activities: <ActivitiesPage activities={activities} prospects={prospects} />,
    settings:   <SettingsPage notify={notify} />,
  };

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', background:'var(--bg)' }}>
      <Sidebar page={page} onNavigate={setPage} alertCount={activeAlertCount} unreadCount={unreadCount} prospectsCount={prospects.length} />

      <main style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 }}>
        <Topbar page={page} onAdd={()=>setShowAdd(true)} />
        <div className="fade-in" key={page} style={{ flex:1, overflow:'auto', padding:'20px 24px' }}>
          {pages[page]||pages.dashboard}
        </div>
      </main>

      {showAdd  && <ProspectModal onClose={()=>setShowAdd(false)} onSave={handleAddProspect} />}
      {detail   && <DetailModal prospect={detail} allProspects={prospects} onClose={()=>setDetail(null)} onUpdate={handleUpdateProspect} onDelete={handleDeleteProspect} onCompose={p=>{setDetail(null);setPage('email');}} notify={notify} />}
      {toast    && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}

function Topbar({ page, onAdd }) {
  const titles = { dashboard:'Tableau de bord', pipeline:'Pipeline de vente', contacts:'Contacts & Prospects', email:'Prospection Email', alerts:'Alertes & Relances', activities:'Activités', settings:'Paramètres' };
  return (
    <div style={{ height:54, padding:'0 24px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:12, flexShrink:0, background:'var(--bg2)' }}>
      <h1 style={{ flex:1, fontSize:15, fontWeight:700, color:'var(--text)', fontFamily:"'Plus Jakarta Sans',sans-serif", letterSpacing:'-.2px' }}>{titles[page]||'BeeBaby CRM'}</h1>
      <button onClick={onAdd} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', background:'var(--blue)', color:'#fff', border:'none', borderRadius:8, fontSize:12, fontWeight:600, fontFamily:'inherit', cursor:'pointer', transition:'opacity .15s' }}
        onMouseEnter={e=>e.currentTarget.style.opacity='.85'}
        onMouseLeave={e=>e.currentTarget.style.opacity='1'}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Nouveau prospect
      </button>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{ height:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'var(--bg)', gap:16 }}>
      <div style={{ width:44, height:44, borderRadius:12, background:'linear-gradient(135deg,#4f8ef7,#9b6dff)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>🐝</div>
      <div style={{ fontSize:14, color:'var(--text2)', fontWeight:500 }}>Connexion à Firebase…</div>
      <div style={{ width:140, height:3, background:'var(--bg3)', borderRadius:2, overflow:'hidden' }}>
        <div style={{ height:'100%', background:'linear-gradient(90deg,var(--blue),var(--purple))', borderRadius:2, animation:'pulse 1.2s ease infinite' }} />
      </div>
    </div>
  );
}

function Toast({ msg, type }) {
  const colors = { success:'var(--green)', error:'var(--red)', info:'var(--blue)' };
  const c = colors[type]||colors.success;
  return (
    <div style={{ position:'fixed', bottom:24, right:24, zIndex:9999, background:'var(--bg3)', border:`1px solid ${c}`, color:'var(--text)', padding:'11px 16px', borderRadius:10, fontSize:13, fontWeight:500, boxShadow:'var(--shadow)', display:'flex', alignItems:'center', gap:8, animation:'fadeIn .2s ease', maxWidth:360 }}>
      <span style={{ width:7, height:7, borderRadius:'50%', background:c, flexShrink:0 }} />
      {msg}
    </div>
  );
}
