function lerp(v1, v2, t) {
  return v1 + (v2 - v1) * t;
}

function createArrow(vector, position, color, len) {
  const group = new THREE.Group();
  const arrowMat = new THREE.MeshLambertMaterial({ color: color });

  const arrowGeo = new THREE.ConeBufferGeometry(
    2 * len,
    5 * len,
    parseInt(guiValues.coneTriangles)
  );
  const arrowMesh = new THREE.Mesh(arrowGeo, arrowMat);
  arrowMesh.rotation.x = Math.PI / 2;
  arrowMesh.position.z = 2.5 * len;
  const cylinderGeo = new THREE.CylinderBufferGeometry(
    1 * len,
    1 * len,
    5 * len,
    parseInt(guiValues.cylinderTriangles)
  );
  const cylinderMesh = new THREE.Mesh(cylinderGeo, arrowMat);
  cylinderMesh.rotation.x = Math.PI / 2;
  cylinderMesh.position.z = -2.5 * len;

  group.lookAt(vector);
  group.position.x = position.x;
  group.position.y = position.y;
  group.position.z = position.z;

  // return group;
  scene.add(group);
  group.add(arrowMesh);
  group.add(cylinderMesh);
  return group;
}

function initStats(type) {
  var panelType =
    typeof type !== "undefined" && type && !isNaN(type) ? parseInt(type) : 0;
  var stats = new Stats();

  stats.showPanel(panelType); // 0: fps, 1: ms, 2: mb, 3+: custom
  document.body.appendChild(stats.dom);

  return stats;
}

/*-------------------------------------------------------------------------------------------------------------------------*/
/* 
simulation parameters 
*/
/*-------------------------------------------------------------------------------------------------------------------------*/
var labels = function () {
  this.coordinate_system = "polar";
  this.texture = "skyrmionium";

  // Polar lattice parameters
  this.dtheta = 10;
  this.dr = 0.1;
  this.dr_mult = 0.95;
  this.R_mult = 1.2;

  // square lattice
  this.start_x = -2;
  this.end_x = 2;
  this.start_y = -2;
  this.end_y = 2;

  this.dx = 0.1;
  this.dy = 0.1;

  // common properties
  this.polarization = -1;
  this.charge = -1;
  this.color_scheme = "initial";
  this.textureR = 1;

  // skyrmionium
  this.mult = 2;
  this.offset = 0;

  // geometry params
  this.coneTriangles = 6;
  this.cylinderTriangles = 6;

  this.reset = function () {
    createTexture();
  };

  this.gradient_interp = [255, 255, 255];
  this.background_color = [0, 0, 0];

  this.deltaMultiplier = 0.001;
  this.animateMultiplier = false;
};

var polarCoordProp = function () {
  this.dr = 0.1;
  this.dr_mult = 0.95;
  this.R_mult = 1.2;
};

let guiValues = new labels();
var gui = new dat.GUI();

gui
  .add(guiValues, "texture", ["skyrmionium", "skyrmion"])
  .onChange(function (value) {
    createTexture();
  });

gui
  .add(guiValues, "coordinate_system", ["polar", "square"])
  .onChange(function (value) {
    createTexture();
  });

var polarFolder = gui.addFolder("Polar lattice properties");

polarFolder.add(guiValues, "dr", 0.01, 1, 0.01).onChange(function (value) {
  createTexture();
});

polarFolder.add(guiValues, "dr_mult", 0, 1, 0.001).onChange(function (value) {
  createTexture();
});

polarFolder.add(guiValues, "R_mult", 0.1, 3, 0.1).onChange(function (value) {
  createTexture();
});

let dtheta_possible = [];
for (let i = 1; i <= 180; i += 1) {
  if (360 % i == 0) dtheta_possible.push(i);
}

polarFolder
  .add(guiValues, "dtheta", dtheta_possible)
  .onChange(function (value) {
    createTexture();
  });

var squareFolder = gui.addFolder("Square lattice properties");
squareFolder.add(guiValues, "start_x", -5, 5, 0.01).onChange(function (value) {
  createTexture();
});
squareFolder.add(guiValues, "end_x", -5, 5, 0.01).onChange(function (value) {
  createTexture();
});
squareFolder.add(guiValues, "start_y", -5, 5, 0.01).onChange(function (value) {
  createTexture();
});
squareFolder.add(guiValues, "end_y", -5, 5, 0.01).onChange(function (value) {
  createTexture();
});
squareFolder.add(guiValues, "dx", 0.01, 10, 0.01).onChange(function (value) {
  createTexture();
});
squareFolder.add(guiValues, "dy", 0.01, 10, 0.01).onChange(function (value) {
  createTexture();
});

