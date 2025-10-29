// ============================
// main.js — Fond 3D interactif
// ============================

// Création du canvas global
const canvas = document.getElementById('bgCanvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0); // fond transparent

// Scène et caméra
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.004);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(0, 0, 50);

// Lumière
const ambient = new THREE.AmbientLight(0xffffff, 0.6);
const directional = new THREE.DirectionalLight(0xffffff, 0.6);
directional.position.set(5, 10, 7.5);
scene.add(ambient, directional);

// =====================
// Particules / étoiles
// =====================
const particleCount = 500;
const particles = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount * 3; i++) {
  positions[i] = (Math.random() - 0.5) * 200;
}
particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const particleMaterial = new THREE.PointsMaterial({
  color: 0x00aaff,
  size: 0.5,
  transparent: true,
  opacity: 0.7
});

const particleSystem = new THREE.Points(particles, particleMaterial);
scene.add(particleSystem);

// =====================
// Réseau de lignes entre points
// =====================
const maxDistance = 15;
const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00aaff, transparent: true, opacity: 0.1 });
const lines = [];

function createLines() {
  const positions = particleSystem.geometry.attributes.position.array;
  for (let i = 0; i < particleCount; i++) {
    for (let j = i + 1; j < particleCount; j++) {
      const dx = positions[i * 3] - positions[j * 3];
      const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
      const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
      const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
      if (dist < maxDistance) {
        const geometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(positions[i*3], positions[i*3+1], positions[i*3+2]),
          new THREE.Vector3(positions[j*3], positions[j*3+1], positions[j*3+2])
        ]);
        const line = new THREE.Line(geometry, lineMaterial);
        scene.add(line);
        lines.push(line);
      }
    }
  }
}
createLines();

// =====================
// Animation
// =====================
let mouseX = 0, mouseY = 0;
document.addEventListener('mousemove', e => {
  mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
  mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
});

function animate() {
  requestAnimationFrame(animate);

  // rotation légère selon souris
  scene.rotation.y += 0.001 + mouseX * 0.002;
  scene.rotation.x += 0.001 + mouseY * 0.002;

  renderer.render(scene, camera);
}
animate();

// =====================
// Resize
// =====================
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}, { passive: true });

// =====================
// Apparition texte au scroll
// =====================
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.2 });

document.querySelectorAll('section').forEach(section => {
  section.classList.add('hidden');
  observer.observe(section);
});

// Apparition du hero au chargement
document.addEventListener("DOMContentLoaded", () => {
  const hero = document.querySelector(".hero-content");
  hero.style.opacity = 0;
  hero.style.transition = "opacity 1.5s ease";
  setTimeout(() => (hero.style.opacity = 1), 300);
});
