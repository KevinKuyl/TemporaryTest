import express from "express";
import http from "http";
import bodyParser from "body-parser";
import cors from "cors";
import mongooseClient from "./database/mongooseClient.js";
import five from "johnny-five";
import RotaryEncoder from "./utils/RotaryEncoder.js";
//import process from "process";

import Sensor from "./modules/Sensor/models/sensor.js";
import Input from "./modules/Input/models/input.js";
import Device from "./modules/Device/models/device.js";
import Encoder from "./modules/Encoder/models/encoder.js";
import Sonar from "./modules/Sonar/models/sonar.js";
import PWMDevice from "./modules/PWMDevice/models/pwmDevice.js";
import Automation from "./modules/Automation/models/automation.js";

import { application } from "./application.js";
import { config } from "./services/config.js";
import { permissions } from "./services/permissions.js";
import { setupApolloServer } from "./services/apollo.js";
import { getUser } from "./services/tokens/resolve.js";
import { expressMiddleware } from "@apollo/server/express4";
import { applyMiddleware } from "graphql-middleware";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { execute, subscribe } from "graphql";
import { set } from "mongoose";

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ extended: true, limit: "5mb" }));
app.use(cors());

app.use((req, res, next) => {
  next();
});

app.use("/graphql", (req, res, next) => {
  const { query, variables, operationName } = req.body;
  next();
});

function getUserFromToken(token) {
  if (token.startsWith("Bearer ")) {
    const tokenString = token.slice(7, token.length);
    const user = getUser(tokenString);

    return user;
  }
}

async function startServer() {
  await mongooseClient.connect();

  const schema = application.createSchemaForApollo();
  const server = setupApolloServer({
    schema: applyMiddleware(schema, permissions),
    introspection: config.dev,
  });
  await server.start();

  app.use(
    expressMiddleware(server, {
      context: async ({ req }) => {
        let origin = req.headers.origin;
        const apiKey = req.headers["x-api-key"];
        const token = req.headers.authorization || "";
        const user = getUserFromToken(token);
        let filter;
        return { origin, user, apiKey, filter };
      },
    })
  );

  const httpServer = http.createServer(app);
  await httpServer.listen(4000);
  console.log(
    "🚀 GraphQL Server ------ ready at http://localhost:4000/graphql"
  );

  const subscriptionServer = SubscriptionServer.create(
    {
      schema: applyMiddleware(schema, permissions),
      execute,
      subscribe,
      onConnect: (connectionParams, webSocket, context) => {
        const user = getUserFromToken(connectionParams.Authorization || "");
        return { user };
      },
    },
    {
      server: httpServer,
      path: "/graphql",
    }
  );
  console.log("👾 Subscription Server - ready at ws://localhost:4000/graphql");
}

startServer();

// fetch all sensors and continuously update their values
const board = new five.Board();

board.on("ready", async function () {
  console.log("Arduino board is ready, fetching configuration...");
  const sensors = await Sensor.find({}).exec();
  const encoders = await Encoder.find({}).exec(); // rotary encoders
  const sonars = await Sonar.find({}).exec(); // sonar sensors
  const inputs = await Input.find({}).exec(); // inputs are buttons
  const devices = await Device.find({}).exec(); // on/off devices
  const pwmDevices = await PWMDevice.find({}).exec(); // dimmable devices, servos, etc.

  console.log(`    sensors: ${sensors.length}
    inputs: ${inputs.length}
    devices: ${devices.length}`);

  sonars.forEach((sensor) => {
    console.log(`Sonar: ${sensor.name}, pin: ${sensor.pin}`);

    const sonar = new five.Proximity({
      controller: "HCSR04",
      pin: "A0",
      freq: 10000,
    });

    const readings = [];
    const maxReadings = 50;

    sonar.on("data", function () {
      if (readings.length >= maxReadings) {
        readings.shift();
      }
      readings.push(this.cm);

      const average =
        readings.reduce((sum, value) => sum + value, 0) / readings.length;
      console.log(`Average Distance: ${average.toFixed(2)} cm`);
      Sonar.updateOne(
        { _id: sensor._id },
        { $set: { distance: average.toFixed(2) } }
      ).exec();
    });

    sonar.on("change", function () {
      //console.log(`Distance changed: ${this.cm} cm`);
    });
  });

  inputs.forEach((input) => {
    console.log(`Input: ${input.name}, pin: ${input.pin}`);
    const update = async (input) => {
      await Input.updateOne({ _id: input._id }, { $set: { value: input.value } }).exec();
      //find all automations for this input
      const automations = await Automation.find({
        inModel: "Input",
        inId: input._id,
      }).exec();
      automations.forEach(async (automation) => {
        switch (automation.setModel) {
          case "Device":
            const device = await Device.findById(automation.setId).exec();
            if (device) {
              device.value = input.value;
              const led = new five.Led(device.pin);
              if (input.value >= 0) {
                led.on();
              } else {
                led.off();
              }
              await device.save();
            }
            break;
          case "PWMDevice":
            const pwmDevice = await PWMDevice.findById(automation.setId).exec();
            if (pwmDevice) {
              pwmDevice.value = input.value === 1 ? 255 : 0;
              const pwm = new five.Led(pwmDevice.pin);
              pwm.brightness(pwmDevice.value);
              await pwmDevice.save();
            }
            break;
          default:
            break;
        }
      });
    };
  
    const button = new five.Button(input.pin);

    button.on("release", async () => {
      input.value = input.value === 1 ? 0 : 1;
      update(input);
    });
  });

  encoders.forEach(async (encoder) => {
    console.log(
      `Encoder: ${encoder.name}, up: ${encoder.upPin}, down: ${encoder.downPin}, button: ${encoder.buttonPin}`
    );
    const upButton = new five.Button(encoder.upPin);
    const downButton = new five.Button(encoder.downPin);
    const pressButton = new five.Button(encoder.buttonPin);
    const min = encoder.range[0];
    const max = encoder.range[1];

    const automations = await Automation.find({
      inModel: "Encoder",
      inId: encoder._id,
    }).exec();

    const update = async (encoder) => {
      await Encoder.updateOne(
        { _id: encoder._id },
        { $set: { value: encoder.value } }
      ).exec();

      console.log(`Automations: ${automations.length}`);

      automations.forEach(async (automation) => {
        switch (automation.setModel) {
          case "PWMDevice":
            const device = await PWMDevice.findById(automation.setId).exec();
            if (device) {
              device.value = encoder.value;
              // update the device
              const pwm = new five.Led(device.pin);
              pwm.brightness(device.value);
              await device.save();
            }
            break;
          default:
            break;
        }
      });
    };

    RotaryEncoder({
      upButton,
      downButton,
      pressButton,
      onUp: () => {
        if (encoder.value < max) {
          encoder.value += encoder.step;
          update(encoder);
        }
        console.log(`Encoder: ${encoder.name} up: ${encoder.value}`);
      },
      onDown: () => {
        if (encoder.value > min) {
          encoder.value -= encoder.step;
          update(encoder);
        }
        console.log(`Encoder: ${encoder.name} down: ${encoder.value}`);
      },
      onPress: () => {
        console.log(`Encoder: ${encoder.name} button press`);
      },
    });
  });

  pwmDevices.forEach((device) => {
    console.log(
      `PWM Device: ${device.name}, pin: ${device.pin}, value: ${device.value}`
    );
    const pwm = new five.Led(device.pin);
    pwm.brightness(device.value);
  });
});