var textureProperties = gui.addFolder("Texture properties");

textureProperties
  .add(guiValues, "polarization", [-1, 1])
  .onChange(function (value) {
    createTexture();
  });

textureProperties.add(guiValues, "charge", [-1, 1]).onChange(function (value) {
  createTexture();
});

textureProperties
  .add(guiValues, "textureR", 0.01, 5, 0.01)
  .onChange(function (value) {
    createTexture();
  });

var skyrmioniumProps = textureProperties.addFolder("Skyrmionium properties");
skyrmioniumProps.add(guiValues, "mult", 1, 10, 0.01).onChange(function (value) {
  createTexture();
});
skyrmioniumProps.add(guiValues, "offset", 0, 180).onChange(function (value) {
  createTexture();
});

var skyrmionProps = textureProperties.addFolder("Skyrmion properties");

var visProperties = gui.addFolder("geometry/color settings");

visProperties
  .add(guiValues, "color_scheme", ["initial", "gradient"])
  .onChange(function (value) {
    createTexture();
  });

visProperties.addColor(guiValues, "gradient_interp").onChange(function (color) {
  this.background_color = color;
  createTexture();
});

visProperties
  .addColor(guiValues, "background_color")
  .onChange(function (color) {
    renderer.setClearColor(
      new THREE.Color(color[0] / 255, color[1] / 255, color[2] / 255)
    );
  });

visProperties.add(guiValues, "coneTriangles", 2, 64).onChange(function (value) {
  createTexture();
});

visProperties
  .add(guiValues, "cylinderTriangles", 2, 64)
  .onChange(function (value) {
    createTexture();
  });

gui.add(guiValues, "reset");

let arrows = [];

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
});
document.body.appendChild(renderer.domElement);
renderer.setClearColor(new THREE.Color(0, 0, 0));

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(28, 1, 1, 1000);
camera.position.set(30, 30, 50);
camera.lookAt(scene.position);
scene.add(camera);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 0, -1);
camera.add(light);

controls = new THREE.OrbitControls(camera, renderer.domElement);

function render() {
  renderer.render(scene, camera);
}

function resize() {
  W = window.innerWidth;
  H = window.innerHeight;
  renderer.setSize(W, H);
  camera.aspect = W / H;
  camera.updateProjectionMatrix();
  render();
}

function disposeMaterial(material) {
  material.dispose();

  // Dispose textures if they exist
  if (material.map) material.map.dispose();
  if (material.lightMap) material.lightMap.dispose();
  if (material.bumpMap) material.bumpMap.dispose();
  if (material.normalMap) material.normalMap.dispose();
  if (material.specularMap) material.specularMap.dispose();
  if (material.envMap) material.envMap.dispose();
  // Dispose any other textures you might have
}

function clearScene() {
  for (let i = 0; i < arrows.length; ++i) {
    arrows[i].traverse(function (object) {
      if (object.geometry) {
        object.geometry.dispose();
      }
      if (object.material) {
        // If the material is an array of materials, dispose each one
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => disposeMaterial(material));
        } else {
          disposeMaterial(object.material);
        }
      }
    });
    scene.remove(arrows[i]);
    arrows[i] = null;
  }
  arrows = [];
}

function Theta(r, R) {
  return Math.PI * (1 - r / R);
}

function Phi(angle, offset) {
  return angle + offset;
}

/*------------------------------------------------------------------------------------*/
//  Skyrmionium
function polarCoordLatticeSkyrmionium() {
  let pol = guiValues.polarization;
  let charge = guiValues.charge;
  let r = 0;
  let R = parseFloat(guiValues.R_mult);
  let theta = 0;
  let dr = parseFloat(guiValues.dr);
  let dr_mult = parseFloat(guiValues.dr_mult);
  let dtheta = parseInt(guiValues.dtheta);
  let eps = 1e-9;
  let offset = (parseInt(guiValues.offset) * Math.PI) / 180;
  let mult = parseFloat(guiValues.mult);

  while (r <= R) {
    //console.log(r);
    let w = 8 * dr;
    let w2 = w * w;

    theta = 0;
    while (theta < 360) {
      let x = r * Math.cos((theta * Math.PI) / 180);
      let y = r * Math.sin((theta * Math.PI) / 180);

      let theta_r = (theta * Math.PI) / 180;
      let mz = pol * Math.cos(2 * Theta(r, R));
      let mx = 0;
      let my = 0;
      if (charge == -1) {
        mx = Math.sin(mult * Theta(r, R)) * Math.cos(Phi(theta_r, offset));
        my = Math.sin(mult * Theta(r, R)) * Math.sin(Phi(theta_r, offset));
      } else {
        my =
          Math.sin(mult * Theta(Math.min(r, R), R)) *
          Math.cos(Phi(theta_r, offset));
        mx =
          -Math.sin(mult * Theta(Math.min(r, R), R)) *
          Math.sin(Phi(theta_r, offset));
      }

      let v = new THREE.Vector3(mx, my, mz);

      if (guiValues.color_scheme === "initial") {
        color = colorInitial(mx, my, mz);
      } else if (guiValues.color_scheme === "gradient") {
        color = colorGradient(mx, my, mz);
      }
      //console.log(color);
      let arr = createArrow(v, new THREE.Vector3(x * 5, y * 5, 0), color, 0.05);
      arrows.push(arr);

      theta += dtheta;
    }
    r += dr;
    dr = Math.max(dr_mult * dr, 0.05);
  }
}

