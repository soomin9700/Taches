<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonBackButton,
  IonButtons,
} from '@ionic/vue';
import { signInWithPopup, signInAnonymously, signOut } from 'firebase/auth';
import { auth, googleProvider } from '@/services/firebase';
import { useProjetsInjecte } from '@/composables/useProjets';
import { useTachesInjecte } from '@/composables/useTaches';
import { formatDuree } from '@/utils/format';
import TachesNoeud from '@/components/TachesNoeud.vue';

const route = useRoute();
const router = useRouter();


const projetsStoreRef = useProjetsInjecte();
const tachesStoreRef = useTachesInjecte();

const projetId = computed(() => String(route.params.id ?? ''));

const nouvelleTacheTitre = ref('');
const nouvelleTacheDuree = ref(60);
const nouvelleTacheDebut = ref('');
const nouvelleTacheFin = ref('');

const estConnecte = computed(
  () => Boolean(projetsStoreRef.value && tachesStoreRef)
);

const projetActif = computed(() => {
  if (!projetsStoreRef.value || !projetId.value) return null;
  return (
    projetsStoreRef.value.projets.find((p) => p.id === projetId.value) ?? null
  );
});

const statsProjetActif = computed(() => {
  if (!projetsStoreRef.value || !projetId.value) return null;
  return projetsStoreRef.value.getStatsProjet(projetId.value);
});

const tachesRacinesProjet = computed(() => {
  if (!tachesStoreRef.value || !projetId.value) return [];
  return tachesStoreRef.value.tachesRacines.value.filter(
    (t) => t.projet_id === projetId.value
  );
});

const creerTacheRacine = async () => {
  const tStore = tachesStoreRef.value;
  if (!tStore || !projetId.value || !nouvelleTacheTitre.value.trim()) return;

  await tStore.ajouterTache({
    projet_id: projetId.value,
    parent_id: null,
    titre: nouvelleTacheTitre.value.trim(),
    date_debut: nouvelleTacheDebut.value || null,
    date_fin: nouvelleTacheFin.value || null,
    duree_estimee_min: Number(nouvelleTacheDuree.value) || 0,
    temps_passe_min: 0,
    avancement: 0,
    statut: 'A_FAIRE',
  });

  nouvelleTacheTitre.value = '';
  nouvelleTacheDebut.value = '';
  nouvelleTacheFin.value = '';
};

const retourProjets = () => {
  router.push('/tabs/projets');
};
</script>

<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/projets" />
        </ion-buttons>
        <ion-title>{{ projetActif ? projetActif.nom : 'Tâches' }}</ion-title>
        <ion-button v-if="estConnecte" slot="end" fill="clear" @click="signOut(auth)">
          Déconnexion
        </ion-button>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      
      <div v-if="!estConnecte" class="bloc-auth">
        <p>Connectez-vous pour accéder aux tâches de ce projet.</p>
        <div class="ligne-gap">
          <ion-button @click="signInWithPopup(auth, googleProvider)">
            Continuer avec Google
          </ion-button>
          <ion-button fill="outline" @click="signInAnonymously(auth)">
            Accès rapide
          </ion-button>
        </div>
      </div>

     
      <div v-else-if="!projetActif" class="vide">
        <p>Projet introuvable ou chargement en cours.</p>
        <button type="button" class="btn-primaire" @click="retourProjets">
          Retour aux projets
        </button>
      </div>

      
      <div v-else class="conteneur">
        <section v-if="statsProjetActif" class="resume-projet">
          <div class="resume-ligne">
            <span>
              Avancement : <strong>{{ statsProjetActif.avancement }}%</strong>
            </span>
            <span>
              Temps :
              <strong>
                {{ formatDuree(statsProjetActif.tempsPasse) }} /
                {{ formatDuree(statsProjetActif.dureeEstimee) }}
              </strong>
            </span>
            <span v-if="statsProjetActif.debut || statsProjetActif.fin">
              {{ statsProjetActif.debut || '...' }} → {{ statsProjetActif.fin || '...' }}
            </span>
          </div>
          <div class="barre-fond">
            <div
              class="barre-remplissage"
              :style="{ width: statsProjetActif.avancement + '%' }"
            ></div>
          </div>
        </section>

        <form class="barre-ajout" @submit.prevent="creerTacheRacine">
          <input
            v-model="nouvelleTacheTitre"
            type="text"
            placeholder="Nouvelle tâche..."
            required
          />
          <input
            v-model.number="nouvelleTacheDuree"
            type="number"
            min="0"
            placeholder="Min"
            class="input-court"
          />
          <input v-model="nouvelleTacheDebut" type="date" />
          <input v-model="nouvelleTacheFin" type="date" />
          <button type="submit" class="btn-primaire">Ajouter</button>
        </form>

        <div v-if="!tachesRacinesProjet.length" class="vide">
          Aucune tâche dans ce projet.
        </div>

        <TachesNoeud
          v-for="tache in tachesRacinesProjet"
          :key="tache.id"
          :tache="tache"
        />
      </div>
    </ion-content>
  </ion-page>
