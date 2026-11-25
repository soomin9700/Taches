import { ref, computed, inject, type InjectionKey, type Ref, type ComputedRef } from 'vue';
import { stockageService } from '@/services/stockage';
import type { Projet, Tache, PlageDates, ProjetsStore,StatsProjet } from '@/types/taches';

export const ProjetsStoreKey: InjectionKey<Ref<ProjetsStore | null>> = Symbol('ProjetsStore');

export function useProjets(
  userId: string,
  taches: Ref<Tache[]>,
  getDureeEstimee: (tache: Tache) => number,
  getTempsPasse: (tache: Tache) => number,
  getAvancement: (tache: Tache) => number,
  getPlageDates: (tache: Tache) => PlageDates
): ProjetsStore {
  const projets = ref<Projet[]>([]);

  const unsubProjets = stockageService.ecouterProjets(userId, (data) => {
    projets.value = data;
  });

  const projetsActifs = computed(() => projets.value.filter((p) => !p.est_archive));

  const ajouterProjet = async (nom: string): Promise<string> => {
    const propre = nom.trim();
    if (!propre) return '';
    return stockageService.ajouterProjet(userId, propre);
  };

  const renommerProjet = async (projetId: string, nom: string): Promise<void> => {
    const propre = nom.trim();
    if (!propre) return;
    await stockageService.renommerProjet(userId, projetId, propre);
  };

  const archiverProjet = async (projetId: string, estArchive: boolean): Promise<void> => {
    await stockageService.archiverProjet(userId, projetId, estArchive);
  };

  const supprimerProjet = async (projetId: string): Promise<void> => {
    const idsLies = taches.value.filter((t) => t.projet_id === projetId).map((t) => t.id);
    await stockageService.supprimerProjet(userId, projetId, idsLies);
  };

  const getStatsProjet = (projetId: string): StatsProjet => {
    const racines = taches.value.filter(
      (t) => t.parent_id === null && t.projet_id === projetId
    );

    if (!racines.length) {
      return {
        dureeEstimee: 0,
        tempsPasse: 0,
        avancement: 0,
        debut: null,
        fin: null,
        nbTachesRacines: 0,
      };
    }

    const dureeEstimee = racines.reduce((acc, t) => acc + getDureeEstimee(t), 0);
    const tempsPasse = racines.reduce((acc, t) => acc + getTempsPasse(t), 0);

    let avancement = 0;
    if (dureeEstimee > 0) {
      const sommePonderee = racines.reduce(
        (acc, t) => acc + getDureeEstimee(t) * getAvancement(t),
        0
      );
      avancement = Math.round(sommePonderee / dureeEstimee);
    } else {
      avancement = Math.round(
        racines.reduce((acc, t) => acc + getAvancement(t), 0) / racines.length
      );
    }

    const debuts: string[] = [];
    const fins: string[] = [];

    racines.forEach((t) => {
      const plage = getPlageDates(t);
      if (plage.debut) debuts.push(plage.debut);
      if (plage.fin) fins.push(plage.fin);
    });

    return {
      dureeEstimee,
      tempsPasse,
      avancement,
      debut: debuts.length ? [...debuts].sort()[0] : null,
      fin: fins.length ? [...fins].sort().reverse()[0] : null,
      nbTachesRacines: racines.length,
    };
  };

  const nettoyer = () => {
    unsubProjets();
  };

    return {
    get projets() {
      return projets.value;
    },
    get projetsActifs() {
      return projetsActifs.value;
    },
    ajouterProjet,
    renommerProjet,
    archiverProjet,
    supprimerProjet,
    getStatsProjet,
    nettoyer,
  };
}

export function useProjetsInjecte(): Ref<ProjetsStore | null> {
  const storeRef = inject(ProjetsStoreKey);
  if (!storeRef) {
    throw new Error('ProjetsStore non fourni dans App.vue');
  }
  return storeRef;
}