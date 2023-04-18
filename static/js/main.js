function lerp(v1, v2, t) {
    return v1 + (v2 - v1) * t;
  }

function createArrow(vector, position, color, len) {
    const group = new THREE.Group();
    const arrowMat = new THREE.MeshLambertMaterial({ color: color });
  
    const arrowGeo = new THREE.ConeBufferGeometry(2 * len, 5 * len, 32);
    const arrowMesh = new THREE.Mesh(arrowGeo, arrowMat);
    arrowMesh.rotation.x = Math.PI / 2;
    arrowMesh.position.z = 2.5 * len;
    const cylinderGeo = new THREE.CylinderBufferGeometry(
      1 * len,
      1 * len,
      5 * len,
      32
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

/* simulation parameters */
var labels = function () {
    this.polarization = -1;
    this.charge = -1;
    this.dtheta = 10;
    this.dr = 0.2;
    this.dr_mult = 0.82;
    this.color_scheme = "initial";
    this.reset = function () {
      createSkyrmion();
    };
  
    this.gradient_interp  = [255, 255, 255];
    this.background_color = [255, 255, 255];
  
    this.deltaMultiplier = 0.001;
    this.animateMultiplier = false;
  };

let guiValues = new labels();
var gui = new dat.GUI();


gui.add(guiValues, "polarization", [-1, 1]).onChange(function(value)
{
    createSkyrmion();
});

gui.add(guiValues, "charge", [-1, 1]).onChange(function(value)
{
    createSkyrmion();
});

gui.add(guiValues, "color_scheme", ['initial', 'gradient']).onChange(function(value)
{
    createSkyrmion();
});

gui.add(guiValues, "dr", 0, 1, 0.001).onChange(function(value)
{
    createSkyrmion();
})

gui.add(guiValues, "dr_mult", 0, 1, 0.001).onChange(function(value)
{
    createSkyrmion();
})

let dtheta_possible = [];
for (let i = 1; i <= 180; i += 1)
{
    if (360 % i == 0)
        dtheta_possible.push(i);
}

gui.add(guiValues, "dtheta", dtheta_possible).onChange(function(value)
{
    createSkyrmion();
});

gui.addColor(guiValues, "gradient_interp").onChange(function (color) 
{
    console.log("ZASDADS");
    this.background_color = color;
    createSkyrmion();
});

gui.addColor(guiValues, "background_color").onChange(function (color) 
{
    renderer.setClearColor(new THREE.Color(color[0] / 255, color[1] / 255, color[2] / 255));
});

gui.add(guiValues, "reset");

let arrows = [];

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
});
document.body.appendChild(renderer.domElement);

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

function clearScene()
{
    for (let i = 0; i < arrows.length; ++i)
    {
        scene.remove(arrows[i]);
    }
}

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

function createSkyrmion()
{
    clearScene();
    

    let pol = guiValues.polarization;
    let charge = guiValues.charge;
    let r = 0;
    let R = 1;
    let theta = 0;
    let dr = parseFloat(guiValues.dr);
    let dr_mult = parseFloat(guiValues.dr_mult);
    let dtheta = parseInt(guiValues.dtheta);
    let eps = 1e-9;
    while (r <= R) {
      console.log(r);
      let w = 8 * dr;
      let w2 = w * w;
    
      theta = 0;
      while (theta < 360) {
        let x = r * Math.cos((theta * Math.PI) / 180) * r;
        let y = r * Math.sin((theta * Math.PI) / 180) * r;
        let r2 = x * x + y * y;
    
        // pol =1 , charge = 1
        let mz = 2 * pol * (Math.exp(-r2 / w2) - 0.5);
        let mx = (x * charge / (r + eps)) * (1 - Math.abs(mz));
        let my = (y  * charge / (r + eps)) * (1 - Math.abs(mz));
    
        let v = new THREE.Vector3(mx, my, mz);
    
        if (guiValues.color_scheme === "initial")
        {
            if (mz > 0) color = Math.round(Math.abs(mz) * 255) << 16;
            else color = Math.round(Math.abs(mz) * 255);
            color = color + (Math.round(Math.sqrt(mx * mx + my * my) * 255) << 8);
        }
        else if (guiValues.color_scheme === "gradient")
        {
            let mag = 1- Math.abs(mz);
            let desired;
            if (mz > 0) desired = [255, 0, 0];
            else desired = [0, 0, 255];

            let final_r = Math.round(lerp(desired[0], guiValues.gradient_interp[0], mag));
            let final_g = Math.round(lerp(desired[1], guiValues.gradient_interp[1], mag));
            let final_b = Math.round(lerp(desired[2], guiValues.gradient_interp[2], mag));
            
            color = (final_r << 16) + (final_g << 8) + final_b;
        }
    
        let arr = createArrow(v, new THREE.Vector3(x * 5, y * 5, 0), color, 0.05);
        arrows.push(arr);
    
        theta += dtheta;
      }
      r += dr;
      dr = dr_mult * dr;
    }

}

createSkyrmion();
let stats = initStats();
requestAnimationFrame(animate);