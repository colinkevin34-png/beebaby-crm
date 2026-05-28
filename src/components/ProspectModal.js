import React, { useState } from 'react';
import { SECTORS, PRIORITIES, STAGES } from '../lib/data';
import { Modal, Input, Select, Textarea, Btn } from './UI';

export default function ProspectModal({ initial = {}, onClose, onSave }) {
  const [f, setF] = useState({
    prenom:'', nom:'', entreprise:'', email:'', tel:'',
    montant:'', secteur:'Digital', priorite:'Haute', stage:'new', notes:'',
    ...initial
  });
  const set = k => e => setF(p => ({...p, [k]: e.target.value}));

  return (
    <Modal
      title={initial.id ? 'Modifier le prospect' : 'Nouveau prospect'}
      onClose={onClose}
      width={520}
      footer={<>
        <Btn onClick={onClose}>Annuler</Btn>
        <Btn variant="primary" onClick={() => {
          if(!f.prenom||!f.nom) { alert('Prénom et nom requis'); return; }
          onSave({...f, montant: parseInt(f.montant)||0});
        }}>
          {initial.id ? 'Enregistrer' : 'Ajouter le prospect'}
        </Btn>
      </>}
    >
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <Input label="Prénom *" value={f.prenom} onChange={set('prenom')} placeholder="Jean" />
          <Input label="Nom *"    value={f.nom}    onChange={set('nom')}    placeholder="Dupont" />
        </div>
        <Input label="Entreprise" value={f.entreprise} onChange={set('entreprise')} placeholder="Acme Corp" />
        <Input label="Email" type="email" value={f.email} onChange={set('email')} placeholder="jean@entreprise.fr" />
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <Input label="Téléphone" value={f.tel} onChange={set('tel')} placeholder="+33 6 00 00 00 00" />
          <Input label="Montant estimé (€)" type="number" value={f.montant} onChange={set('montant')} placeholder="5000" />
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
          <Select label="Secteur" value={f.secteur} onChange={set('secteur')}>
            {SECTORS.map(s => <option key={s}>{s}</option>)}
          </Select>
          <Select label="Priorité" value={f.priorite} onChange={set('priorite')}>
            {PRIORITIES.map(p => <option key={p}>{p}</option>)}
          </Select>
          <Select label="Étape" value={f.stage} onChange={set('stage')}>
            {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </Select>
        </div>
        <Textarea label="Notes" value={f.notes} onChange={set('notes')} rows={3} placeholder="Notes sur ce prospect..." />
      </div>
    </Modal>
  );
}
