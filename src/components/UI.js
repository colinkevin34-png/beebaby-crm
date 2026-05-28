import React from 'react';
import { getInitials, getAvatar, getStage, fmtAmount, SECTOR_COLORS } from '../lib/data';

export function Avatar({ prospect, size = 32, index = 0 }) {
  const ac = getAvatar(index);
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: ac.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size > 32 ? 14 : 11, fontWeight: 700, color: ac.tx, flexShrink: 0,
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      {getInitials(prospect)}
    </div>
  );
}

export function StagePill({ stageId }) {
  const s = getStage(stageId);
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
      background: s.dim, color: s.color, whiteSpace: 'nowrap',
      letterSpacing: '.2px',
    }}>{s.label}</span>
  );
}

export function SectorTag({ sector }) {
  const c = SECTOR_COLORS[sector] || '#9090aa';
  return (
    <span style={{ fontSize: 10, fontWeight: 500, padding: '2px 7px', borderRadius: 5, background: c + '22', color: c }}>
      {sector}
    </span>
  );
}

export function PriorityDot({ priorite }) {
  const cfg = { Haute: 'var(--red)', Moyenne: 'var(--orange)', Faible: 'var(--green)' };
  const c = cfg[priorite] || cfg.Moyenne;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: c, fontWeight: 500 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c }} />
      {priorite}
    </span>
  );
}

export function AmountBadge({ amount }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {fmtAmount(amount)}
    </span>
  );
}

export function Card({ children, style = {}, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: 'var(--bg3)', border: '1px solid var(--border)',
      borderRadius: 'var(--r-lg)', ...style,
      cursor: onClick ? 'pointer' : 'default',
    }}>{children}</div>
  );
}

export function Btn({ children, onClick, variant = 'ghost', size = 'md', disabled, style = {} }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 5, border: 'none',
    borderRadius: 'var(--r)', cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: 'inherit', fontWeight: 500, transition: 'all .14s', opacity: disabled ? .5 : 1,
    ...size === 'sm' ? { padding: '5px 10px', fontSize: 11 } : { padding: '7px 14px', fontSize: 12 },
  };
  const variants = {
    primary: { background: 'var(--blue)', color: '#fff', ...base },
    ghost:   { background: 'transparent', color: 'var(--text2)', border: '1px solid var(--border2)', ...base },
    danger:  { background: 'var(--red-d)', color: 'var(--red)', border: '1px solid var(--red)', ...base },
    success: { background: 'var(--green-d)', color: 'var(--green)', border: '1px solid var(--green)', ...base },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...variants[variant] || variants.ghost, ...style }}>
      {children}
    </button>
  );
}

export function Input({ label, ...props }) {
  const s = {
    width: '100%', padding: '8px 11px', background: 'var(--bg4)', border: '1px solid var(--border2)',
    borderRadius: 'var(--r)', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'inherit',
  };
  if (!label) return <input style={s} {...props} />;
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text3)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.4px' }}>{label}</label>
      <input style={s} {...props} />
    </div>
  );
}

export function Select({ label, children, ...props }) {
  const s = {
    width: '100%', padding: '8px 11px', background: 'var(--bg4)', border: '1px solid var(--border2)',
    borderRadius: 'var(--r)', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'inherit', cursor: 'pointer',
  };
  if (!label) return <select style={s} {...props}>{children}</select>;
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text3)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.4px' }}>{label}</label>
      <select style={s} {...props}>{children}</select>
    </div>
  );
}

export function Textarea({ label, ...props }) {
  const s = {
    width: '100%', padding: '9px 11px', background: 'var(--bg4)', border: '1px solid var(--border2)',
    borderRadius: 'var(--r)', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'inherit',
    resize: 'vertical', lineHeight: 1.6,
  };
  if (!label) return <textarea style={s} {...props} />;
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text3)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.4px' }}>{label}</label>
      <textarea style={s} {...props} />
    </div>
  );
}

export function Modal({ title, onClose, children, footer, width = 500 }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.65)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 'var(--r-xl)', width: '100%', maxWidth: width, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: 4 }}>×</button>
        </div>
        <div style={{ padding: '18px 20px', overflowY: 'auto', flex: 1 }}>{children}</div>
        {footer && <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 8, flexShrink: 0 }}>{footer}</div>}
      </div>
    </div>
  );
}

export function Spinner({ size = 14 }) {
  return <span style={{ width: size, height: size, border: `2px solid rgba(255,255,255,.2)`, borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin .6s linear infinite', flexShrink: 0 }} />;
}

export function Badge({ children, color = 'var(--blue)' }) {
  return <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 8, background: color + '22', color }}>{children}</span>;
}

export function EmptyState({ icon, title, sub, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text3)' }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>{title}</div>
      {sub && <div style={{ fontSize: 12, marginBottom: 16 }}>{sub}</div>}
      {action}
    </div>
  );
}
