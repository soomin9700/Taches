<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Tache } from '@/types/taches';
import { useTachesInjecte } from '@/composables/useTaches';
import { formatDuree, formatChrono } from '@/utils/format';

const props = defineProps<{
  tache: Tache;
  niveau?: number;
}>();

const store = useTachesInjecte();

const ouvert = ref(true);
const ajoutVisible = ref(false);
const nouveauTitre = ref('');
const nouvelleDuree = ref(30);
const nouvelleDebut = ref('');
const nouvelleFin = ref('');

const enfants = computed(() => store.value?.getEnfants(props.tache.id) ?? []);
const estFeuille = computed(() => enfants.value.length === 0);
const avancement = computed(() => store.value?.getAvancement(props.tache) ?? props.tache.avancement);
const dureeEstimee = computed(() => store.value?.getDureeEstimee(props.tache) ?? props.tache.duree_estimee_min);
const tempsPasse = computed(() => store.value?.getTempsPasse(props.tache) ?? props.tache.temps_passe_min);
const plageDates = computed(() =>
  store.value?.getPlageDates(props.tache) ?? {
    debut: props.tache.date_debut,
    fin: props.tache.date_fin,
  }
);
const chronoEnCours = computed(() => store.value?.chronoActifId === props.tache.id);

const soumettreEnfant = async () => {
  if (!nouveauTitre.value.trim()) return;
  await store.value?.ajouterTache({
    projet_id: props.tache.projet_id,
    parent_id: props.tache.id,
    titre: nouveauTitre.value.trim(),
    date_debut: nouvelleDebut.value || null,
    date_fin: nouvelleFin.value || null,
    duree_estimee_min: Number(nouvelleDuree.value) || 0,
    temps_passe_min: 0,
    avancement: 0,
    statut: 'A_FAIRE',
  });
  nouveauTitre.value = '';
  nouvelleDuree.value = 30;
  nouvelleDebut.value = '';
  nouvelleFin.value = '';
  ajoutVisible.value = false;
  ouvert.value = true;
};

const changerAvancementManuel = async (val: number) => {
  const v = Math.min(100, Math.max(0, val));
  await store.value?.modifierTache(props.tache.id, {
    avancement: v,
    statut: v === 100 ? 'TERMINE' : v > 0 ? 'EN_COURS' : 'A_FAIRE',
  });
};

const ajouterTempsRapide = async (minutes: number) => {
  const nouveauTemps = (props.tache.temps_passe_min || 0) + minutes;
  const nouvelAvancement =
    props.tache.duree_estimee_min > 0
      ? Math.min(100, Math.round((nouveauTemps / props.tache.duree_estimee_min) * 100))
      : props.tache.avancement;

  await store.value?.modifierTache(props.tache.id, {
    temps_passe_min: nouveauTemps,
    avancement: nouvelAvancement,
    statut: nouvelAvancement === 100 ? 'TERMINE' : 'EN_COURS',
  });
};
</script>

