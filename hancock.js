import "https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js";
import "https://cdn.plot.ly/plotly-2.20.0.min.js";

const calculateFall = (event) => {
  const grav = 32.17405; // ft/s^2 at an altitude of 0 feet
  const cityElevation = 597; // 597 feet is the elevation of Chicago
  const radius_earth = 20925722; // feet
  const delta_t = 0.001; // time step over which to iterate
  const mass = document.getElementById("weight").value / grav; // lbs
  const coeff_drag = document.getElementById("coeff_drag").value;
  const area_cs = document.getElementById("area_cs").value; // cross sectional area of falling object ft^2
  const height_tower = document.getElementById("height_tower").value; // 1128 feet is the height of the Hancock tower

  let human = {
    position: 0, // vertical feet from the top of the tower
    position_last: 0,
    velocity: 0, // feet per second
    velocity_last: 0,
    acceleration: 0,
    get height() {
      return height_tower - this.position;
    },
  };

  let traceData = {
    height: [],
    velocity: [],
    acceleration: [],
    force_gravity: [],
    force_drag: [],
    force_net: [],
    time: [],
  };

  let fallTime = 0;

  function Grav(height) {
    const altitude = height + cityElevation;
    return grav * (radius_earth / (radius_earth + altitude));
  }

  function Air_Density(height) {
    const altitude = height + cityElevation;
    if (altitude < 5000) return (0.0765 - (2.12 / 1000000) * altitude) / grav;
    return (0.0753 - (1.88 / 1000000) * altitude) / grav;
  }

  function Net_Force(object) {
    const F_grav = mass * Grav(object.height);
    const F_drag =
      0.5 *
      coeff_drag *
      area_cs *
      Air_Density(object.height) *
      object.velocity *
      object.velocity;
    const F_net = F_grav - F_drag;
    traceData.force_gravity.push(F_grav);
    traceData.force_drag.push(F_drag);
    traceData.force_net.push(F_net);
    return F_net;
  }

  while (human.height > 0) {
    human.position =
      0.5 * human.acceleration * delta_t * delta_t +
      human.velocity * delta_t +
      human.position_last;
    human.velocity = human.acceleration * delta_t + human.velocity_last;
    human.acceleration = Net_Force(human) / mass;

    traceData.height.push(human.height);
    traceData.velocity.push(human.velocity);
    traceData.acceleration.push(human.acceleration);

    human.position_last = human.position;
    human.velocity_last = human.velocity;
    fallTime += delta_t;
  }

  traceData.time = _.range(0, fallTime, delta_t);

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
    name: "Gravity",
    line: {
      color: "purple",
    },
  };

  var force_dragData = {
    x: traceData.time,
    y: traceData.force_drag,
    type: "scatter",
    name: "Drag",
    line: {
      color: "cyan",
    },
  };
  var force_netData = {
    x: traceData.time,
    y: traceData.force_net,
    type: "scatter",
    name: "Net Force",
    line: {
      color: "green",
    },
  };

  var heightLayout = {
    xaxis: { range: [0, fallTime], title: "Time (s)" },
    yaxis: {
      title: "Height (ft)",
    },
    title: "Faller Height vs. Time",
  };

  var velocityLayout = {
    xaxis: { range: [0, fallTime], title: "Time (s)" },
    yaxis: {
      title: "Velocity (ft/s)",
    },
    title: "Faller Velocity vs. Time",
  };

  var accelerationLayout = {
    xaxis: { range: [0, fallTime], title: "Time (s)" },
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
  var forceLayout = {
    xaxis: { range: [0, fallTime], title: "Time (s)" },
    yaxis: {
      title: "Force (lb)",
    },
    title: "Forces at Work",
    legend: {
      y: 0.5,
      traceorder: "reversed",
      font: { size: 16 },
      yref: "paper",
    },
  };

  // Create Plots
  Plotly.newPlot("height", [heightData], heightLayout);
  Plotly.newPlot("velocity", [velocityData], velocityLayout);
  Plotly.newPlot("acceleration", [accelerationData], accelerationLayout);
  Plotly.newPlot(
    "forces",
    [force_netData, force_dragData, force_gravityData],
    forceLayout
  );

  let velocity_final = traceData.velocity[traceData.velocity.length - 1];
  document.getElementById("velocity_final").innerHTML = velocity_final
    .toFixed(1)
    .toString();
  document.getElementById("fallTime").innerHTML = fallTime
    .toFixed(3)
    .toString();

  if (event) {
    event.preventDefault();
  }
};
document
  .getElementById("updateConstants")
  .addEventListener("submit", calculateFall);

calculateFall();
