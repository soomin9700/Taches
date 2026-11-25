<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonInput,
  IonItem,
} from '@ionic/vue';
import { signInWithPopup, signInAnonymously, signOut } from 'firebase/auth';
import { auth, googleProvider } from '@/services/firebase';
import { useProjetsInjecte } from '@/composables/useProjets';
import { useTachesInjecte } from '@/composables/useTaches';
import CarteProjet from '@/components/CarteProjet.vue';
import { statsParDefaut } from '@/types/taches';
import { useRouter } from 'vue-router';

const router = useRouter();
const projetsStoreRef = useProjetsInjecte();
const tachesStoreRef = useTachesInjecte();

const projetActifId = ref<string | null>(null);
const nouveauProjetNom = ref('');

const estConnecte = computed(
  () => Boolean(projetsStoreRef.value && tachesStoreRef.value)
);

const projetsVisibles = computed(() => {
  return projetsStoreRef.value?.projetsActifs ?? [];
});

const ouvrirProjet = (projetId: string) => {
  router.push(`/tabs/projets/${projetId}`);
};

const creerProjet = async () => {
  const pStore = projetsStoreRef.value;
  if (!pStore || !nouveauProjetNom.value.trim()) return;
  const id = await pStore.ajouterProjet(nouveauProjetNom.value.trim());
  nouveauProjetNom.value = '';
  if (id) {
    projetActifId.value = id;
  }
};

const archiverProjet = async (projetId: string) => {
  const pStore = projetsStoreRef.value;
  if (!pStore) return;
  await pStore.archiverProjet(projetId, true);
  if (projetActifId.value === projetId) {
    projetActifId.value = null;
  }
};

const supprimerProjet = async (projetId: string) => {
  const pStore = projetsStoreRef.value;
  if (!pStore) return;
  await pStore.supprimerProjet(projetId);
  if (projetActifId.value === projetId) {
    projetActifId.value = null;
  }
};
</script>

<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Mes Projets</ion-title>
        <ion-button
          v-if="estConnecte"
          slot="end"
          fill="clear"
          size="small"
          @click="signOut(auth)"
        >
          Déconnexion
        </ion-button>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <!-- 1. Si non connecté, afficher les boutons de connexion -->
      <div v-if="!estConnecte" class="bloc-connexion">
        <p>Connecte-toi pour gérer tes projets et tâches :</p>
        <ion-button expand="block" @click="signInWithPopup(auth, googleProvider)">
          Continuer avec Google
        </ion-button>
        <ion-button expand="block" fill="outline" @click="signInAnonymously(auth)">
          Mode invité (Anonyme)
        </ion-button>
      </div>

      <template v-else>
        <form class="form-nouveau-projet" @submit.prevent="creerProjet">
          <ion-item>
            <ion-input
              v-model="nouveauProjetNom"
              placeholder="Nom du nouveau projet..."
              clear-input
            />
            <ion-button
              slot="end"
              type="submit"
              :disabled="!nouveauProjetNom.trim()"
            >
              Créer
            </ion-button>
          </ion-item>
        </form>

        <div class="liste-projets">
          <CarteProjet
            v-for="projet in projetsVisibles"
            :key="projet.id"
            :projet="projet"
            :stats="projetsStoreRef?.getStatsProjet(projet.id) ?? statsParDefaut"
            @selectionner="ouvrirProjet"
            @archiver="archiverProjet"
            @supprimer="supprimerProjet"
          />
        </div>
      </template>
    </ion-content>
  </ion-page>
</template>