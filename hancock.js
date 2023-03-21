import "./node_modules/lodash/lodash.js";
import "./node_modules/plotly.js-dist/plotly.js";
// const fs = require("fs");
// let stream = fs.createWriteStream("hancock.txt");

const calculateFall = (event) => {
  let mass = document.getElementById("weight").value; // lbs
  let drag_coeff = document.getElementById("C_drag").value;
  let cross_sec_area = document.getElementById("CSArea").value;
  const tower_height = document.getElementById("tower_height").value; // 1128 feet is the hight of the Hancock tower
  const city_elevation = 597; // 597 feet is the elevation of Chicago
  const delta_t = 0.001;
  const grav = 32.17405; // ft/s^2 at an altitude of 0 feet
  const radius_earth = 20925722; // feet
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
    const F_net = F_grav - F_drag;
    traceData.force_gravity.push(F_grav);
    traceData.force_drag.push(F_drag);
    traceData.force_net.push(F_net);
    return F_net;
  }

  let traceData = {
    height: [],
    velocity: [],
    acceleration: [],
    force_gravity: [],
    force_drag: [],
    force_net: [],
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
    line: {
      color: "blue",
    },
  };

  var velocityData = {
    x: traceData.time,
    y: traceData.velocity,
    type: "scatter",
    line: {
      color: "red",
    },
  };

  var accelerationData = {
    x: traceData.time,
    y: traceData.acceleration,
    type: "scatter",
    line: {
      color: "orange",
    },
  };

  var force_gravityData = {
    x: traceData.time,
    y: traceData.force_gravity,
    type: "scatter",
    line: {
      color: "purple",
    },
  };

  var force_dragData = {
    x: traceData.time,
    y: traceData.force_drag,
    type: "scatter",
    line: {
      color: "cyan",
    },
  };
  var force_netData = {
    x: traceData.time,
    y: traceData.force_net,
    type: "scatter",
    line: {
      color: "green",
    },
  };

  var heightLayout = {
    xaxis: { range: [0, fall_time], title: "Time (s)" },
    yaxis: {
      title: "Height (ft)",
    },
    title: "Faller Height vs. Time",
  };

  var velocityLayout = {
    xaxis: { range: [0, fall_time], title: "Time (s)" },
    yaxis: {
      title: "Velocity (ft/s)",
    },
    title: "Faller Velocity vs. Time",
  };

  var accelerationLayout = {
    xaxis: { range: [0, fall_time], title: "Time (s)" },
    yaxis: {
      min: 0,
      range: [
        _.min([0, _.min(traceData.acceleration)]),
        _.max(traceData.acceleration) * 1.1,
      ],
      title: "Acceleration (ft/s^2)",
    },
    title: "Faller Acceleration vs. Time",
  };
  function ForceLayout(title) {
    var forceLayout = {
      xaxis: { range: [0, fall_time], title: "Time (s)" },
      yaxis: {
        title: "Force (lb)",
        range: [0, _.max(traceData.force_gravity) * 1.1],
      },
      title: title,
    };
    return forceLayout;
  }

  // Create Plots
  Plotly.newPlot("height", [heightData], heightLayout);
  Plotly.newPlot("velocity", [velocityData], velocityLayout);
  Plotly.newPlot("acceleration", [accelerationData], accelerationLayout);
  Plotly.newPlot(
    "force_grav",
    [force_gravityData],
    ForceLayout("Gravitational Force")
  );
  Plotly.newPlot("force_drag", [force_dragData], ForceLayout("Drag"));
  Plotly.newPlot("force_net", [force_netData], ForceLayout("Net Force"));

  console.log("Fall takes ", fall_time, "seconds");
  console.log("Drag coefficient: ", drag_coeff);
  let finalVelocity =
    traceData.velocity[traceData.velocity.length - 1].toFixed(1);
  document.getElementById("finalVelocity").innerHTML = finalVelocity.toString();
  document.getElementById("fallTime").innerHTML = fall_time
    .toFixed(3)
    .toString();
  console.log("Final velocity: ", finalVelocity);
  if (event) {
    event.preventDefault();
  }
};
document
  .getElementById("updateConstants")
  .addEventListener("submit", calculateFall);

calculateFall();