<template>
  <div class="noeud" :style="{ marginLeft: (niveau || 0) > 0 ? '20px' : '0' }">
    <div class="carte-tache" :class="{ termine: avancement === 100 }">
      <div class="ligne-haut">
        <div class="titre-bloc">
          <button v-if="!estFeuille" class="btn-icone" @click="ouvert = !ouvert">
            {{ ouvert ? '−' : '+' }}
          </button>
          <input
            v-else
            type="checkbox"
            :checked="avancement === 100"
            @change="changerAvancementManuel(avancement === 100 ? 0 : 100)"
          />
          <span class="titre" :class="{ barre: avancement === 100 }">{{ tache.titre }}</span>
          <span v-if="!estFeuille" class="badge">Groupe</span>
        </div>

        <div class="meta-droite">
          <span v-if="plageDates.debut || plageDates.fin" class="dates">
            {{ plageDates.debut || '...' }} → {{ plageDates.fin || '...' }}
          </span>
          <span class="temps">
            {{ formatDuree(tempsPasse) }} / {{ formatDuree(dureeEstimee) }}
          </span>
          <span class="pourcent">{{ avancement }}%</span>
        </div>
      </div>

      <div class="barre-fond">
        <div class="barre-remplissage" :style="{ width: avancement + '%' }"></div>
      </div>

      <div class="actions-bas">
        <template v-if="estFeuille">
          <button
            class="btn-action"
            :class="{ actif: chronoEnCours }"
            @click="store?.basculerChrono(tache)"
          >
            {{ chronoEnCours ? `Pause (${formatChrono(store?.secondesChrono ?? 0)})` : 'Chrono' }}
          </button>
          <button class="btn-action" @click="ajouterTempsRapide(20)">+20m</button>
          <label class="curseur-label">
            <input  
              type="range"
              min="0"
              max="100"
              step="5"
              :value="avancement"
              @input="changerAvancementManuel(Number(($event.target as HTMLInputElement).value))"
            />
          </label>
        </template>

        <button class="btn-action" @click="ajoutVisible = !ajoutVisible">+ Sous-tâche</button>
        <button class="btn-action danger" @click="store?.supprimerTache(tache.id)">Supprimer</button>
      </div>

      <form v-if="ajoutVisible" class="form-enfant" @submit.prevent="soumettreEnfant">
        <input v-model="nouveauTitre" type="text" placeholder="Titre de la sous-tâche" required />
        <input v-model.number="nouvelleDuree" type="number" min="0" placeholder="Min" class="input-court" />
        <input v-model="nouvelleDebut" type="date" title="Date début" />
        <input v-model="nouvelleFin" type="date" title="Date fin" />
        <button type="submit" class="btn-primaire">Ajouter</button>
      </form>
    </div>

    <div v-if="ouvert && enfants.length" class="enfants">
      <TachesNoeud
        v-for="enfant in enfants"
        :key="enfant.id"
        :tache="enfant"
        :niveau="(niveau || 0) + 1"
      />
    </div>
  </div>
</template>

<style scoped>
.noeud { margin-top: 8px; }
.carte-tache { border: 1px solid #d4d4d8; background: #ffffff; padding: 10px 12px; border-radius: 4px; }
.carte-tache.termine { background: #fafafa; color: #71717a; }
.ligne-haut { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
.titre-bloc { display: flex; align-items: center; gap: 8px; }
.titre { font-weight: 500; font-size: 14px; color: #18181b; }
.titre.barre { text-decoration: line-through; color: #71717a; }
.badge { font-size: 11px; border: 1px solid #d4d4d8; padding: 1px 6px; color: #52525b; border-radius: 3px; }
.meta-droite { display: flex; align-items: center; gap: 12px; font-size: 12px; color: #52525b; font-variant-numeric: tabular-nums; }
.pourcent { font-weight: 600; color: #18181b; min-width: 34px; text-align: right; }
.barre-fond { height: 4px; background: #e4e4e7; margin: 8px 0; border-radius: 2px; overflow: hidden; }
.barre-remplissage { height: 100%; background: #18181b; transition: width 0.2s; }
.actions-bas { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.btn-icone, .btn-action { border: 1px solid #d4d4d8; background: #ffffff; color: #27272a; font-size: 12px; padding: 3px 8px; border-radius: 3px; cursor: pointer; }
.btn-action:hover { background: #f4f4f5; }
.btn-action.actif { background: #18181b; color: #ffffff; border-color: #18181b; }
.btn-action.danger:hover { border-color: #18181b; }
.form-enfant { display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap; }
.form-enfant input { border: 1px solid #d4d4d8; padding: 4px 8px; font-size: 13px; border-radius: 3px; }
.input-court { width: 70px; }
.btn-primaire { background: #18181b; color: #ffffff; border: none; padding: 5px 10px; font-size: 12px; border-radius: 3px; cursor: pointer; }
.enfants { border-left: 1px solid #e4e4e7; padding-left: 4px; }
</style>