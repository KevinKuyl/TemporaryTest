<template>
  <q-page class="flex flex-center">
    <q-img
      src="https://cdn.quasar.dev/img/parallax2.jpg"
      height="100vh"
      fit="fill"
    >
      <div class="absolute-full text-subtitle2 q-pa-md">
        <div class="row darker q-ma-none w-pa-none">
          <div class="col q-ma-xs flex flex-center">Buiten: 25°C</div>
          <div class="col q-ma-xs flex flex-center">Binnen: 25°C</div>
          <div class="col q-ma-xs flex flex-center">Boiler: 25°C</div>
          <div class="col q-ma-xs flex flex-center">Electronica: 25°C</div>
        </div>

        <div class="row full-height">
          <div class="col-2 flex flex-center text-center">
            <div>
              <radial-sensor-reading
                color="grey-8"
                icon="format_color_reset"
                size="150px"
                :value="values.water.grey"
              />
              <q-circular-progress
                show-value
                font-size="15px"
                :value="values.water.clean.volume"
                size="150px"
                :thickness="0.22"
                color="blue"
                track-color="grey-3"
                class="q-ma-md"
              >
                <q-circular-progress
                  show-value
                  font-size="15px"
                  :value="values.water.clean.temperature"
                  size="150px"
                  :thickness="0.22"
                  color="red"
                  track-color="grey-3"
                  class="q-ma-md"
                >
                  <div class="col text-center">
                    <q-icon name="water" size="15px" />
                    {{ values.water.clean.volume }}% <br />
                    <q-icon name="device_thermostat" size="15px" />
                    {{ values.water.clean.temperature }}°C
                  </div>
                </q-circular-progress>
              </q-circular-progress>
            </div>
          </div>

          <div class="col flex flex-center">
            <div class="col-12 text-h3 text-center" style="height: 80vh">
              <div>{{ time }}</div>
              <div class="text-h6">{{ date }}</div>
            </div>
            <div class="col-12 text-center">
              <q-icon
                name="power_settings_new"
                size="80px"
                color="red"
                class="q-ma-md"
              />
              <q-icon
                name="power_settings_new"
                size="80px"
                color="green"
                class="q-ma-md"
              />
              <q-icon
                name="power_settings_new"
                size="80px"
                color="red"
                class="q-ma-md"
              />

              <q-icon
                name="power_settings_new"
                size="80px"
                color="red"
                class="q-ma-md"
              />
              <q-icon
                name="power_settings_new"
                size="80px"
                color="red"
                class="q-ma-md"
              />
              <q-icon
                name="power_settings_new"
                size="80px"
                color="red"
                class="q-ma-md"
              />

              <q-icon
                name="power_settings_new"
                size="80px"
                color="red"
                class="q-ma-md"
              />
              <q-icon
                name="power_settings_new"
                size="80px"
                color="red"
                class="q-ma-md"
              />
              <q-icon
                name="power_settings_new"
                size="80px"
                color="red"
                class="q-ma-md"
              />
              <q-icon
                name="power_settings_new"
                size="80px"
                color="red"
                class="q-ma-md"
              />
            </div>
          </div>

          <div class="col-2 flex flex-center text-center">
            <div>
              <q-circular-progress
                show-value
                font-size="15px"
                :value="values.power.lead.volts"
                size="150px"
                :thickness="0.44"
                color="yellow-9"
                track-color="grey-3"
                class="q-ma-md"
              >
                <q-icon name="electric_bolt" size="15px" />
                {{ values.power.lead.volts }}V
              </q-circular-progress>
              <q-circular-progress
                show-value
                font-size="15px"
                :value="values.power.lithium.volts"
                size="150px"
                :thickness="0.22"
                color="teal"
                track-color="grey-3"
                class="q-ma-md"
              >
                <q-circular-progress
                  show-value
                  font-size="15px"
                  :value="values.power.lithium.usage"
                  size="150px"
                  :thickness="0.22"
                  color="teal"
                  track-color="grey-3"
                  class="q-ma-md"
                >
                  <div class="col text-center">
                    <q-icon name="electric_bolt" size="15px" />
                    {{ values.power.lithium.volts }}V <br />
                    <q-icon name="electric_meter" size="15px" />
                    {{ values.power.lithium.usage }}A
                  </div>
                </q-circular-progress>
              </q-circular-progress>
            </div>
          </div>
        </div>
      </div>
    </q-img>
  </q-page>
</template>

<script setup>
import { ref } from "vue";
import RadialSensorReading from "src/components/RadialSensorReading.vue";

const time = ref(new Date().toLocaleTimeString());
const date = ref(
  new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
);

const values = ref({
  water: {
    clean: {
      volume: 85,
      temperature: 25,
    },
    grey: 25,
  },
  power: {
    lithium: {
      volts: 11.5,
      usage: 50,
    },
    lead: {
      volts: 10,
      usage: 50,
    },
  },
});

const switches = ref([
  {
    fn() {
      // execute something here
      console.log("button clicked");
    },
    state: "false",
  },
]);

const update = setInterval(() => {
  time.value = new Date().toLocaleTimeString();
  date.value = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}, 500);
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
