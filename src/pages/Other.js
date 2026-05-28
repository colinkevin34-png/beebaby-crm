import React from 'react';
import { fmtDateTime } from '../lib/data';
import { EmptyState } from '../components/UI';

const ICONS = { email:'✉', prospect:'👤', stage:'🔄', alert:'🔔', note:'📝', call:'📞', won:'🏆', lost:'❌' };

export function ActivitiesPage({ activities, prospects }) {
  const merged = [
    ...activities,
    { id:'a1', type:'email',    text:'Email de présentation envoyé à Sophie Martin', time:new Date(Date.now()-3600000).toISOString() },
    { id:'a2', type:'call',     text:'Appel de qualification avec Marc Leblanc — 25 min', time:new Date(Date.now()-7200000).toISOString() },
    { id:'a3', type:'stage',    text:'Thomas Petit → étape Qualifié', time:new Date(Date.now()-86400000).toISOString() },
    { id:'a4', type:'won',      text:'Deal gagné ! Claire Bernard — 15 000€', time:new Date(Date.now()-172800000).toISOString() },
    { id:'a5', type:'prospect', text:'Nouveau prospect ajouté : Paul Laurent (BioSanté)', time:new Date(Date.now()-259200000).toISOString() },
    { id:'a6', type:'alert',    text:'Alerte relance déclenchée — Isabelle Durand sans contact depuis 8 jours', time:new Date(Date.now()-345600000).toISOString() },
  ].sort((a,b) => new Date(b.time)-new Date(a.time));

  const COLORS = { email:'var(--blue)', call:'var(--green)', stage:'var(--purple)', alert:'var(--orange)', won:'var(--teal)', prospect:'var(--blue)', lost:'var(--red)', note:'var(--yellow)' };

  return (
    <div style={{ maxWidth:680 }}>
      <div style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:12 }}>
        {merged.slice(0,30).map((a,i) => (
          <div key={a.id||i} style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'12px 16px', borderBottom:'1px solid var(--border)', animation:`fadeIn .3s ease ${i*.03}s both` }}>
            <div style={{ width:34, height:34, borderRadius:'50%', background:(COLORS[a.type]||'var(--blue)')+'22', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, flexShrink:0 }}>
              {ICONS[a.type]||'•'}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, color:'var(--text)', lineHeight:1.4 }}>{a.text}</div>
              <div style={{ fontSize:11, color:'var(--text3)', marginTop:3 }}>{fmtDateTime(a.time)}</div>
            </div>
            <div style={{ width:8, height:8, borderRadius:'50%', background:COLORS[a.type]||'var(--blue)', marginTop:4, flexShrink:0 }} />
          </div>
        ))}
        {merged.length===0 && <EmptyState icon="⏱" title="Aucune activité" sub="Les actions apparaîtront ici." />}
      </div>
    </div>
  );
}

