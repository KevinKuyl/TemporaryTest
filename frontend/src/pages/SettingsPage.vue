<template>
  <q-page class="full-width">
    <!-- 3 tabs: Automatisering, Apparaten, Inputs -->
    <q-tabs
      class="full-width"
      align="justify"
      active-color="white"
      indicator-color="white"
      inline-label
      v-model="tab"
      style="top: 0px; position: sticky; z-index: 1000;"
    >
      <q-tab name="sensors" label="Sensoren" class="text-grey-9" />
      <q-tab name="devices" label="Apparaten" class="text-grey-9" />
      <q-tab name="inputs" label="Inputs" class="text-grey-9" />
    </q-tabs>
    <div class="full-width">
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="sensors">
          <div class="text-h6">Sensoren</div>
          <sensors-tab />
        </q-tab-panel>

        <q-tab-panel name="devices">
          <div class="text-h6">Apparaten</div>
          <devices-tab />
        </q-tab-panel>

        <q-tab-panel name="inputs">
          <div class="text-h6">Inputs</div>
          <inputs-tab />
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from "vue";
import DevicesTab from "src/components/DevicesTab.vue";
import SensorsTab from "src/components/SensorsTab.vue";
import InputsTab from "src/components/InputsTab.vue";

const tab = ref("sensors");
</script>
<style>
.darker {
  background-color: rgba(0, 0, 0, 0.7);
}
.q-img,
.q-img * {
  padding: 0 !important;
}
</style>
