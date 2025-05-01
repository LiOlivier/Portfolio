import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 4, 20);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.style.margin = 0;
document.body.appendChild(renderer.domElement);

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

// Lumière centrale (Soleil)
const light = new THREE.PointLight(0xffffff, 10);
light.position.set(2, 3, 5);
scene.add(light);

function createPlanet(radius, color, orbitRadius, speed) {
  const geometry = new THREE.SphereGeometry(radius, 32, 32);
  const material = new THREE.MeshStandardMaterial({ color: color });
  const mesh = new THREE.Mesh(geometry, material);

  mesh.userData = {
    angle: 0,
    speed: speed,
    orbitRadius: orbitRadius
  };

  scene.add(mesh);
  return mesh;
}

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

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

let angle = 0;
function animate() {
  requestAnimationFrame(animate);

  sunUniforms.uTime.value += 0.02;

  planets.forEach(p => {
    p.userData.angle += p.userData.speed;
    p.position.x = Math.cos(p.userData.angle) * p.userData.orbitRadius;
    p.position.z = Math.sin(p.userData.angle) * p.userData.orbitRadius;
  });

  renderer.render(scene, camera);
}

//importation bibliothèque 
function createOrbit(radius){
const points = [];
const segments = 64;

for(let i = 0; i <= segments; i++)
  {
    const theta = (i/segments) *Math.PI *2;
    points.push(new THREE.Vector3(Math.cos(theta) * radius, 0, Math.sin(theta) * radius));
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 1 });
  const orbit = new THREE.LineLoop(geometry, material);

  scene.add(orbit);
  }
  const orbitRadii = [2, 3.5, 5, 6.5, 8, 10, 12, 14];
  orbitRadii.forEach(r => createOrbit(r));

animate();
