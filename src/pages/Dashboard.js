import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { STAGES, getInitials, getAvatar, fmtAmount, fmtDateTime } from '../lib/data';
import { Avatar, StagePill, Card, Btn, EmptyState } from '../components/UI';

export default function Dashboard({ prospects, emails, alerts, onOpenDetail, onNavigate }) {
  const total    = prospects.length;
  const won      = prospects.filter(p => p.stage==='won').length;
  const pipeline = prospects.filter(p => !['won','lost'].includes(p.stage)).reduce((s,p)=>s+p.montant,0);
  const rate     = total > 0 ? Math.round(won/total*100) : 0;
  const activeAlerts = alerts.filter(a => !a.dismissed).length;
  const unread   = emails.filter(e => e.type==='inbox' && !e.read).length;

  const stageData = STAGES.slice(0,5).map(s => ({
    name: s.label, value: prospects.filter(p=>p.stage===s.id).length, color: s.color,
  }));

  const monthly = [
    {m:'Jan',n:3,g:1},{m:'Fév',n:5,g:2},{m:'Mar',n:4,g:1},
    {m:'Avr',n:7,g:3},{m:'Mai',n:6,g:2},{m:'Juin',n:8,g:4},
  ];

  const topProspects = prospects.filter(p=>p.priorite==='Haute'&&!['won','lost'].includes(p.stage)).slice(0,5);
  const recentEmails = emails.filter(e=>e.type==='sent').slice(0,4);
  const urgentAlerts = alerts.filter(a=>!a.dismissed).slice(0,4);

  const STAT_CARDS = [
    { label:'Total prospects', value:total,            color:'var(--blue)',   sub:`${won} gagnés` },
    { label:'Pipeline actif',  value:fmtAmount(pipeline), color:'var(--teal)', sub:'en cours' },
    { label:'Taux conversion', value:rate+'%',          color:'var(--green)', sub:'+5pts ce mois' },
    { label:'Alertes actives', value:activeAlerts,      color: activeAlerts>0 ? 'var(--red)':'var(--green)', sub: activeAlerts>0 ? 'à traiter':'tout va bien', onClick:()=>onNavigate('alerts') },
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
        {STAT_CARDS.map((s,i) => (
          <div key={i} onClick={s.onClick} style={{
            background:'var(--bg3)', border:`1px solid var(--border)`, borderRadius:12,
            padding:'16px 18px', cursor: s.onClick?'pointer':'default',
            transition:'border-color .15s', animation:`fadeIn .3s ease ${i*.06}s both`,
          }}
            onMouseEnter={e=>{ if(s.onClick) e.currentTarget.style.borderColor='var(--border3)'; }}
            onMouseLeave={e=>{ if(s.onClick) e.currentTarget.style.borderColor='var(--border)'; }}
          >
            <div style={{ fontSize:10, fontWeight:600, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'.5px', marginBottom:8 }}>{s.label}</div>
            <div style={{ fontSize:28, fontWeight:700, color:s.color, fontFamily:"'Plus Jakarta Sans',sans-serif", lineHeight:1 }}>{s.value}</div>
            <div style={{ fontSize:11, color:'var(--text3)', marginTop:6 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        <SectionCard title="Par étape">
          <div style={{ display:'flex', height:170, alignItems:'center', gap:8 }}>
            <ResponsiveContainer width="55%" height="100%">
              <PieChart>
                <Pie data={stageData} cx="50%" cy="50%" innerRadius={42} outerRadius={68} dataKey="value" paddingAngle={3}>
                  {stageData.map((e,i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{background:'var(--bg4)',border:'1px solid var(--border)',borderRadius:8,fontSize:11}} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex:1, display:'flex', flexDirection:'column', gap:6 }}>
              {stageData.map((s,i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:6, fontSize:11 }}>
                  <span style={{ width:7, height:7, borderRadius:'50%', background:s.color, flexShrink:0 }} />
                  <span style={{ flex:1, color:'var(--text2)' }}>{s.name}</span>
                  <span style={{ fontWeight:700, color:'var(--text)', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Activité mensuelle">
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={monthly} barSize={9} barGap={3}>
              <XAxis dataKey="m" tick={{fontSize:10,fill:'var(--text3)'}} axisLine={false} tickLine={false} />
              <YAxis tick={{fontSize:10,fill:'var(--text3)'}} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{background:'var(--bg4)',border:'1px solid var(--border)',borderRadius:8,fontSize:11}} />
              <Bar dataKey="n" name="Nouveaux" fill="var(--blue)" radius={[3,3,0,0]} />
              <Bar dataKey="g" name="Gagnés"   fill="var(--green)" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        <SectionCard title="Prospects prioritaires" action={<span onClick={()=>onNavigate('contacts')} style={{fontSize:11,color:'var(--blue)',cursor:'pointer'}}>Voir tous →</span>}>
          {topProspects.length === 0
            ? <EmptyState icon="👥" title="Aucun prospect prioritaire" />
            : topProspects.map((p,i) => (
            <div key={p.id} onClick={()=>onOpenDetail(p)} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 6px', borderRadius:8, cursor:'pointer', transition:'background .12s' }}
              onMouseEnter={e=>e.currentTarget.style.background='var(--bg4)'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}
            >
              <Avatar prospect={p} index={i} />
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:12, fontWeight:600, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.prenom} {p.nom}</div>
                <div style={{ fontSize:10, color:'var(--text3)' }}>{p.entreprise}</div>
              </div>
              <StagePill stageId={p.stage} />
              <span style={{ fontSize:11, fontWeight:700, color:'var(--text2)', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{fmtAmount(p.montant)}</span>
            </div>
          ))}
        </SectionCard>

        <SectionCard title="Alertes récentes" action={<span onClick={()=>onNavigate('alerts')} style={{fontSize:11,color:'var(--red)',cursor:'pointer'}}>{activeAlerts} active{activeAlerts>1?'s':''} →</span>}>
          {urgentAlerts.length === 0
            ? <EmptyState icon="✅" title="Aucune alerte active" sub="Tout est sous contrôle !" />
            : urgentAlerts.map((a,i) => (
            <div key={a.id} style={{ display:'flex', alignItems:'flex-start', gap:9, padding:'8px 6px', borderRadius:8, borderLeft:`2px solid ${a.priority==='high'?'var(--red)':'var(--orange)'}`, marginBottom:4, paddingLeft:10 }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12, color:'var(--text)', fontWeight:500 }}>{a.prospectName}</div>
                <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>{a.message}</div>
              </div>
              <span style={{ fontSize:9, fontWeight:700, padding:'2px 6px', borderRadius:6, background: a.priority==='high'?'var(--red-d)':'var(--orange-d)', color:a.priority==='high'?'var(--red)':'var(--orange)' }}>
                {a.priority==='high'?'URGENT':'NORMAL'}
              </span>
            </div>
          ))}
        </SectionCard>
      </div>
    </div>
  );
}

function SectionCard({ title, action, children }) {
  return (
    <div style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:12, padding:'14px 16px' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
        <h3 style={{ fontSize:12, fontWeight:700, color:'var(--text)', fontFamily:"'Plus Jakarta Sans',sans-serif", textTransform:'uppercase', letterSpacing:'.4px' }}>{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}