function squareCoordLatticeSkyrmionium() {
  let pol = guiValues.polarization;
  let charge = guiValues.charge;

  let dx = parseFloat(guiValues.dx);
  let dy = parseFloat(guiValues.dy);

  let x = parseFloat(guiValues.start_x);
  let end_x = parseFloat(guiValues.end_x);
  let end_y = parseFloat(guiValues.end_y);
  let R = parseFloat(guiValues.textureR);

  let offset = (parseInt(guiValues.offset) * Math.PI) / 180;
  let mult = parseFloat(guiValues.mult);

  while (x <= end_x) {
    let y = parseFloat(guiValues.start_y);

    while (y <= end_y) {
      // pol =1 , charge = 1
      //let mz = 2 * pol * (Math.exp(-r2 / w2) - 0.5);
      //let mx = (x * charge / (r + eps)) * (1 - Math.abs(mz));
      //let my = (y  * charge / (r + eps)) * (1 - Math.abs(mz));
      let r2 = x * x + y * y;
      let r = Math.sqrt(r2);

      let theta_r = Math.atan2(y, x);
      let mx = 0;
      let my = 0;
      let mz = 0;

      mz = pol * Math.cos(2 * Theta(Math.min(r, R), R));
      if (charge == -1) {
        mx =
          Math.sin(mult * Theta(Math.min(r, R), R)) *
          Math.cos(Phi(theta_r, offset));
        my =
          Math.sin(mult * Theta(Math.min(r, R), R)) *
          Math.sin(Phi(theta_r, offset));
      } else {
        my =
          Math.sin(mult * Theta(Math.min(r, R), R)) *
          Math.cos(Phi(theta_r, offset));
        mx =
          -Math.sin(mult * Theta(Math.min(r, R), R)) *
          Math.sin(Phi(theta_r, offset));
      }

      let v = new THREE.Vector3(mx, my, mz);

      if (guiValues.color_scheme === "initial") {
        color = colorInitial(mx, my, mz);
      } else if (guiValues.color_scheme === "gradient") {
        color = colorGradient(mx, my, mz);
      }

      let arr = createArrow(v, new THREE.Vector3(x * 5, y * 5, 0), color, 0.05);
      arrows.push(arr);

      y += dy;
    }
    x += dx;
  }
}
/*------------------------------------------------------------------------------------*/
//  Skyrmion

function polarCoordLatticeSkyrmion() {
  let pol = guiValues.polarization;
  let charge = guiValues.charge;
  let r = 0;
  let R = parseFloat(guiValues.R_mult);
  let theta = 0;
  let dr = parseFloat(guiValues.dr);
  let dr_mult = parseFloat(guiValues.dr_mult);
  let dtheta = parseInt(guiValues.dtheta);
  let eps = 1e-9;
  let offset = (parseInt(guiValues.offset) * Math.PI) / 180;
  let mult = parseFloat(guiValues.mult);

  while (r <= R) {
    //console.log(r);
    let w = 8 * dr;
    let w2 = w * w;

    theta = 0;
    while (theta < 360) {
      let x = r * Math.cos((theta * Math.PI) / 180);
      let y = r * Math.sin((theta * Math.PI) / 180);
      let r2 = r * r;

      // pol =1 , charge = 1
      let mz = 2 * pol * (Math.exp(-r2 / w2) - 0.5);
      let mx = (x * charge / (r + eps)) * (1 - Math.abs(mz));
      let my = (y  * charge / (r + eps)) * (1 - Math.abs(mz));

      let v = new THREE.Vector3(mx, my, mz);

      if (guiValues.color_scheme === "initial") {
        color = colorInitial(mx, my, mz);
      } else if (guiValues.color_scheme === "gradient") {
        color = colorGradient(mx, my, mz);
      }
      //console.log(color);
      let arr = createArrow(v, new THREE.Vector3(x * 5, y * 5, 0), color, 0.05);
      arrows.push(arr);

      theta += dtheta;
    }
    r += dr;
    dr = Math.max(dr_mult * dr, 0.05);
  }
}

