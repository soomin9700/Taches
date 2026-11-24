<script setup lang="ts">
import { ref } from 'vue';
import { IonButton } from '@ionic/vue';
import { signInWithPopup, signInAnonymously } from 'firebase/auth';
import { auth, googleProvider } from '@/services/firebase';

const chargement = ref(false);
const erreurMsg = ref('');

const connexionGoogle = async () => {
  erreurMsg.value = '';
  chargement.value = true;
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (err) {
    erreurMsg.value = err instanceof Error ? err.message : 'Erreur de connexion Google.';
  } finally {
    chargement.value = false;
  }
};

const connexionAnonyme = async () => {
  erreurMsg.value = '';
  chargement.value = true;
  try {
    await signInAnonymously(auth);
  } catch (err) {
    erreurMsg.value = err instanceof Error ? err.message : 'Erreur d’accès rapide.';
  } finally {
    chargement.value = false;
  }
};
</script>

<template>
  <section class="bloc-connexion">
    <h2 class="titre-connexion">Connexion</h2>
    <p class="texte-connexion">
      Connectez-vous pour synchroniser vos projets et tâches sur Firestore.
    </p>

    <div class="actions-connexion">
      <ion-button :disabled="chargement" @click="connexionGoogle">
        Continuer avec Google
      </ion-button>
      <ion-button fill="outline" :disabled="chargement" @click="connexionAnonyme">
        Accès rapide
      </ion-button>
    </div>

    <p v-if="erreurMsg" class="erreur-connexion">{{ erreurMsg }}</p>
  </section>
</template>

<style scoped>
.bloc-connexion {
  max-width: 420px;
  margin: 32px auto;
  padding: 20px;
  border: 1px solid #d4d4d8;
  border-radius: 4px;
  background: #ffffff;
  text-align: center;
}

.titre-connexion {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: #18181b;
}

.texte-connexion {
  margin: 0 0 16px;
  font-size: 13px;
  color: #52525b;
}

.actions-connexion {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.erreur-connexion {
  margin-top: 12px;
  font-size: 12px;
  color: #b91c1c;
}
</style>