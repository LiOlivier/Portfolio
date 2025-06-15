import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';



// Scene, camera, rendu

let cameraTarget = new THREE.Vector3(0, 0, 0);
let cameraTransitioning = false;
let followMouse = true;


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
const sunTexture = textureLoader.load('./texture/SunTexture.jpg');

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
      const ringTexture = new THREE.TextureLoader().load('./texture/saturnering.png');
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
  createPlanet(0.3, './texture/mercure.jpg', 2, 0.012),
  createPlanet(0.4, './texture/venus.jpg', 3.5, 0.010),
  createPlanet(0.5, './texture/terre.jpg', 5, 0.008),
  createPlanet(0.45, './texture/mars.jpg', 6.5, 0.007),
  createPlanet(0.9, './texture/jupiter.jpg', 8, 0.005),
  createPlanet(0.85, './texture/saturne.jpg', 10, 0.004),
  createPlanet(0.7, './texture/uranus.jpg', 12, 0.003),
  createPlanet(0.6, './texture/neptune.jpg', 14, 0.002)
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
function animate() {
  requestAnimationFrame(animate);

  // animation des planètes
  planets.forEach(p => {
    p.userData.angle += p.userData.speed;
    p.position.x = Math.cos(p.userData.angle) * p.userData.orbitRadius;
    p.position.z = Math.sin(p.userData.angle) * p.userData.orbitRadius;
  });

  // mouvement souris immersif 
  if (followMouse) {
    const targetX = mouseX * 10;
    const targetY = mouseY * 5;

    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (targetY - camera.position.y) * 0.05;
  }

  // toujours regarder la cible (le soleil ou la scène 2)
  camera.lookAt(cameraTarget);

  renderer.render(scene, camera);
}

function createStar(x, y, z, scale = 1) {
  const texture = new THREE.TextureLoader().load('./Etoile/1.png');

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
  const scale = Math.random() * 1.5 + 0.5;
  createStar(x, y, z, scale);
}


//Deuxième scène ("section")
const scene2Group = new THREE.Group();
scene2Group.position.y = -50;

const blackFloorGeo = new THREE.PlaneGeometry(100, 100);
const blackFloorMat = new THREE.MeshBasicMaterial({ color: 0x1C1C1C, side: THREE.DoubleSide });
const blackFloor = new THREE.Mesh(blackFloorGeo, blackFloorMat);
blackFloor.rotation.x = Math.PI / 2;
scene2Group.add(blackFloor);

scene.add(scene2Group);

// ========================= //
//   Navigation par section  //
// ========================= //
const sections = [
  {
    id: "overlay",
    y: 10,
    show: () => {
      const overlay = document.getElementById("overlay");
      overlay.style.display = "flex";
      overlay.style.opacity = 0;
      overlay.style.transform = "translate(-50%, -70%)";

      gsap.to(overlay, {
        opacity: 1,
        y: 0,
        duration: 1.5,
        ease: "power2.inOut",
        onUpdate: () => {
          overlay.style.transform = "translate(-50%, -50%)";
        }
      });

    document.getElementById("scroll-up").style.display = "none";
    },

    hide: () => {
      const overlay = document.getElementById("overlay");
      gsap.to(overlay, {
        yPercent: -200,
        opacity: 0,
        duration: 1.5,
        ease: "power2.inOut",
        onComplete: () => {
          overlay.style.display = "none";
          overlay.style.transform = "";
        }
      });
    }
  }
  ,
  {
    id: "presentation-section",
    y: -50,
    show: showPresentation,
    hide: hidePresentation
  },
  {
    id: "section-formation",
    y: -100,
    show: showFormation,
    hide: hideFormation
  }
];
let currentSection = 0;
let scroll = false;
function goToSection(index) {
  if (index < 0 || index >= sections.length) return;
  currentSection = index;
  const section = sections[index]; 
  if (index !== 0) {
    document.getElementById("scroll-up").style.display = "block";
  }

  followMouse = (index === 0);
  
  if (index === 0) {
    gsap.to(camera.position, {
      x: 20,
      y: 20,
      z: 20,
      duration: 1.5,
      ease: "power2.inOut"
    });

    gsap.to(cameraTarget, {
      x: 0,
      y: 0,
      z: 0,
      duration: 1.5,
      ease: "power2.inOut"
    });
  } else {
    gsap.to(camera.position, {
      y: section.y,
      duration: 1.5,
      ease: "power2.inOut"
    });

    gsap.to(cameraTarget, {
      y: section.y,
      duration: 1.5,
      ease: "power2.inOut"
    });
  }

  sections.forEach((s, i) => {
    if (i !== index && s.hide) s.hide();
  });

  if (section.show) section.show();
}

//scroll down animation descendante 
document.getElementById("scroll").addEventListener("click", () => {
  if (scroll) return;
  scroll = true;
  goToSection(currentSection + 1);
  setTimeout(() => scroll = false, 1600);
});


// //scroll vers le haut animation montante
document.getElementById("scroll-up").addEventListener("click", () => {
  if (scroll) return;
  scroll = true;
  goToSection(currentSection - 1);
  setTimeout(() => scroll = false, 1600);
});


let scrollDirection = "down"; // haut/bas selon la molette

window.addEventListener("wheel", (event) => {
  scrollDirection = event.deltaY > 0 ? "down" : "up";
  if (scroll) return;
  scroll = true;

  goToSection(currentSection + (scrollDirection === "down" ? 1 : -1));

  setTimeout(() => {
    scroll = false;
  }, 1600);
});

// scroll avec la molette 
window.addEventListener("wheel", (event) => {
  if (scroll) return;
  scroll = true;

  const direction = event.deltaY > 0 ? 1 : -1;
  goToSection(currentSection + direction);

  setTimeout(() => {
    scroll = false;
  }, 1600);
});

const presentation = document.getElementById("presentation-section");
const formationSection = document.getElementById("section-formation");

// affichage presentation
function showPresentation() {
  presentation.classList.remove("exit-up", "exit-down");
  presentation.classList.add("enter");
}

function hidePresentation() {
  presentation.classList.remove("enter", "exit-up", "exit-down");

  if (scrollDirection === "down") {
    presentation.classList.add("exit-up");
  } else {
    presentation.classList.add("exit-down");
  }
}

// affichage formation 
function showFormation() {
  formationSection.classList.remove("exit-up", "exit-down");
  formationSection.classList.add("enter");
}

function hideFormation() {
  formationSection.classList.remove("enter", "exit-up", "exit-down");

  if (scrollDirection === "down") {
    formationSection.classList.add("exit-up");
  } else {
    formationSection.classList.add("exit-down");
  }
}


animate();
