<template>
  <q-layout view="lHh Lpr lFf">
    <q-drawer v-model="globalsStore.drawer" bordered>
      <q-list>
        <q-item-label header> Menu </q-item-label>

        <EssentialLink
          v-for="link in linksList"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { useGlobalsStore } from "src/stores/GlobalsStore";
import EssentialLink from "components/EssentialLink.vue";

const globalsStore = useGlobalsStore();

defineOptions({
  name: "MainLayout",
});

const linksList = [
  {
    title: "Home",
    caption: "Overzicht van alle data",
    icon: "home",
    link: "/",
  },
  {
    title: "Instellingen",
    caption: "Apparaten, sensoren",
    icon: "settings",
    link: "/settings",
  },
  {
    title: "Automatisering",
    caption: "Automatische taken en regels",
    icon: "precision_manufacturing",
    link: "https://github.com/quasarframework",
  },
];
</script>
