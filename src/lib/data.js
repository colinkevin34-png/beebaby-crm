export const STAGES = [
  { id:'new',       label:'Nouveau',      color:'#4f8ef7', dim:'rgba(79,142,247,0.14)' },
  { id:'contacted', label:'Contacté',     color:'#f5a623', dim:'rgba(245,166,35,0.14)' },
  { id:'qualified', label:'Qualifié',     color:'#9b6dff', dim:'rgba(155,109,255,0.14)' },
  { id:'proposal',  label:'Proposition',  color:'#2dd4bf', dim:'rgba(45,212,191,0.14)' },
  { id:'won',       label:'Gagné',        color:'#3ecf8e', dim:'rgba(62,207,142,0.14)' },
  { id:'lost',      label:'Perdu',        color:'#f25f5c', dim:'rgba(242,95,92,0.14)' },
];

export const SECTORS    = ['Digital','Industrie','Retail','Santé','Finance','Tech','Services','Éducation','Autre'];
export const PRIORITIES = ['Haute','Moyenne','Faible'];

export const ALERT_TYPES = [
  { id:'no_contact', label:'Sans contact depuis X jours',     icon:'📭', color:'#f5a623' },
  { id:'follow_up',  label:'Relance après email non répondu', icon:'🔔', color:'#4f8ef7' },
  { id:'birthday',   label:'Rappel date importante',          icon:'📅', color:'#9b6dff' },
  { id:'stage_time', label:'Trop longtemps dans une étape',   icon:'⏱',  color:'#f25f5c' },
  { id:'manual',     label:'Rappel manuel',                   icon:'✋', color:'#3ecf8e' },
];

export const DEMO_PROSPECTS = [
  { prenom:'Sophie', nom:'Martin',  entreprise:'TechVision',   email:'s.martin@techvision.fr',   tel:'+33 6 12 34 56 78', montant:12000, secteur:'Digital',   priorite:'Haute',  stage:'qualified', notes:'RDV prévu le 3 juin. Intéressée par offre premium.' },
  { prenom:'Marc',   nom:'Leblanc', entreprise:'IndustrFab',   email:'m.leblanc@industrfab.fr',  tel:'+33 6 98 76 54 32', montant:35000, secteur:'Industrie', priorite:'Haute',  stage:'proposal',  notes:'Devis envoyé. Décision fin du mois.' },
  { prenom:'Isabelle',nom:'Durand', entreprise:'RetailPro',    email:'i.durand@retailpro.fr',    tel:'+33 7 22 33 44 55', montant:8500,  secteur:'Retail',    priorite:'Moyenne',stage:'contacted', notes:'Premier contact email effectué.' },
  { prenom:'Thomas', nom:'Petit',   entreprise:'MediCare+',    email:'t.petit@medicare.fr',      tel:'+33 6 55 66 77 88', montant:22000, secteur:'Santé',     priorite:'Haute',  stage:'new',       notes:'Recommandé par client existant.' },
  { prenom:'Claire', nom:'Bernard', entreprise:'FinanceXpert', email:'c.bernard@financexpert.fr',tel:'+33 6 44 55 66 77', montant:15000, secteur:'Finance',   priorite:'Moyenne',stage:'won',       notes:'Contrat signé le 15 mai 2026 !' },
];

export const AVATAR_COLORS = [
  {bg:'rgba(79,142,247,.18)',  tx:'#4f8ef7'},
  {bg:'rgba(62,207,142,.18)',  tx:'#3ecf8e'},
  {bg:'rgba(155,109,255,.18)', tx:'#9b6dff'},
  {bg:'rgba(245,166,35,.18)',  tx:'#f5a623'},
  {bg:'rgba(242,95,92,.18)',   tx:'#f25f5c'},
  {bg:'rgba(45,212,191,.18)',  tx:'#2dd4bf'},
  {bg:'rgba(251,191,36,.18)',  tx:'#fbbf24'},
];

export const SECTOR_COLORS = {
  Digital:'#4f8ef7', Industrie:'#f5a623', Retail:'#3ecf8e',
  Santé:'#9b6dff',   Finance:'#f25f5c',   Tech:'#2dd4bf',
  Services:'#fbbf24',Éducation:'#ff6b6b', Autre:'#9090aa',
};

export function getInitials(p)   { return ((p?.prenom?.[0]||'')+(p?.nom?.[0]||'')).toUpperCase(); }
export function getAvatar(i)     { return AVATAR_COLORS[Math.abs(i||0) % AVATAR_COLORS.length]; }
export function fmtAmount(n)     { if(!n) return '—'; return n>=1000?(n/1000).toFixed(0)+'k€':n+'€'; }
export function fmtDate(d)       { if(!d) return '—'; try{ return new Date(d).toLocaleDateString('fr-FR'); }catch{ return d; } }
export function fmtDateTime(d)   { if(!d) return '—'; try{ return new Date(d).toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}); }catch{ return d; } }
export function daysSince(d)     { if(!d) return 999; return Math.floor((Date.now()-new Date(d).getTime())/86400000); }
export function getStage(id)     { return STAGES.find(s=>s.id===id)||STAGES[0]; }
