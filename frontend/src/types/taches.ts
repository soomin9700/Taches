import type { Ref, ComputedRef } from 'vue';
import type { Timestamp } from 'firebase/firestore';

export type StatutTache = 'A_FAIRE' | 'EN_COURS' | 'TERMINE';

export interface Projet {
  id: string;
  nom: string;
  est_archive: boolean;
  date_creation?: Timestamp | null;
}

export interface Tache {
  id: string;
  projet_id: string | null;
  parent_id: string | null; // null = tâche racine, sinon ID de la tâche parente (profondeur infinie)
  titre: string;
  date_debut: string | null; // format ISO 'YYYY-MM-DD'
  date_fin: string | null;   // format ISO 'YYYY-MM-DD'
  duree_estimee_min: number;
  temps_passe_min: number;
  avancement: number;        // entier entre 0 et 100
  statut: StatutTache;
  date_creation?: Timestamp | null;
}

export type NouvelleTachePayload = Omit<Tache, 'id' | 'date_creation'>;

export type MiseAJourTachePayload = Partial<Omit<Tache, 'id' | 'date_creation'>>;

export interface PlageDates {
  debut: string | null;
  fin: string | null;
}

export interface TachesStore {
  projets: Ref<Projet[]>;
  taches: Ref<Tache[]>;
  tachesRacines: ComputedRef<Tache[]>;
  chronoActifId: Ref<string | null>;
  secondesChrono: Ref<number>;
  getEnfants: (parentId: string) => Tache[];
  getDureeEstimee: (tache: Tache) => number;
  getTempsPasse: (tache: Tache) => number;
  getAvancement: (tache: Tache) => number;
  getPlageDates: (tache: Tache) => PlageDates;
  ajouterTache: (payload: NouvelleTachePayload) => Promise<string>;
  modifierTache: (tacheId: string, champs: MiseAJourTachePayload) => Promise<void>;
  supprimerTache: (tacheId: string) => Promise<void>;
  basculerChrono: (tache: Tache) => Promise<void>;
  nettoyer: () => void;
}