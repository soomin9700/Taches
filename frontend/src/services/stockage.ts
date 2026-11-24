import {
  collection,
  doc,
  addDoc,
  updateDoc,
  writeBatch,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import type {
  Projet,
  Tache,
  NouvelleTachePayload,
  MiseAJourTachePayload,
} from '@/types/taches';

function projetsCol(userId: string) {
  return collection(db, 'users', userId, 'projets');
}

function tachesCol(userId: string) {
  return collection(db, 'users', userId, 'taches');
}

export const stockageService = {


  ecouterProjets(userId: string, onChange: (projets: Projet[]) => void): Unsubscribe {
    const q = query(projetsCol(userId), orderBy('date_creation', 'asc'));
    return onSnapshot(q, (snapshot) => {
      const liste: Projet[] = snapshot.docs.map((d) => ({
        id: d.id,
        nom: d.data().nom ?? '',
        est_archive: Boolean(d.data().est_archive),
        date_creation: d.data().date_creation ?? null,
      }));
      onChange(liste);
    });
  },

  ecouterTaches(userId: string, onChange: (taches: Tache[]) => void): Unsubscribe {
    const q = query(tachesCol(userId), orderBy('date_creation', 'asc'));
    return onSnapshot(q, (snapshot) => {
      const liste: Tache[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          projet_id: data.projet_id ?? null,
          parent_id: data.parent_id ?? null,
          titre: data.titre ?? '',
          date_debut: data.date_debut ?? null,
          date_fin: data.date_fin ?? null,
          duree_estimee_min: Number(data.duree_estimee_min) || 0,
          temps_passe_min: Number(data.temps_passe_min) || 0,
          avancement: Number(data.avancement) || 0,
          statut: data.statut ?? 'A_FAIRE',
          date_creation: data.date_creation ?? null,
        };
      });
      onChange(liste);
    });
  },


  async ajouterProjet(userId: string, nom: string): Promise<string> {
    const ref = await addDoc(projetsCol(userId), {
      nom,
      est_archive: false,
      date_creation: serverTimestamp(),
    });
    return ref.id;
  },

  async archiverProjet(userId: string, projetId: string, estArchive: boolean): Promise<void> {
    await updateDoc(doc(db, 'users', userId, 'projets', projetId), {
      est_archive: estArchive,
    });
  },

  

  async ajouterTache(userId: string, payload: NouvelleTachePayload): Promise<string> {
    const ref = await addDoc(tachesCol(userId), {
      ...payload,
      date_creation: serverTimestamp(),
    });
    return ref.id;
  },

  async modifierTache(
    userId: string,
    tacheId: string,
    champs: MiseAJourTachePayload
  ): Promise<void> {
    await updateDoc(doc(db, 'users', userId, 'taches', tacheId), champs);
  },

  async supprimerTacheCascade(userId: string, idsASupprimer: string[]): Promise<void> {
    if (!idsASupprimer.length) return;
    const batch = writeBatch(db);
    for (const id of idsASupprimer) {
      batch.delete(doc(db, 'users', userId, 'taches', id));
    }
    await batch.commit();
  },

  async renommerProjet(userId: string, projetId: string, nom: string): Promise<void> {
    await updateDoc(doc(db, 'users', userId, 'projets', projetId), {
      nom: nom.trim(),
    });
  },

  async supprimerProjet(
    userId: string,
    projetId: string,
    tacheIdsDuProjet: string[]
  ): Promise<void> {
    const batch = writeBatch(db);
    for (const tacheId of tacheIdsDuProjet) {
      batch.delete(doc(db, 'users', userId, 'taches', tacheId));
    }
    batch.delete(doc(db, 'users', userId, 'projets', projetId));
    await batch.commit();
  },
};