function squareCoordLatticeSkyrmion() {
  let pol = guiValues.polarization;
  let charge = guiValues.charge;

  let dx = parseFloat(guiValues.dx);
  let dy = parseFloat(guiValues.dy);

  let x = parseFloat(guiValues.start_x);
  let end_x = parseFloat(guiValues.end_x);
  let end_y = parseFloat(guiValues.end_y);
  let R = parseFloat(guiValues.textureR);

  let offset = (parseInt(guiValues.offset) * Math.PI) / 180;
  let mult = parseFloat(guiValues.mult);
  let eps = 1e-9;

  while (x <= end_x) {
    let y = parseFloat(guiValues.start_y);
    let w = parseFloat(guiValues.textureR);
    let w2 = w * w;

    while (y <= end_y) {
      // pol =1 , charge = 1
      //let mz = 2 * pol * (Math.exp(-r2 / w2) - 0.5);
      //let mx = (x * charge / (r + eps)) * (1 - Math.abs(mz));
      //let my = (y  * charge / (r + eps)) * (1 - Math.abs(mz));
      let r2 = x * x + y * y;
      let r = Math.sqrt(r2);

      let theta_r = Math.atan2(y, x);
      let mz = 2 * pol * (Math.exp(-r2 / w2) - 0.5);
      let mx = (x * charge / (r + eps)) * (1 - Math.abs(mz));
      let my = (y  * charge / (r + eps)) * (1 - Math.abs(mz));
  
      let v = new THREE.Vector3(mx, my, mz);

      if (guiValues.color_scheme === "initial") {
        color = colorInitial(mx, my, mz);
      } else if (guiValues.color_scheme === "gradient") {
        color = colorGradient(mx, my, mz);
      }

      let arr = createArrow(v, new THREE.Vector3(x * 5, y * 5, 0), color, 0.05);
      arrows.push(arr);

      y += dy;
    }
    x += dx;
  }
}


/*------------------------------------------------------------------------------------*/
// COLORS 
function colorInitial(mx, my, mz) {
  let m_mag = Math.sqrt(mx * mx + my * my + mz * mz);
  mx = mx / m_mag;
  my = my / m_mag;
  mz = mz / m_mag;

  if (mz > 0) color = Math.round(Math.abs(mz) * 255) << 16;
  else color = Math.round(Math.abs(mz) * 255);
  color = color + (Math.round(Math.sqrt(mx * mx + my * my) * 255) << 8);
  return color;
}

function colorGradient(mx, my, mz) {
  let m_mag = Math.sqrt(mx * mx + my * my + mz * mz);
  mx = mx / m_mag;
  my = my / m_mag;
  mz = mz / m_mag;

  let mag = 1 - Math.abs(mz);
  let desired;
  if (mz > 0) desired = [255, 0, 0];
  else desired = [0, 0, 255];

  let final_r = Math.round(lerp(desired[0], guiValues.gradient_interp[0], mag));
  let final_g = Math.round(lerp(desired[1], guiValues.gradient_interp[1], mag));
  let final_b = Math.round(lerp(desired[2], guiValues.gradient_interp[2], mag));

  color = (final_r << 16) + (final_g << 8) + final_b;
  return color;
}
/*------------------------------------------------------------------------------------*/

window.addEventListener("resize", resize);

resize();

let rad = 0;

function animate() {
  rad += 0.05;
  stats.update();
  //group.lookAt(Math.sin(rad) * 100, Math.cos(rad) * 100, 100);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

function createTexture() {
  clearScene();
  let texture = guiValues.texture;
  if (texture == "skyrmionium") {
    if (guiValues.coordinate_system === "polar") polarCoordLatticeSkyrmionium();
    else if (guiValues.coordinate_system === "square")
      squareCoordLatticeSkyrmionium();
  } else if (texture == "skyrmion") 
  {
    if (guiValues.coordinate_system === "polar") 
      polarCoordLatticeSkyrmion();
    else if (guiValues.coordinate_system === "square")
      squareCoordLatticeSkyrmion();
  }
}

createTexture();
let stats = initStats();
requestAnimationFrame(animate);
