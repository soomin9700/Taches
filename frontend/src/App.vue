<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import {
  ref,
  shallowRef,
  computed,
  provide,
  onUnmounted,
} from 'vue';
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/services/firebase';
import { useTaches, TachesStoreKey, type TachesStore } from '@/composables/useTaches';
import { useProjets, ProjetsStoreKey } from '@/composables/useProjets';
import type { ProjetsStore, Tache } from '@/types/taches';



const utilisateur = ref<User | null>(null);
const storeActif = shallowRef<TachesStore | null>(null);
const projetsStoreActif = shallowRef<ProjetsStore | null>(null);

const tachesFournies = computed<TachesStore | null>(() => storeActif.value);
const projetsFournis = computed<ProjetsStore | null>(() => projetsStoreActif.value);

provide(TachesStoreKey, tachesFournies);
provide(ProjetsStoreKey, projetsFournis);

const unsubAuth = onAuthStateChanged(auth, (user) => {
  projetsStoreActif.value?.nettoyer();
  storeActif.value?.nettoyer();
  projetsStoreActif.value = null;
  storeActif.value = null;

  utilisateur.value = user;

  if (user) {
    const tachesInstance = useTaches(user.uid);
    storeActif.value = tachesInstance;

    const tachesRef = computed<Tache[]>(() => tachesInstance.taches);

    projetsStoreActif.value = useProjets(
      user.uid,
      tachesRef,
      tachesInstance.getDureeEstimee,
      tachesInstance.getTempsPasse,
      tachesInstance.getAvancement,
      tachesInstance.getPlageDates
    );
  }
});

onUnmounted(() => {
  unsubAuth();
  projetsStoreActif.value?.nettoyer();
  storeActif.value?.nettoyer();
});
</script>