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
camera.position.set(100, 100, 20)
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
  mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
});

// Soleil shader
const sunUniforms = {
  uTime: { value: 0.0 }
};

const sunMaterial = new THREE.ShaderMaterial({
  uniforms: sunUniforms,
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    varying vec2 vUv;
    void main() {
      float pulse = 0.5 + 0.5 * sin(uTime + vUv.x * 10.0);
      vec3 color = mix(vec3(1.0, 0.6, 0.1), vec3(1.0, 1.0, 0.0), pulse);
      gl_FragColor = vec4(color, 1.0);
    }
  `,
  side: THREE.FrontSide
});

const sunGeometry = new THREE.SphereGeometry(1, 32, 32);
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Lumières
const light = new THREE.PointLight(0xffffff, 10);
light.position.set(2, 3, 5);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

//Planètes
function createPlanet(radius, color, orbitRadius, speed)
{
  const geometry = new THREE.SphereGeometry(radius, 32, 32);
  const material = new THREE.MeshStandardMaterial({ color: color });
  const mesh = new THREE.Mesh(geometry, material);

  mesh.userData =
  {
    angle: 0,
    speed: speed,
    orbitRadius: orbitRadius
  };

  scene.add(mesh);
  return mesh;
}

const planets = [
  createPlanet(0.15, 0xb0b0b0, 2, 0.012),   // Mercure
  createPlanet(0.2,  0xf4c542, 3.5, 0.010), // Vénus
  createPlanet(0.25, 0x3b82f6, 5, 0.008),   // Terre
  createPlanet(0.2,  0xff4e2a, 6.5, 0.007), // Mars
  createPlanet(0.5,  0xffc58a, 8, 0.005),   // Jupiter
  createPlanet(0.45, 0xfdf5a6, 10, 0.004),  // Saturne
  createPlanet(0.35, 0x4ee5d1, 12, 0.003),  // Uranus
  createPlanet(0.3,  0x4361ee, 14, 0.002)   // Neptune
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

  sunUniforms.uTime.value += 0.02;

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

for (let i = 0; i < 500; i++) {
  const x = (Math.random() - 0.5) * 200;
  const y = (Math.random() - 0.5) * 200;
  const z = (Math.random() - 0.5) * 200;
  const scale = Math.random() * 1.5 + 0.5; // taille entre 0.5 et 2
  createStar(x, y, z, scale);
}


animate();
