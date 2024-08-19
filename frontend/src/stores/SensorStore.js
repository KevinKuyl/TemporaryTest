import { defineStore } from "pinia";
import axios from "axios";

export const useSensorStore = defineStore("sensor", {
  state: () => ({
    sensors: [
      {
        _id: 0,
        name: "TestSensor",
        pin: 0,
      },
    ],
  }),
  getters: {},
  actions: {
    init() {
      this.getSensorData();
    },

    getSensorData () {
      // fetch data from graphql api
      axios
        .post("http://localhost:4000/graphql", {
          query: `
            query Sensors($filter: findSensorInput, $limit: Int, $offset: Int, $sort: sortInput) {
              sensors(filter: $filter, limit: $limit, offset: $offset, sort: $sort) {
                sensors {
                  _id
                  name
                  pin
                }
                total
              }
            }
        `,
        })
        .then((response) => {
          this.sensors = response.data.data.sensors.sensors;
        })
        .catch((error) => {
          console.log(error);
        });
    },

    addSensor (sensor) {
      axios
        .post("http://localhost:4000/graphql", {
          query: `
            mutation Mutation($sensor: createSensorInput) {
              createSensor(sensor: $sensor) {
                _id
                name
                pin
              }
            }
          `,
          variables: {
            sensor: {
              name: sensor.name,
              pin: sensor.pin,
            },
          },
        })
        .then((response) => {
          this.sensors.push(response.data.data.createSensor);
        })
        .catch((error) => {
          console.log(error);
        });
    },

    deleteSensor (id) {
      axios
        .post("http://localhost:4000/graphql", {
          query: `
            mutation Mutation($id: ID!) {
              deleteSensor(id: $id) {
                _id
              }
            }
          `,
          variables: {
            id,
          },
        })
        .then((response) => {
          const index = this.sensors.findIndex((sensor) => sensor._id === id);
          this.sensors.splice(index, 1);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  },
});
