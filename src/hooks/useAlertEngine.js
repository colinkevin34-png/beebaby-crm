import { useEffect, useCallback } from 'react';
import { daysSince } from '../lib/data';

export function useAlertEngine({ prospects, emails, rules, alerts, addAlert, log }) {
  const checkAlerts = useCallback(() => {
    if (!rules.length || !prospects.length) return;

    rules.filter(r => r.active).forEach(rule => {
      prospects.forEach(prospect => {
        const alertKey = `${rule.id}_${prospect.id}`;
        const alreadyActive = alerts.some(a =>
          a.ruleId === rule.id && a.prospectId === prospect.id && !a.dismissed
        );
        if (alreadyActive) return;

        let shouldFire = false;
        let message = '';

        if (rule.type === 'no_contact') {
          const days = daysSince(prospect.lastContactAt || prospect.createdAt?.toDate?.()?.toISOString());
          if (days >= (rule.days || 7) && !['won','lost'].includes(prospect.stage)) {
            shouldFire = true;
            message = `${prospect.prenom} ${prospect.nom} — aucun contact depuis ${days} jours`;
          }
        }

        if (rule.type === 'stage_time') {
          const days = daysSince(prospect.stageChangedAt || prospect.createdAt?.toDate?.()?.toISOString());
          const matchStage = !rule.stage || rule.stage === prospect.stage;
          if (days >= (rule.days || 14) && matchStage && !['won','lost'].includes(prospect.stage)) {
            shouldFire = true;
            message = `${prospect.prenom} ${prospect.nom} (${prospect.entreprise}) est en étape "${prospect.stage}" depuis ${days} jours`;
          }
        }

        if (rule.type === 'follow_up') {
          const lastEmail = emails
            .filter(e => e.prospectId === prospect.id && e.type === 'sent')
            .sort((a,b) => new Date(b.time) - new Date(a.time))[0];
          if (lastEmail) {
            const days = daysSince(lastEmail.time);
            const hasReply = emails.some(e => e.prospectId === prospect.id && e.type === 'inbox' && new Date(e.time) > new Date(lastEmail.time));
            if (days >= (rule.days || 3) && !hasReply && !['won','lost'].includes(prospect.stage)) {
              shouldFire = true;
              message = `Email sans réponse de ${prospect.prenom} ${prospect.nom} depuis ${days} jours`;
            }
          }
        }

        if (shouldFire) {
          addAlert({
            ruleId: rule.id,
            type: rule.type,
            prospectId: prospect.id,
            prospectName: `${prospect.prenom} ${prospect.nom}`,
            prospectEmail: prospect.email,
            entreprise: prospect.entreprise,
            message,
            priority: prospect.priorite === 'Haute' ? 'high' : 'normal',
          });
        }
      });
    });
  }, [prospects, emails, rules, alerts, addAlert]);

  useEffect(() => {
    const t = setTimeout(checkAlerts, 2000);
    return () => clearTimeout(t);
  }, [prospects, rules]);
}
