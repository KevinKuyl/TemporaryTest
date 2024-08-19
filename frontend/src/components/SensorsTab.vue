<template>
  <q-item>
    <q-item-section>
      <q-btn
        flat
        dense
        icon="add"
        style="max-width:300px"
        @click="popModal()"
      />
    </q-item-section>
  </q-item>

  <q-item v-for="sensor, idx in sensors.sensors" :key="idx">
    <q-item-section avatar>
      <q-icon color="primary" name="sensors" />
    </q-item-section>
    <q-item-section>{{ sensor.name }}</q-item-section>
  </q-item>

  <q-dialog v-model="showModal">
    <q-card>
      <q-card-section>
        <div>Nieuwe sensor toevoegen</div>
        <q-input
          v-model="newSensorName"
          label="Sensor naam"
          dense
        />
        <q-input
          v-model="newSensorPin"
          label="Sensor pin"
          dense
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          label="Cancel"
          color="primary"
          flat
          dense
          @click="showModal = false"
        />
        <q-btn
          label="Add"
          color="primary"
          flat
          dense
          @click="addSensor"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { ref } from 'vue';
import { useSensorStore } from 'src/stores/SensorStore';

const showModal = ref(false);
const newSensorName = ref('');
const newSensorPin = ref('');

const sensors = useSensorStore();
sensors.init();

const popModal = function () {
  showModal.value = true;
};

const addSensor = function () {
  sensors.addSensor({
    name: newSensorName.value,
    pin: newSensorPin.value,
  });
  newSensorName.value = '';
  newSensorPin.value = '';
  showModal.value = false;
};

const deleteSensor = function (idx) {
  sensors.deleteSensor(idx);
};
</script>