export function SettingsPage({ notify }) {
  return (
    <div style={{ maxWidth:640, display:'flex', flexDirection:'column', gap:16 }}>
      <Section title="📧 Configuration EmailJS — envoi depuis beebaby.microcreche@gmail.com">
        <p style={{ fontSize:13, color:'var(--text2)', lineHeight:1.7, marginBottom:12 }}>
          Pour envoyer de vrais emails depuis votre adresse Gmail, suivez ces étapes :
        </p>
        <ol style={{ fontSize:13, color:'var(--text2)', lineHeight:2, paddingLeft:18 }}>
          <li>Aller sur <a href="https://www.emailjs.com" target="_blank" rel="noreferrer" style={{ color:'var(--blue)' }}>emailjs.com</a> → créer un compte gratuit</li>
          <li><strong style={{ color:'var(--text)' }}>Email Services</strong> → Add New Service → Gmail → connecter <code style={{ background:'var(--bg4)', padding:'1px 5px', borderRadius:4 }}>beebaby.microcreche@gmail.com</code></li>
          <li>Copier le <strong style={{ color:'var(--text)' }}>Service ID</strong></li>
          <li><strong style={{ color:'var(--text)' }}>Email Templates</strong> → Create New Template → configurer (voir ci-dessous) → copier <strong style={{ color:'var(--text)' }}>Template ID</strong></li>
          <li><strong style={{ color:'var(--text)' }}>Account → General → Public Key</strong></li>
          <li>Coller les 3 valeurs dans <code style={{ background:'var(--bg4)', padding:'1px 5px', borderRadius:4 }}>src/lib/emailjs.js</code></li>
        </ol>
        <div style={{ background:'var(--bg4)', borderRadius:8, padding:12, marginTop:8, fontFamily:'monospace', fontSize:12, color:'var(--text2)', lineHeight:1.8 }}>
          <div style={{ color:'var(--text3)', marginBottom:4 }}>// Template EmailJS à configurer :</div>
          <div>Subject : <span style={{ color:'var(--yellow)' }}>{'{{subject}}'}</span></div>
          <div>To email : <span style={{ color:'var(--yellow)' }}>{'{{to_email}}'}</span></div>
          <div>Body :</div>
          <div style={{ paddingLeft:12 }}>De : <span style={{ color:'var(--yellow)' }}>{'{{from_name}}'}</span> &lt;<span style={{ color:'var(--yellow)' }}>{'{{from_email}}'}</span>&gt;</div>
          <div style={{ paddingLeft:12 }}><span style={{ color:'var(--yellow)' }}>{'{{message}}'}</span></div>
        </div>
      </Section>

      <Section title="🤖 Assistant IA — Clé Anthropic (optionnel)">
        <p style={{ fontSize:13, color:'var(--text2)', lineHeight:1.7, marginBottom:8 }}>
          Pour que l'IA génère de vraies emails personnalisés (pas les templates par défaut) :
        </p>
        <ol style={{ fontSize:13, color:'var(--text2)', lineHeight:2, paddingLeft:18 }}>
          <li>Aller sur <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer" style={{ color:'var(--blue)' }}>console.anthropic.com</a> → créer une clé</li>
          <li>Créer un fichier <code style={{ background:'var(--bg4)', padding:'1px 5px', borderRadius:4 }}>.env.local</code> à la racine du projet</li>
          <li>Y ajouter : <code style={{ background:'var(--bg4)', padding:'1px 5px', borderRadius:4 }}>REACT_APP_ANTHROPIC_KEY=sk-ant-...</code></li>
          <li>Relancer <code style={{ background:'var(--bg4)', padding:'1px 5px', borderRadius:4 }}>npm start</code></li>
        </ol>
      </Section>

      <Section title="🔥 Firebase — Données en temps réel">
        <p style={{ fontSize:13, color:'var(--text2)', lineHeight:1.7 }}>
          Votre CRM est connecté au projet Firebase <code style={{ background:'var(--bg4)', padding:'1px 5px', borderRadius:4 }}>prospectcrm-33b44</code>.<br/>
          Activez <strong style={{ color:'var(--text)' }}>Firestore Database</strong> en mode Test dans la console Firebase pour activer la synchronisation des données.
        </p>
        <a href="https://console.firebase.google.com/project/prospectcrm-33b44/firestore" target="_blank" rel="noreferrer">
          <button style={{ marginTop:10, padding:'8px 14px', background:'var(--orange-d)', border:'1px solid var(--orange)', borderRadius:8, color:'var(--orange)', cursor:'pointer', fontFamily:'inherit', fontSize:12, fontWeight:600 }}>
            🔥 Ouvrir Firebase Console →
          </button>
        </a>
      </Section>

      <Section title="🚀 Déploiement Netlify">
        <ol style={{ fontSize:13, color:'var(--text2)', lineHeight:2, paddingLeft:18 }}>
          <li>Lancer <code style={{ background:'var(--bg4)', padding:'1px 5px', borderRadius:4 }}>npm run build</code></li>
          <li>Aller sur <a href="https://app.netlify.com/drop" target="_blank" rel="noreferrer" style={{ color:'var(--blue)' }}>app.netlify.com/drop</a></li>
          <li>Glisser le dossier <code style={{ background:'var(--bg4)', padding:'1px 5px', borderRadius:4 }}>build/</code></li>
          <li>Ajouter la variable d'env <code style={{ background:'var(--bg4)', padding:'1px 5px', borderRadius:4 }}>REACT_APP_ANTHROPIC_KEY</code> dans Netlify → Site settings → Environment variables</li>
        </ol>
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:12, padding:'16px 18px' }}>
      <h3 style={{ fontSize:13, fontWeight:700, color:'var(--text)', marginBottom:12, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{title}</h3>
      {children}
    </div>
  );
}
