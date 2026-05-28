import React, { useState, useEffect } from 'react';
import { fmtAmount, fmtDateTime } from '../lib/data';
import { sendEmail, initEmailJS, RESEND_READY, EMAILJS_READY, FROM_EMAIL, FROM_NAME } from '../lib/resend';
import { Btn, Spinner, EmptyState } from '../components/UI';

const AI_GOALS = {
  intro:    'un email de premier contact professionnel',
  followup: 'une relance après silence (pas de réponse)',
  proposal: 'un envoi de proposition commerciale',
  meeting:  'une demande de rendez-vous',
  thanks:   'un email de remerciement post-échange',
};

const LOCAL_TPL = {
  intro:    p => ({ subject:`${p.prenom}, découvrez comment nous pouvons aider ${p.entreprise}`, body:`Bonjour ${p.prenom},\n\nJ'ai découvert ${p.entreprise} et votre activité dans le secteur ${p.secteur} avec beaucoup d'intérêt.\n\nNous accompagnons des entreprises comme la vôtre à optimiser leur développement commercial.\n\nSeriez-vous disponible pour un échange de 20 minutes cette semaine ?\n\nCordialement,\n${FROM_NAME}` }),
  followup: p => ({ subject:`Relance — ${p.prenom}`, body:`Bonjour ${p.prenom},\n\nJe reviens vers vous suite à mon précédent message resté sans réponse.\n\nJe comprends que vous êtes très occupé(e). Un appel de 15 minutes suffirait pour voir si nous pouvons vous aider.\n\nBien à vous,\n${FROM_NAME}` }),
  proposal: p => ({ subject:`Proposition commerciale — ${p.entreprise}`, body:`Bonjour ${p.prenom},\n\nSuite à nos échanges, je vous adresse notre proposition pour ${p.entreprise}.\n\nNous proposons une offre à ${p.montant?p.montant.toLocaleString('fr-FR')+'€':'prix à définir'} comprenant :\n• Intégration complète\n• Formation de votre équipe\n• Support dédié 6 mois\n\nBien à vous,\n${FROM_NAME}` }),
  meeting:  p => ({ subject:`RDV — ${p.entreprise}`, body:`Bonjour ${p.prenom},\n\nJe souhaiterais vous proposer une démo personnalisée pour ${p.entreprise}.\n\nJe suis disponible :\n• Jeudi à 10h\n• Vendredi à 14h\n• Lundi à 9h\n\nQuel créneau vous convient ?\n\nCordialement,\n${FROM_NAME}` }),
  thanks:   p => ({ subject:`Merci pour notre échange, ${p.prenom}`, body:`Bonjour ${p.prenom},\n\nMerci pour le temps accordé aujourd'hui.\n\nJe vous prépare les éléments évoqués et vous les transmets rapidement.\n\nBonne journée,\n${FROM_NAME}` }),
};

const EMAIL_TEMPLATES = [
  { tag:'Premier contact', name:'Introduction personnalisée', opens:'68%', clicks:'22%', color:'var(--blue)',   goal:'intro' },
  { tag:'Relance',         name:'Relance douce J+4',         opens:'42%', clicks:'18%', color:'var(--orange)', goal:'followup' },
  { tag:'Proposition',     name:'Envoi de devis',            opens:'85%', clicks:'61%', color:'var(--green)',  goal:'proposal' },
  { tag:'RDV',             name:'Demande de rendez-vous',    opens:'55%', clicks:'34%', color:'var(--purple)', goal:'meeting' },
  { tag:'Remerciement',    name:'Suivi post-RDV',            opens:'72%', clicks:'28%', color:'var(--teal)',   goal:'thanks' },
];

