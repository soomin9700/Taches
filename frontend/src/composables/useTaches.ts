import { ref, computed, inject, type InjectionKey, type ComputedRef } from 'vue';
import { stockageService } from '@/services/stockage';
import type { Projet, Tache } from '@/types/taches';

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

export const TachesStoreKey: InjectionKey<ComputedRef<TachesStore | null>> = Symbol('TachesStore');

export function useTaches(userId: string): TachesStore {
  const projets = ref<Projet[]>([]);
  const taches = ref<Tache[]>([]);
  const chronoActifId = ref<string | null>(null);
  const secondesChrono = ref<number>(0);
  let intervalId: number | null = null;

  const unsubProjets = stockageService.ecouterProjets(userId, (data) => {
    projets.value = data;
  });

  const unsubTaches = stockageService.ecouterTaches(userId, (data) => {
    taches.value = data;
  });

  const getEnfants = (parentId: string) =>
    taches.value.filter((t) => t.parent_id === parentId);

  const getDureeEstimee = (tache: Tache): number => {
    const enfants = getEnfants(tache.id);
    if (!enfants.length) return Number(tache.duree_estimee_min) || 0;
    return enfants.reduce((acc, e) => acc + getDureeEstimee(e), 0);
  };

  const getTempsPasse = (tache: Tache): number => {
    const enfants = getEnfants(tache.id);
    if (!enfants.length) return Number(tache.temps_passe_min) || 0;
    return enfants.reduce((acc, e) => acc + getTempsPasse(e), 0);
  };

  const getAvancement = (tache: Tache): number => {
    const enfants = getEnfants(tache.id);
    if (!enfants.length) return Math.min(100, Math.max(0, tache.avancement || 0));

    const poidsTotal = enfants.reduce((acc, e) => acc + getDureeEstimee(e), 0);
    if (poidsTotal > 0) {
      const sommePonderee = enfants.reduce(
        (acc, e) => acc + getDureeEstimee(e) * getAvancement(e),
        0
      );
      return Math.round(sommePonderee / poidsTotal);
    }

    const moyenne = enfants.reduce((acc, e) => acc + getAvancement(e), 0) / enfants.length;
    return Math.round(moyenne);
  };

  const getPlageDates = (tache: Tache): { debut: string | null; fin: string | null } => {
    const enfants = getEnfants(tache.id);
    if (!enfants.length) return { debut: tache.date_debut, fin: tache.date_fin };

    const debuts: string[] = tache.date_debut ? [tache.date_debut] : [];
    const fins: string[] = tache.date_fin ? [tache.date_fin] : [];

    enfants.forEach((e) => {
      const p = getPlageDates(e);
      if (p.debut) debuts.push(p.debut);
      if (p.fin) fins.push(p.fin);
    });

    return {
      debut: debuts.length ? [...debuts].sort()[0] : null,
      fin: fins.length ? [...fins].sort().reverse()[0] : null,
    };
  };

  const ajouterTache = (payload: Omit<Tache, 'id' | 'date_creation'>) =>
    stockageService.ajouterTache(userId, payload);

  const modifierTache = (tacheId: string, champs: Partial<Tache>) =>
    stockageService.modifierTache(userId, tacheId, champs);

  const supprimerTache = async (tacheId: string) => {
    const collecter = (pid: string): string[] => {
      const enfants = getEnfants(pid);
      return enfants.reduce((acc, e) => [...acc, e.id, ...collecter(e.id)], [] as string[]);
    };
    await stockageService.supprimerTacheCascade(userId, [tacheId, ...collecter(tacheId)]);
  };

  const basculerChrono = async (tache: Tache) => {
    if (chronoActifId.value === tache.id) {
      if (intervalId) clearInterval(intervalId);
      const minutesAjoutees = Math.max(1, Math.round(secondesChrono.value / 60));
      chronoActifId.value = null;
      secondesChrono.value = 0;

      const nouveauTemps = (tache.temps_passe_min || 0) + minutesAjoutees;
      const nouvelAvancement =
        tache.duree_estimee_min > 0
          ? Math.min(100, Math.round((nouveauTemps / tache.duree_estimee_min) * 100))
          : tache.avancement;

      await modifierTache(tache.id, {
        temps_passe_min: nouveauTemps,
        avancement: nouvelAvancement,
        statut: nouvelAvancement === 100 ? 'TERMINE' : 'EN_COURS',
      });
    } else {
      if (chronoActifId.value) {
        const ancienne = taches.value.find((t) => t.id === chronoActifId.value);
        if (ancienne) await basculerChrono(ancienne);
      }
      chronoActifId.value = tache.id;
      secondesChrono.value = 0;
      intervalId = window.setInterval(() => {
        secondesChrono.value++;
      }, 1000);
    }
  };

  const tachesRacines = computed(() => taches.value.filter((t) => t.parent_id === null));

  const nettoyer = () => {
    unsubProjets();
    unsubTaches();
    if (intervalId) clearInterval(intervalId);
  };
return {
    get projets() {
      return projets.value;
    },
    get taches() {
      return taches.value;
    },
    tachesRacines,
    get chronoActifId() {
      return chronoActifId.value;
    },
    get secondesChrono() {
      return secondesChrono.value;
    },
    getEnfants,
    getDureeEstimee,
    getTempsPasse,
    getAvancement,
    getPlageDates,
    ajouterTache,
    modifierTache,
    supprimerTache,
    basculerChrono,
    nettoyer,
  };
}

export function useTachesInjecte(): ComputedRef<TachesStore | null> {
  const store = inject(TachesStoreKey);
  if (!store) {
    throw new Error('TachesStore non fourni : appelle provide(TachesStoreKey, store) dans le parent.');
  }
  return store;
}