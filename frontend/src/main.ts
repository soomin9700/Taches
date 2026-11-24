import { createApp } from 'vue';
import { IonicVue } from '@ionic/vue';
import App from './App.vue';
import router from './router/index.js';

/* CSS indispensable au fonctionnement des composants Ionic */
import '@ionic/vue/css/core.css';
/* CSS de base (mise en forme minimale du texte et des titres) */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';
/* Classes utilitaires : ion-padding, ion-text-center, ion-margin-top... */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';
/* Mode sombre automatique selon le réglage du téléphone */
import '@ionic/vue/css/palettes/dark.system.css';
import { restaurerPanier } from '@/composables/usePanier';
/* Couleurs de l'application */
import './theme/variables.css';
import { restaurerFavoris } from '@/composables/useFavoris'



const app = createApp(App)
  .use(IonicVue)   // active Ionic dans Vue
  .use(router);    // active la navigation

Promise.all([router.isReady(), restaurerPanier() , restaurerFavoris()]).then(() => {
  app.mount('#app');
});