export default function EmailModule({ prospects, emails, onSendEmail, onMarkRead, notify }) {
  const [tab,      setTab]      = useState('compose');
  const [to,       setTo]       = useState('');
  const [subj,     setSubj]     = useState('');
  const [body,     setBody]     = useState('');
  const [selP,     setSelP]     = useState('');
  const [goal,     setGoal]     = useState('intro');
  const [tone,     setTone]     = useState('professionnel');
  const [aiLoading,setAiLoading]= useState(false);
  const [aiSug,    setAiSug]    = useState(null);
  const [sending,  setSending]  = useState(false);
  const [selEmail, setSelEmail] = useState(null);

  const inbox  = emails.filter(e => e.type === 'inbox');
  const sent   = emails.filter(e => e.type === 'sent');
  const unread = inbox.filter(e => !e.read).length;

  // Stats réelles calculées depuis Firebase
  const totalSent    = sent.length;
  const totalOpened  = sent.filter(e => e.opened).length;
  const totalClicked = sent.filter(e => e.clicked).length;
  const openRate     = totalSent > 0 ? Math.round(totalOpened / totalSent * 100) : 0;
  const clickRate    = totalSent > 0 ? Math.round(totalClicked / totalSent * 100) : 0;

  useEffect(() => { initEmailJS(); }, []);

  const handleSend = async () => {
    if (!to || !subj) { notify('Destinataire et objet requis.', 'error'); return; }
    setSending(true);
    const emailId = 'email_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    try {
      const result = await sendEmail({ to, subject: subj, body, emailId });

      const toSave = to; const subjSave = subj; const bodySave = body;
      setTo(''); setSubj(''); setBody(''); setAiSug(null);
      setSending(false);

      if (result.demo) notify('⚠ Mode démo — configurez Resend pour le vrai envoi', 'info');
      else             notify('✅ Email envoyé depuis ' + FROM_EMAIL + ' !');

      const pId = prospects.find(p => p.email === toSave)?.id;
      onSendEmail({
        to: toSave, subject: subjSave, body: bodySave,
        from: FROM_NAME, prospectId: pId || null,
        preview: bodySave.slice(0, 80) + '...',
        type: 'sent', read: true,
        opened: false, openedAt: null, openCount: 0,
        clicked: false, clickedAt: null, clickCount: 0,
        bounced: false, spam: false,
        resendId: result.resendId || null,
        emailId,
        sentAt: new Date().toISOString(),
      }).catch(() => {});
    } catch (e) {
      notify('Erreur envoi : ' + (e?.message || 'vérifier la configuration'), 'error');
      setSending(false);
    }
  };

  const handleAI = async () => {
    const p = prospects.find(pr => pr.id === selP || pr.id === parseInt(selP));
    if (!p) { notify('Sélectionnez un prospect.', 'error'); return; }
    setAiLoading(true); setAiSug(null);
    const apiKey = process.env.REACT_APP_ANTHROPIC_KEY;
    if (apiKey && apiKey.startsWith('sk-ant-')) {
      try {
        const prompt = `Expert prospection B2B francophone. Rédige ${AI_GOALS[goal]||AI_GOALS.intro} pour :
- Prénom : ${p.prenom}, Entreprise : ${p.entreprise}, Secteur : ${p.secteur}
- Montant : ${p.montant ? p.montant.toLocaleString('fr-FR')+'€' : 'nc'}
- Notes : ${p.notes || 'aucune'}, Ton : ${tone}
Réponds UNIQUEMENT en JSON sans markdown: {"subject":"...","body":"..."}
Objet ≤60 chars. Corps 150-220 mots, signe avec "${FROM_NAME}".`;
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
          body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 600, messages: [{ role: 'user', content: prompt }] })
        });
        const data = await res.json();
        const parsed = JSON.parse(data.content?.[0]?.text?.replace(/```json|```/g, '').trim() || '{}');
        setAiSug({ subject: parsed.subject, body: parsed.body });
        setAiLoading(false); return;
      } catch (e) {}
    }
    const tpl = LOCAL_TPL[goal] || LOCAL_TPL.intro;
    setAiSug(tpl(p));
    setAiLoading(false);
  };

  const useAI = () => {
    if (!aiSug) return;
    setSubj(aiSug.subject); setBody(aiSug.body);
    const p = prospects.find(pr => pr.id === selP || pr.id === parseInt(selP));
    if (p) setTo(p.email);
    setAiSug(null);
  };

  const TABS = [
    { id: 'compose',   label: 'Composer' },
    { id: 'inbox',     label: 'Boîte de réception', badge: unread || 0 },
    { id: 'sent',      label: 'Envoyés & Tracking' },
    { id: 'templates', label: 'Modèles' },
    { id: 'stats',     label: 'Statistiques' },
  ];

  const providerStatus = RESEND_READY
    ? { color: 'var(--green)', icon: '✅', label: `Resend actif ✦ tracking ouverture & clic activé` }
    : EMAILJS_READY
    ? { color: 'var(--orange)', icon: '⚠', label: `EmailJS actif (sans tracking) — configurez Resend pour le tracking` }
    : { color: 'var(--red)', icon: '❌', label: 'Aucun service email configuré' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '8px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: tab === t.id ? 700 : 400, color: tab === t.id ? 'var(--blue)' : 'var(--text2)', borderBottom: `2px solid ${tab === t.id ? 'var(--blue)' : 'transparent'}`, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5, transition: 'all .14s' }}>
            {t.label}
            {t.badge > 0 && <span style={{ background: 'var(--red)', color: '#fff', fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 8 }}>{t.badge}</span>}
          </button>
        ))}
      </div>

      {/* ── COMPOSE ── */}
      {tab === 'compose' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 290px', gap: 14 }}>
          <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: providerStatus.color, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span>{providerStatus.icon}</span> {providerStatus.label}
            </div>
            {[
              { label: 'De :',    value: FROM_EMAIL, readOnly: true,  onChange: null },
              { label: 'À :',     value: to,         readOnly: false, onChange: setTo,   ph: 'destinataire@email.fr' },
              { label: 'Objet :', value: subj,        readOnly: false, onChange: setSubj, ph: 'Objet de votre email...' },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', width: 52, flexShrink: 0 }}>{f.label}</span>
                <input value={f.value} readOnly={f.readOnly} onChange={f.onChange ? e => f.onChange(e.target.value) : undefined} placeholder={f.ph}
                  style={{ flex: 1, background: 'none', border: 'none', color: f.readOnly ? 'var(--text3)' : 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
              </div>
            ))}
            <textarea value={body} onChange={e => setBody(e.target.value)}
              placeholder="Rédigez votre message, ou utilisez l'assistant IA →"
              style={{ flex: 1, minHeight: 200, background: 'none', border: 'none', color: 'var(--text)', fontSize: 13, outline: 'none', resize: 'none', padding: '12px 0', fontFamily: 'inherit', lineHeight: 1.7 }} />
            <div style={{ display: 'flex', gap: 8, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
              <Btn onClick={() => { setTo(''); setSubj(''); setBody(''); }} size="sm">Effacer</Btn>
              <Btn variant="primary" onClick={handleSend} disabled={sending} size="sm">
                {sending ? <><Spinner size={12} /> Envoi...</> : '✉ Envoyer'}
              </Btn>
            </div>
          </div>

          {/* IA Panel */}
          <div style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 11 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--purple)', display: 'flex', alignItems: 'center', gap: 5 }}>✦ Assistant IA</div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text3)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.4px' }}>Prospect cible</div>
              <select value={selP} onChange={e => setSelP(e.target.value)} style={selStyle}>
                <option value="">— Sélectionner —</option>
                {prospects.map(p => <option key={p.id} value={p.id}>{p.prenom} {p.nom} — {p.entreprise}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text3)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.4px' }}>Objectif</div>
              <select value={goal} onChange={e => setGoal(e.target.value)} style={selStyle}>
                <option value="intro">Premier contact</option>
                <option value="followup">Relance</option>
                <option value="proposal">Proposition commerciale</option>
                <option value="meeting">Demande de RDV</option>
                <option value="thanks">Remerciement</option>
              </select>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text3)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.4px' }}>Ton</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                {['professionnel', 'chaleureux', 'direct', 'persuasif'].map(t => (
                  <button key={t} onClick={() => setTone(t)} style={{ padding: '6px', borderRadius: 6, fontSize: 11, fontWeight: 500, cursor: 'pointer', border: `1px solid ${tone === t ? 'var(--purple)' : 'var(--border)'}`, background: tone === t ? 'var(--purple-d)' : 'transparent', color: tone === t ? 'var(--purple)' : 'var(--text2)', fontFamily: 'inherit', transition: 'all .12s', textTransform: 'capitalize' }}>{t}</button>
                ))}
              </div>
            </div>
            <button onClick={handleAI} style={{ width: '100%', padding: '9px', background: 'var(--purple)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              {aiLoading ? <><Spinner size={12} /> Génération...</> : '✦ Générer avec l\'IA'}
            </button>
            {aiSug && (
              <div style={{ background: 'var(--bg4)', border: '1px solid var(--purple)', borderRadius: 8, padding: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text3)', marginBottom: 4 }}>Objet : {aiSug.subject}</div>
                <div style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.5, whiteSpace: 'pre-line', maxHeight: 110, overflow: 'auto' }}>{aiSug.body}</div>
                <div style={{ display: 'flex', gap: 5, marginTop: 8 }}>
                  <button onClick={useAI} style={{ flex: 1, padding: '6px', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>✓ Utiliser</button>
                  <button onClick={handleAI} style={{ padding: '6px 10px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, fontSize: 11, color: 'var(--text2)', cursor: 'pointer', fontFamily: 'inherit' }}>↺</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── INBOX ── */}
      {tab === 'inbox' && (
        <div style={{ display: 'grid', gridTemplateColumns: selEmail ? '1fr 1fr' : '1fr', gap: 14 }}>
          <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
            {inbox.length === 0
              ? <EmptyState icon="📭" title="Boîte de réception vide" />
              : inbox.map(e => <EmailRow key={e.id} email={e} selected={selEmail?.id === e.id} onClick={() => { setSelEmail(e); onMarkRead(e.id); }} />)
            }
          </div>
          {selEmail && (
            <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 12, padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>{selEmail.subject}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>De : {selEmail.from} · {fmtDateTime(selEmail.time)}</div>
                </div>
                <button onClick={() => setSelEmail(null)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 20 }}>×</button>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.7, whiteSpace: 'pre-line', padding: '14px 0', borderTop: '1px solid var(--border)' }}>{selEmail.body}</div>
              <div style={{ paddingTop: 14, borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
                <Btn variant="primary" size="sm" onClick={() => { setTab('compose'); setTo(selEmail.from === 'Vous' ? selEmail.to : selEmail.from); }}>↩ Répondre</Btn>
                <Btn size="sm" onClick={() => setSelEmail(null)}>Fermer</Btn>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── ENVOYÉS + TRACKING ── */}
      {tab === 'sent' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {RESEND_READY && (
            <div style={{ background: 'var(--green-d)', border: '1px solid var(--green)', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: 'var(--green)', display: 'flex', gap: 7, alignItems: 'center' }}>
              ✅ Tracking Resend actif — les ouvertures et clics se mettent à jour en temps réel
            </div>
          )}
          {!RESEND_READY && (
            <div style={{ background: 'var(--orange-d)', border: '1px solid var(--orange)', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: 'var(--orange)' }}>
              ⚠ Tracking désactivé — configurez Resend dans src/lib/resend.js pour voir les ouvertures en temps réel
            </div>
          )}
          <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
            {sent.length === 0
              ? <EmptyState icon="✉" title="Aucun email envoyé" />
              : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 200px 100px', padding: '8px 14px', borderBottom: '1px solid var(--border)', background: 'var(--bg4)' }}>
                    {['Email', 'Envoyé le', 'Statut de tracking', 'Détails'].map(h => (
                      <div key={h} style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.4px' }}>{h}</div>
                    ))}
                  </div>
                  {sent.map(e => <SentTrackingRow key={e.id} email={e} onClick={() => setSelEmail(e)} />)}
                </>
              )
            }
          </div>
          {selEmail && selEmail.type === 'sent' && (
            <TrackingDetail email={selEmail} onClose={() => setSelEmail(null)} />
          )}
        </div>
      )}

      {/* ── MODÈLES ── */}
      {tab === 'templates' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
          {EMAIL_TEMPLATES.map((t, i) => (
            <div key={i} onClick={() => { setTab('compose'); setSubj(t.name + ' — [Prospect]'); }}
              style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 12, padding: 14, cursor: 'pointer', transition: 'border-color .15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = t.color}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 5, background: t.color + '22', color: t.color, display: 'inline-block', marginBottom: 8 }}>{t.tag}</span>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 5 }}>{t.name}</div>
              <div style={{ display: 'flex', gap: 10, fontSize: 11, color: 'var(--text3)', paddingTop: 8, borderTop: '1px solid var(--border)', marginTop: 8 }}>
                <span>📬 {t.opens} ouv.</span><span>🔗 {t.clicks} clic</span>
                <span style={{ marginLeft: 'auto', color: t.color, fontWeight: 600 }}>Utiliser →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── STATS ── */}
      {tab === 'stats' && <EmailStats emails={emails} openRate={openRate} clickRate={clickRate} totalSent={totalSent} totalOpened={totalOpened} totalClicked={totalClicked} />}
    </div>
  );
}

// ── Ligne tracking dans la liste Envoyés ─────────────────────────────────
function SentTrackingRow({ email: e, onClick }) {
  const status = getTrackingStatus(e);
  return (
    <div onClick={onClick} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 200px 100px', alignItems: 'center', padding: '11px 14px', borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background .1s' }}
      onMouseEnter={el => el.currentTarget.style.background = 'var(--bg4)'}
      onMouseLeave={el => el.currentTarget.style.background = 'transparent'}
    >
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{e.subject}</div>
        <div style={{ fontSize: 11, color: 'var(--text3)' }}>À : {e.to}</div>
      </div>
      <div style={{ fontSize: 11, color: 'var(--text3)' }}>
        {e.sentAt ? fmtDateTime(e.sentAt) : fmtDateTime(e.time)}
      </div>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        <TrackBadge icon="✉" label="Envoyé" color="var(--blue)" active={true} />
        <TrackBadge icon="👁" label={e.openCount > 1 ? `Ouvert ×${e.openCount}` : 'Ouvert'} color="var(--green)" active={e.opened} />
        <TrackBadge icon="🔗" label="Cliqué" color="var(--purple)" active={e.clicked} />
        {e.bounced && <TrackBadge icon="⚠" label="Bounce" color="var(--red)" active={true} />}
      </div>
      <div style={{ fontSize: 10, color: 'var(--blue)', fontWeight: 600 }}>Détails →</div>
    </div>
  );
}

function TrackBadge({ icon, label, color, active }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 5, background: active ? color + '22' : 'var(--bg5)', color: active ? color : 'var(--text3)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
      {icon} {label}
    </span>
  );
}

// ── Panneau détail tracking ──────────────────────────────────────────────
function TrackingDetail({ email: e, onClose }) {
  return (
    <div style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 12, padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Tracking — {e.subject}</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 20 }}>×</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
        {[
          { icon: '✉', label: 'Envoyé',    value: e.sentAt ? fmtDateTime(e.sentAt) : '—',     color: 'var(--blue)',   active: true },
          { icon: '👁', label: 'Ouvertures',value: e.opened ? `${e.openCount||1} fois` : 'Non ouvert', color: 'var(--green)',  active: e.opened },
          { icon: '🔗', label: 'Clics',     value: e.clicked ? `${e.clickCount||1} clic(s)` : 'Aucun clic', color: 'var(--purple)', active: e.clicked },
          { icon: '↩', label: 'Statut',    value: e.bounced ? 'Bounce' : e.spam ? 'Spam' : 'OK', color: e.bounced||e.spam ? 'var(--red)' : 'var(--green)', active: true },
        ].map((s, i) => (
          <div key={i} style={{ background: 'var(--bg4)', borderRadius: 10, padding: '12px 14px', border: `1px solid ${s.active ? s.color + '40' : 'var(--border)'}` }}>
            <div style={{ fontSize: 18, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.3px', fontWeight: 600 }}>{s.label}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: s.active ? s.color : 'var(--text3)' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--bg4)', borderRadius: 10, padding: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 10 }}>Chronologie</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { cond: true,        time: e.sentAt||e.time,   icon: '✉', label: 'Email envoyé',        color: 'var(--blue)' },
            { cond: e.opened,    time: e.openedAt,          icon: '👁', label: `Email ouvert${e.openCount > 1 ? ` (${e.openCount} fois)` : ''}`, color: 'var(--green)' },
            { cond: e.clicked,   time: e.clickedAt,         icon: '🔗', label: 'Lien cliqué',         color: 'var(--purple)' },
            { cond: e.bounced,   time: e.bouncedAt,         icon: '⚠', label: 'Email en bounce',     color: 'var(--red)' },
            { cond: e.spam,      time: e.spamAt,            icon: '🚫', label: 'Signalé comme spam',  color: 'var(--red)' },
          ].filter(ev => ev.cond).map((ev, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: ev.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>{ev.icon}</div>
              <div style={{ flex: 1, fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>{ev.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>{ev.time ? fmtDateTime(ev.time) : '—'}</div>
            </div>
          ))}
          {!e.opened && !e.bounced && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: .4 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>👁</div>
              <div style={{ fontSize: 12, color: 'var(--text3)', fontStyle: 'italic' }}>En attente d'ouverture…</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Ligne inbox ──────────────────────────────────────────────────────────
function EmailRow({ email: e, selected, onClick }) {
  return (
    <div onClick={onClick} style={{ display: 'grid', gridTemplateColumns: '34px 1fr auto', gap: 10, alignItems: 'start', padding: '11px 14px', cursor: 'pointer', background: selected ? 'var(--blue-d)' : e.read ? 'transparent' : 'rgba(79,142,247,.05)', borderBottom: '1px solid var(--border)', transition: 'background .1s' }}>
      <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(79,142,247,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'var(--blue)' }}>{e.from?.[0]?.toUpperCase()}</div>
      <div>
        <div style={{ fontSize: 12, fontWeight: e.read ? 400 : 700, color: 'var(--text)', marginBottom: 2 }}>{e.from}</div>
        <div style={{ fontSize: 12, fontWeight: e.read ? 400 : 600, color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.subject}</div>
        <div style={{ fontSize: 11, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.preview}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
        <span style={{ fontSize: 10, color: 'var(--text3)', whiteSpace: 'nowrap' }}>{new Date(e.time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
        {!e.read && <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--blue)' }} />}
      </div>
    </div>
  );
}

// ── Stats globales ───────────────────────────────────────────────────────
function EmailStats({ emails, openRate, clickRate, totalSent, totalOpened, totalClicked }) {
  const sent = emails.filter(e => e.type === 'sent');
  const bounced = sent.filter(e => e.bounced).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        {[
          { l: 'Emails envoyés',   v: totalSent,    c: 'var(--text)',   sub: 'total' },
          { l: 'Taux d\'ouverture',v: openRate+'%', c: 'var(--blue)',   sub: `${totalOpened} ouverts` },
          { l: 'Taux de clic',     v: clickRate+'%',c: 'var(--purple)', sub: `${totalClicked} clics` },
          { l: 'Bounces',          v: bounced,       c: bounced > 0 ? 'var(--red)' : 'var(--green)', sub: bounced > 0 ? 'adresses invalides' : 'aucun bounce' },
        ].map(s => (
          <div key={s.l} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.4px' }}>{s.l}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: s.c, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{s.v}</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 12, padding: 18 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '.4px' }}>Détail par email</div>
        {sent.length === 0
          ? <EmptyState icon="📊" title="Aucune donnée" sub="Envoyez des emails pour voir les statistiques" />
          : sent.slice(0, 10).map(e => (
          <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.subject}</div>
              <div style={{ fontSize: 10, color: 'var(--text3)' }}>À : {e.to} · {e.sentAt ? fmtDateTime(e.sentAt) : fmtDateTime(e.time)}</div>
            </div>
            <div style={{ display: 'flex', gap: 5 }}>
              <TrackBadge icon="👁" label={e.opened ? `×${e.openCount||1}` : '—'} color="var(--green)" active={e.opened} />
              <TrackBadge icon="🔗" label={e.clicked ? '✓' : '—'} color="var(--purple)" active={e.clicked} />
              {e.bounced && <TrackBadge icon="⚠" label="Bounce" color="var(--red)" active={true} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getTrackingStatus(e) {
  if (e.bounced) return { label: 'Bounce', color: 'var(--red)' };
  if (e.clicked) return { label: 'Cliqué', color: 'var(--purple)' };
  if (e.opened)  return { label: 'Ouvert', color: 'var(--green)' };
  return { label: 'Envoyé', color: 'var(--blue)' };
}

const selStyle = {
  width: '100%', padding: '8px 10px', background: 'var(--bg4)',
  border: '1px solid var(--border2)', borderRadius: 8,
  color: 'var(--text)', fontSize: 12, outline: 'none', fontFamily: 'inherit', cursor: 'pointer'
};
