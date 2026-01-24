// ============================
// main.js — Fond 3D interactif (SAFE MULTI-PAGES)
// ============================

/* =====================
   CANVAS / THREE.JS
===================== */
const canvas = document.getElementById('bgCanvas');
if (canvas && window.THREE) {

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.004);

  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
  );
  camera.position.set(0, 0, 50);

  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  const directional = new THREE.DirectionalLight(0xffffff, 0.6);
  directional.position.set(5, 10, 7.5);
  scene.add(ambient, directional);

  /* =====================
     PARTICULES
  ===================== */
  const particleCount = 500;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);

  for (let i = 0; i < positions.length; i++) {
    positions[i] = (Math.random() - 0.5) * 200;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0x00aaff,
    size: 0.5,
    transparent: true,
    opacity: 0.7
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  /* =====================
     LIGNES ENTRE POINTS
  ===================== */
  const maxDistance = 15;
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x00aaff,
    transparent: true,
    opacity: 0.1
  });

  const positionsArray = geometry.attributes.position.array;
  for (let i = 0; i < particleCount; i++) {
    for (let j = i + 1; j < particleCount; j++) {
      const dx = positionsArray[i*3] - positionsArray[j*3];
      const dy = positionsArray[i*3+1] - positionsArray[j*3+1];
      const dz = positionsArray[i*3+2] - positionsArray[j*3+2];
      const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

      if (dist < maxDistance) {
        const lineGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(
            positionsArray[i*3],
            positionsArray[i*3+1],
            positionsArray[i*3+2]
          ),
          new THREE.Vector3(
            positionsArray[j*3],
            positionsArray[j*3+1],
            positionsArray[j*3+2]
          )
        ]);
        scene.add(new THREE.Line(lineGeo, lineMaterial));
      }
    }
  }

  /* =====================
     ANIMATION
  ===================== */
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  function animate() {
    requestAnimationFrame(animate);
    scene.rotation.y += 0.001 + mouseX * 0.002;
    scene.rotation.x += 0.001 + mouseY * 0.002;
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }, { passive: true });
}

/* =====================
   APPARITION AU SCROLL
===================== */
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.2 });

document.querySelectorAll('section').forEach(section => {
  section.classList.add('hidden');
  observer.observe(section);
});

/* =====================
   HERO (UNIQUEMENT SI EXISTE)
===================== */
document.addEventListener("DOMContentLoaded", () => {
  const hero = document.querySelector(".hero-content");
  if (hero) {
    hero.style.opacity = 0;
    hero.style.transition = "opacity 1.5s ease";
    setTimeout(() => (hero.style.opacity = 1), 300);
  }
});