</template>
<style scoped>
.conteneur {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 900px;
  margin: 0 auto;
  padding-bottom: 2rem;
}

/* Bloc authentification & état vide */
.bloc-auth,
.vide {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 0.75rem;
  padding: 2rem 1.25rem;
  border-radius: 12px;
  background: var(--ion-card-background, var(--ion-background-color, #fff));
  border: 1px solid var(--ion-border-color, rgba(0, 0, 0, 0.08));
  color: var(--ion-color-step-600, #555);
}

.ligne-gap {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
}

/* Résumé du projet */
.resume-projet {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  padding: 1rem;
  border-radius: 12px;
  background: var(--ion-card-background, var(--ion-background-color, #fff));
  border: 1px solid var(--ion-border-color, rgba(0, 0, 0, 0.08));
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.resume-ligne {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem 1rem;
  font-size: 0.9rem;
}

.barre-fond {
  width: 100%;
  height: 8px;
  border-radius: 999px;
  background: var(--ion-color-step-150, #e5e7eb);
  overflow: hidden;
}

.barre-remplissage {
  height: 100%;
  border-radius: 999px;
  background: var(--ion-color-primary, #3880ff);
  transition: width 0.25s ease;
}

/* Formulaire d'ajout de tâche (mobile-first) */
.barre-ajout {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 0.9rem;
  border-radius: 12px;
  background: var(--ion-card-background, var(--ion-background-color, #fff));
  border: 1px solid var(--ion-border-color, rgba(0, 0, 0, 0.08));
}

.barre-ajout input {
  width: 100%;
  min-height: 40px;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  border: 1px solid var(--ion-color-step-250, #cbd5e1);
  background: var(--ion-background-color, #ffffff);
  color: var(--ion-text-color, #111827);
  font-size: 0.92rem;
  box-sizing: border-box;
}

.barre-ajout input:focus {
  outline: none;
  border-color: var(--ion-color-primary, #3880ff);
  box-shadow: 0 0 0 2px rgba(56, 128, 255, 0.15);
}

.btn-primaire {
  min-height: 40px;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  background: var(--ion-color-primary, #3880ff);
  color: var(--ion-color-primary-contrast, #ffffff);
  font-weight: 600;
  font-size: 0.92rem;
  cursor: pointer;
  transition: opacity 0.15s ease, transform 0.1s ease;
}

.btn-primaire:hover {
  opacity: 0.92;
}

.btn-primaire:active {
  transform: scale(0.98);
}

/* Tablette / Desktop */
@media (min-width: 640px) {
  .barre-ajout {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
  }

  .barre-ajout input[type='text'] {
    flex: 1 1 200px;
    width: auto;
  }

  .barre-ajout .input-court {
    width: 95px;
    flex: 0 0 auto;
  }

  .barre-ajout input[type='date'] {
    width: auto;
    flex: 0 1 155px;
  }

  .btn-primaire {
    flex-shrink: 0;
  }
}
</style>