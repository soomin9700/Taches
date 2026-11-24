<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet />


      <ion-tab-bar slot="bottom">

        <ion-tab-button tab="projets" href="/tabs/projets">
          <ion-icon :icon="folderOutline" />
          <ion-label>Projets</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonTabs,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonBadge
} from '@ionic/vue';
import {
  restaurantOutline,
  cartOutline,
  receiptOutline,
  folderOutline,
} from 'ionicons/icons';



</script>