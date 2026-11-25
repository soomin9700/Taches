import type { Ref, ComputedRef, InjectionKey } from 'vue';
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
  parent_id: string | null; 
  titre: string;
  date_debut: string | null; 
  date_fin: string | null;   
  duree_estimee_min: number;
  temps_passe_min: number;
  avancement: number;      
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
  projets:Projet[];
  taches: Tache[];
  tachesRacines: ComputedRef<Tache[]>;
  chronoActifId: string | null;
  secondesChrono:  number;
  getEnfants: (parentId: string) => Tache[];
  getDureeEstimee: (tache: Tache) => number;
  getTempsPasse: (tache: Tache) => number;
  getAvancement: (tache: Tache) => number;
  getPlageDates: (tache: Tache) => { debut: string | null; fin: string | null };
  ajouterTache: (payload: Omit<Tache, 'id' | 'date_creation'>) => Promise<string>;
  modifierTache: (tacheId: string, champs: Partial<Tache>) => Promise<void>;
  supprimerTache: (tacheId: string) => Promise<void>;
  basculerChrono: (tache: Tache) => Promise<void>;
  nettoyer: () => void;
}

export interface StatsProjet {
  dureeEstimee: number;
  tempsPasse: number;
  avancement: number;
  debut: string | null;
  fin: string | null;
  nbTachesRacines: number;
}

export interface ProjetsStore {
  projets: Projet[];
  projetsActifs: Projet[];
  ajouterProjet: (nom: string) => Promise<string>;
  renommerProjet: (projetId: string, nom: string) => Promise<void>;
  archiverProjet: (projetId: string, estArchive: boolean) => Promise<void>;
  supprimerProjet: (projetId: string) => Promise<void>;
  getStatsProjet: (projetId: string) => StatsProjet;
  nettoyer: () => void;
}
export const statsParDefaut: StatsProjet = {
  dureeEstimee: 0,
  tempsPasse: 0,
  avancement: 0,
  debut: null,
  fin: null,
  nbTachesRacines: 0,
};
export const TachesStoreKey: InjectionKey<ComputedRef<TachesStore | null>> = Symbol('TachesStore');
export const ProjetsStoreKey: InjectionKey<ComputedRef<ProjetsStore | null>> = Symbol('ProjetsStore');