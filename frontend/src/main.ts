import { createApp } from 'vue';
import { IonicVue } from '@ionic/vue';
import App from './App.vue';
import router from './router/index.js';

/* Initialisation Firebase (auth + firestore) */
import '@/services/firebase';

/* CSS indispensable au fonctionnement des composants Ionic */
import '@ionic/vue/css/core.css';
/* CSS de base */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';
/* Classes utilitaires */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';
/* Mode sombre automatique */
import '@ionic/vue/css/palettes/dark.system.css';



/* Couleurs de l'application */
import './theme/variables.css';

const app = createApp(App)
  .use(IonicVue)
  .use(router);

Promise.all([router.isReady()]).then(() => {
  app.mount('#app');
});