import "./node_modules/lodash/lodash.js";
import "./node_modules/plotly.js-dist/plotly.js";
// const fs = require("fs");
// let stream = fs.createWriteStream("hancock.txt");

const mass = 170; // lbs
const drag_coeff = 1;
const cross_sec_area = 5;
const delta_t = 0.001;
const tower_height = 1128; // 1128 feet is the hight of the Hancock tower
const grav = 32.17405; // ft/s^2 at an altitude of 0 feet
const radius_earth = 20925722; // feet
const city_elevation = 597; // 597 feet is the elevation of Chicago
function Grav(height) {
  const altitude = height + city_elevation;
  return grav * (radius_earth / (radius_earth + altitude));
}
function Air_Density(height) {
  const altitude = height + city_elevation;
  if (altitude < 5000) return 0.0765 - (2.12 / 1000000) * altitude;
  return 0.0753 - (1.88 / 1000000) * altitude;
}

let human = {
  position: 0, // vertical feet from the top of the tower
  position_last: 0,
  velocity: 0, // feet per second
  velocity_last: 0,
  acceleration: 0,
  get height() {
    return tower_height - this.position;
  },
};

function Net_Force(object) {
  const F_grav = mass * Grav(object.height);
  const F_drag =
    0.5 *
    drag_coeff *
    cross_sec_area *
    Air_Density(object.height) *
    object.velocity *
    object.velocity;
  return F_grav - F_drag;
}

let traceData = {
  height: [],
  velocity: [],
  acceleration: [],
  force_gravity: [],
  force_drag: [],
  time: [],
};

let fall_time = 0;

while (human.height > 0) {
  human.position =
    0.5 * human.acceleration * delta_t * delta_t +
    human.velocity * delta_t +
    human.position_last;
  human.velocity = human.acceleration * delta_t + human.velocity_last;
  human.acceleration = Net_Force(human) / mass;
  // stream.write(
  //   "\n" +
  //     JSON.stringify(_.pick(human, ["position", "velocity", "acceleration"]))
  // );
  traceData.height.push(human.height);
  traceData.velocity.push(human.velocity);
  traceData.acceleration.push(human.acceleration);
  human.position_last = human.position;
  human.velocity_last = human.velocity;
  fall_time += delta_t;
}

traceData.time = _.range(0, fall_time, delta_t);

var heightData = {
  x: traceData.time,
  y: traceData.height,
  type: "scatter",
};

var velocityData = {
  x: traceData.time,
  y: traceData.velocity,
  type: "scatter",
};

var accelerationData = {
  x: traceData.time,
  y: traceData.acceleration,
  type: "scatter",
};

Plotly.newPlot("height", [heightData]);
Plotly.newPlot("velocity", [velocityData]);
Plotly.newPlot("acceleration", [accelerationData]);

console.log("Fall takes ", fall_time, "seconds");
