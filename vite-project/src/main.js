// const loadingManager = new THREE.LoadingManager();

// loadingManager.onProgress = function (url, loaded, total) {
//   const progress = (loaded / total) * 100;
//   const fill = document.getElementById('progress-fill');
//   if (fill) fill.style.width = `${progress}%`;
// };

// loadingManager.onLoad = function () {
//   const loadingScreen = document.getElementById('loading-screen');
//   if (loadingScreen) {
//     loadingScreen.style.opacity = 0;
//     setTimeout(() => (loadingScreen.style.display = 'none'), 500);
//   }
// };

// const textureLoader = new THREE.TextureLoader(loadingManager); // ← important



import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';



// Scene, camera, rendu
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(20, 20, 20)
scene.background = new THREE.Color(0x1C1C1C);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.style.margin = 0;
document.body.appendChild(renderer.domElement);

// Mouse tracking
let mouseX = 0;
let mouseY = 0;
document.addEventListener('mousemove', (event) => {
  mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  mouseY = -(event.clientY / window.innerHeight) * 3 + 2;
});

// Soleil shader


const textureLoader = new THREE.TextureLoader();
const sunTexture = textureLoader.load('texture/SunTexture.jpg');

const sunMaterial = new THREE.MeshBasicMaterial({
  map: sunTexture,
  emissive: 0xffaa00,
  emissiveIntensity: 1.5,
  metalness: 0.2,
  roughness: 3,
});

const sunGeometry = new THREE.SphereGeometry(1, 32, 32);
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);


// Lumières
const light = new THREE.PointLight(0xffffff, 20);
light.position.set(2, 3, 5);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

//Planètes
function createPlanet(radius, texturePath, orbitRadius, speed) {
  const geometry = new THREE.SphereGeometry(radius, 32, 32);
  const texture = new THREE.TextureLoader().load(texturePath);
  const material = new THREE.MeshStandardMaterial({
    map: texture
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.userData = {
    angle: 0,
    speed: speed,
    orbitRadius: orbitRadius
  };

  if (orbitRadius === 10)
    {
      const ringGeometry = new THREE.RingGeometry(radius * 1.2, radius * 1.8, 64);
      const ringTexture = new THREE.TextureLoader().load('texture/saturnering.png');
      ringTexture.wrapS = THREE.RepeatWrapping;
      ringTexture.wrapT = THREE.RepeatWrapping;

      const ringMaterial = new THREE.MeshBasicMaterial({
        map: ringTexture,
        side: THREE.DoubleSide,
        opacity: 1
      });
  
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = Math.PI / 2;
      mesh.add(ring);
    }
  scene.add(mesh);
  return mesh;
}

const planets = [
  createPlanet(0.3, 'texture/mercure.jpg', 2, 0.012),
  createPlanet(0.4, 'texture/venus.jpg', 3.5, 0.010),
  createPlanet(0.5, 'texture/terre.jpg', 5, 0.008),
  createPlanet(0.45, 'texture/mars.jpg', 6.5, 0.007),
  createPlanet(0.9, 'texture/jupiter.jpg', 8, 0.005),
  createPlanet(0.85, 'texture/saturne.jpg', 10, 0.004),
  createPlanet(0.7, 'texture/uranus.jpg', 12, 0.003),
  createPlanet(0.6, 'texture/neptune.jpg', 14, 0.002)
];

// Orbites
function createOrbit(radius) {
  const points = [];
  const segments = 64;

  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(theta) * radius, 0, Math.sin(theta) * radius));
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 1 });
  const orbit = new THREE.LineLoop(geometry, material);
  scene.add(orbit);
}

const orbitRadii = [2, 3.5, 5, 6.5, 8, 10, 12, 14];
orbitRadii.forEach(r => createOrbit(r));

//Animation
function animate()
{
  requestAnimationFrame(animate);


  planets.forEach(p =>
  {
    p.userData.angle += p.userData.speed;
    p.position.x = Math.cos(p.userData.angle) * p.userData.orbitRadius;
    p.position.z = Math.sin(p.userData.angle) * p.userData.orbitRadius;
  });

  camera.position.x += (mouseX * 10 - camera.position.x) * 0.05;
  camera.position.y += (mouseY * 5 - camera.position.y) * 0.05;
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
}

function createStar(x, y, z, scale = 1) {
  const texture = new THREE.TextureLoader().load('/Etoile/1.png');

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false 
  });

  const sprite = new THREE.Sprite(material);
  sprite.scale.set(scale, scale, 1);
  sprite.position.set(x, y, z);
  scene.add(sprite);
}

for (let i = 0; i < 200; i++) {
  const x = (Math.random() - 0.5) * 200;
  const y = (Math.random() - 0.5) * 200;
  const z = (Math.random() - 0.5) * 200;
  const scale = Math.random() * 1.5 + 0.5; // taille entre 0.5 et 2
  createStar(x, y, z, scale);
}


//Nouveau décor (nouvelle scène)

const scene2Group = new THREE.Group();
scene2Group.position.y = -50; // Distance verticale entre scène 1 et 2

// Exemple simple de sol noir
const blackFloorGeo = new THREE.PlaneGeometry(100, 100);
const blackFloorMat = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });
const blackFloor = new THREE.Mesh(blackFloorGeo, blackFloorMat);
blackFloor.rotation.x = Math.PI / 2;
scene2Group.add(blackFloor);

// Ajoute le groupe à ta scène principale
scene.add(scene2Group);

window.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "v") {
    gsap.to(camera.position, {
      y: -50, // Même valeur que scene2Group.position.y
      duration: 2,
      ease: "power2.inOut"
    });
  }
});

animate();
