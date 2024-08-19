<template>
  <q-page class="flex flex-center">
    <!-- 3 tabs: Sensoren, Apparaten, Inputs -->
    <q-tabs
      class="bg-primary
      text-white"
      align="justify"
      active-color="white"
      indicator-color="white"
      inline-label
    >
      <q-tab name="sensors" label="Automatisering" />
      <q-tab name="devices" label="Apparaten" />
      <q-tab name="inputs" label="Inputs" />
    </q-tabs>

    <q-tab-panel name="sensors">
        <q-circular-progress
          show-value
          font-size="15px"
          value="100"
          color="blue"
          icon="water_drop"
          size="100px"
          class="q-ma-md"
        >
          <q-icon name="water_drop" />
          100%
        </q-circular-progress>
    </q-tab-panel>

    <q-tab-panel name="devices">
        <q-circular-progress
          show-value
          font-size="15px"
          value="100"
          color="blue"
          icon="water_drop"
          size="100px"
          class="q-ma-md"
        >
          <q-icon name="water_drop" />
          100%
        </q-circular-progress>
    </q-tab-panel>

    <q-tab-panel name="inputs">
        <q-circular-progress
          show-value
          font-size="15px"
          value="100"
          color="blue"
          icon="water_drop"
          size="100px"
          class="q-ma-md"
        >
          <q-icon name="water_drop" />
          100%
        </q-circular-progress>
    </q-tab-panel>
  </q-page>
</template>

<script setup>

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
