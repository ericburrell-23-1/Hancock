const fs = require("fs");
const _ = require("lodash");
let stream = fs.createWriteStream("hancock.txt");

const mass = 170; //lbs
const drag_coeff = 1;
const grav = 32.2;
const cross_sec_area = 5;
const delta_t = 0.001;
const tower_height = 1128; // 1128 is the hight of the Hancock tower
function Air_Density(height) {
  const altitude = height + 597;
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
  const F_grav = mass * grav;
  const F_drag =
    0.5 *
    drag_coeff *
    cross_sec_area *
    Air_Density(object.height) *
    object.velocity *
    object.velocity;
  return F_grav - F_drag;
}

let fall_time = 0;

while (human.height > 0) {
  human.position =
    0.5 * human.acceleration * delta_t * delta_t +
    human.velocity * delta_t +
    human.position_last;
  human.velocity = human.acceleration * delta_t + human.velocity_last;
  human.acceleration = Net_Force(human) / mass;
  stream.write(
    "\n" +
      JSON.stringify(_.pick(human, ["position", "velocity", "acceleration"]))
  );
  human.position_last = human.position;
  human.velocity_last = human.velocity;
  fall_time += delta_t;
}

console.log("Fall takes ", fall_time, "seconds");
