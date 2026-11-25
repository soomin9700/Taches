<script setup lang="ts">
import type { Projet } from '@/types/taches';
import type { StatsProjet } from '@/types/taches';
import { formatDuree } from '@/utils/format';

defineProps<{
  projet: Projet;
  stats: StatsProjet;
}>();

const emit = defineEmits<{
  (e: 'selectionner', id: string): void;
  (e: 'archiver', id: string): void;
  (e: 'supprimer', id: string): void;
}>();
</script>

<template>
  <article class="carte-projet" @click="emit('selectionner', projet.id)">
    <div class="carte-haut">
      <span class="nom-projet">{{ projet.nom }}</span>
      <span class="pourcent">{{ stats.avancement }}%</span>
    </div>

    <div class="barre-fond">
      <div
        class="barre-remplissage"
        :style="{ width: stats.avancement + '%' }"
      ></div>
    </div>

    <div class="carte-meta">
      <span>{{ formatDuree(stats.tempsPasse) }} / {{ formatDuree(stats.dureeEstimee) }}</span>
      <span>{{ stats.nbTachesRacines }} tâche(s)</span>
      <span v-if="stats.debut || stats.fin">
        {{ stats.debut || '...' }} → {{ stats.fin || '...' }}
      </span>
    </div>

    <div class="carte-actions" @click.stop>
      <button type="button" class="btn-mini" @click="emit('archiver', projet.id)">
        Archiver
      </button>
      <button type="button" class="btn-mini" @click="emit('supprimer', projet.id)">
        Supprimer
      </button>
    </div>
  </article>
</template>

<style scoped>
.carte-projet {
  border: 1px solid #d4d4d8;
  background: #ffffff;
  padding: 14px;
  border-radius: 4px;
  cursor: pointer;
}

.carte-projet:hover {
  border-color: #18181b;
}

.carte-haut {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.nom-projet {
  font-size: 15px;
  font-weight: 600;
  color: #18181b;
}

.pourcent {
  font-size: 14px;
  font-weight: 600;
  color: #18181b;
  font-variant-numeric: tabular-nums;
}

.barre-fond {
  height: 4px;
  background: #e4e4e7;
  margin: 8px 0;
  border-radius: 2px;
  overflow: hidden;
}

.barre-remplissage {
  height: 100%;
  background: #18181b;
  transition: width 0.2s;
}

.carte-meta {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 12px;
  color: #52525b;
  font-variant-numeric: tabular-nums;
}

.carte-actions {
  display: flex;
  gap: 6px;
  margin-top: 10px;
}

.btn-mini {
  background: #ffffff;
  color: #18181b;
  border: 1px solid #d4d4d8;
  padding: 3px 8px;
  font-size: 11px;
  border-radius: 3px;
  cursor: pointer;
}

.btn-mini:hover {
  background: #f4f4f5;
}
</style>