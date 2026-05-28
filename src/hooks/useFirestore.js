import { useState, useEffect, useCallback } from 'react';
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc,
  doc, query, orderBy, serverTimestamp, where, getDocs
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { DEMO_PROSPECTS } from '../lib/data';

// ── Prospects ──────────────────────────────────────────────
export function useProspects() {
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db,'prospects'), orderBy('createdAt','desc'));
    const unsub = onSnapshot(q, snap => {
      if(snap.empty) {
        DEMO_PROSPECTS.forEach(p =>
          addDoc(collection(db,'prospects'), {...p, createdAt: serverTimestamp(), lastContactAt: null})
        );
      } else {
        setProspects(snap.docs.map(d => ({...d.data(), id: d.id})));
      }
      setLoading(false);
    }, () => { setProspects(DEMO_PROSPECTS.map((p,i)=>({...p,id:String(i+1)})));setLoading(false); });
    return unsub;
  }, []);

  const add = useCallback(async data => {
    const {id:_,...clean} = data;
    await addDoc(collection(db,'prospects'), {...clean, createdAt: serverTimestamp(), lastContactAt: null});
  },[]);

  const update = useCallback(async (id, updates) => {
    await updateDoc(doc(db,'prospects',id), updates);
  },[]);

  const remove = useCallback(async id => {
    await deleteDoc(doc(db,'prospects',id));
  },[]);

  return { prospects, loading, add, update, remove };
}

// ── Emails ─────────────────────────────────────────────────
export function useEmails() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db,'emails'), orderBy('time','desc'));
    const unsub = onSnapshot(q, snap => {
      setEmails(snap.docs.map(d=>({...d.data(),id:d.id})));
      setLoading(false);
    }, () => { setEmails([]); setLoading(false); });
    return unsub;
  },[]);

  const addEmail = useCallback(async data => {
    await addDoc(collection(db,'emails'), {...data, time: new Date().toISOString()});
  },[]);

  const markRead = useCallback(async id => {
    await updateDoc(doc(db,'emails',id), {read:true});
  },[]);

  return { emails, loading, addEmail, markRead };
}

// ── Alerts & Reminders ─────────────────────────────────────
export function useAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db,'alerts'), orderBy('createdAt','desc'));
    const unsub = onSnapshot(q, snap => {
      setAlerts(snap.docs.map(d=>({...d.data(),id:d.id})));
      setLoading(false);
    }, () => { setAlerts([]); setLoading(false); });
    return unsub;
  },[]);

  const addAlert = useCallback(async data => {
    await addDoc(collection(db,'alerts'), {...data, createdAt: serverTimestamp(), triggered: false, dismissed: false});
  },[]);

  const updateAlert = useCallback(async (id, updates) => {
    await updateDoc(doc(db,'alerts',id), updates);
  },[]);

  const removeAlert = useCallback(async id => {
    await deleteDoc(doc(db,'alerts',id));
  },[]);

  const dismissAlert = useCallback(async id => {
    await updateDoc(doc(db,'alerts',id), {dismissed:true, dismissedAt: new Date().toISOString()});
  },[]);

  return { alerts, loading, addAlert, updateAlert, removeAlert, dismissAlert };
}

// ── Alert Rules (parametrable) ─────────────────────────────
export function useAlertRules() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db,'alertRules'), snap => {
      if(snap.empty) {
        // Default rules
        [
          {type:'no_contact', label:'Sans contact depuis', days:7,  active:true},
          {type:'stage_time', label:'En étape depuis',     days:14, active:true, stage:'proposal'},
          {type:'follow_up',  label:'Relance après',       days:3,  active:true},
        ].forEach(r => addDoc(collection(db,'alertRules'), {...r, createdAt: serverTimestamp()}));
      } else {
        setRules(snap.docs.map(d=>({...d.data(),id:d.id})));
      }
      setLoading(false);
    }, () => { setLoading(false); });
    return unsub;
  },[]);

  const addRule = useCallback(async data => {
    await addDoc(collection(db,'alertRules'), {...data, createdAt: serverTimestamp(), active: true});
  },[]);

  const updateRule = useCallback(async (id, updates) => {
    await updateDoc(doc(db,'alertRules',id), updates);
  },[]);

  const removeRule = useCallback(async id => {
    await deleteDoc(doc(db,'alertRules',id));
  },[]);

  return { rules, loading, addRule, updateRule, removeRule };
}

// ── Activities log ─────────────────────────────────────────
export function useActivities() {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const q = query(collection(db,'activities'), orderBy('time','desc'));
    const unsub = onSnapshot(q, snap => {
      setActivities(snap.docs.map(d=>({...d.data(),id:d.id})));
    }, ()=>{});
    return unsub;
  },[]);

  const log = useCallback(async (type, text, prospectId=null) => {
    await addDoc(collection(db,'activities'), {
      type, text, prospectId,
      time: new Date().toISOString()
    });
  },[]);

  return { activities, log };
}
