import * as THREE from 'three'

export function initScene(container) {
  const scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100)
  camera.position.z = 12

  const renderer = new THREE.WebGLRenderer({
    canvas: container,
    alpha: true,
    antialias: true,
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.2

  function getCSS(varName) {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
  }

  function readTheme() {
    const isLight = window.matchMedia('(prefers-color-scheme: light)').matches
    return {
      darkMode: !isLight,
      primary: oklchToThree(parseFloat(getCSS('--three-color-1')) || 0.72, 0.18, 72),
      secondary: oklchToThree(parseFloat(getCSS('--three-color-2')) || 0.5, 0.06, 250),
    }
  }

  let theme = readTheme()

  // Torus Knot — main golden shape
  const torusGeo = new THREE.TorusKnotGeometry(2.0, 0.65, 160, 24)
  const torusMat = new THREE.MeshPhysicalMaterial({
    color: theme.primary,
    emissive: theme.primary,
    emissiveIntensity: theme.darkMode ? 0.6 : 0.15,
    metalness: 0.7,
    roughness: 0.25,
    transparent: true,
    opacity: theme.darkMode ? 0.55 : 0.2,
    wireframe: false,
    clearcoat: 0.8,
    clearcoatRoughness: 0.2,
  })
  const torus = new THREE.Mesh(torusGeo, torusMat)
  torus.position.set(-2.5, 0.5, -6)
  scene.add(torus)

  // Torus Knot Wireframe overlay for extra golden glow
  const torusWireGeo = new THREE.TorusKnotGeometry(2.05, 0.7, 80, 12)
  const torusWireMat = new THREE.MeshPhysicalMaterial({
    color: theme.primary,
    emissive: theme.primary,
    emissiveIntensity: theme.darkMode ? 0.4 : 0.1,
    metalness: 0.3,
    roughness: 0.4,
    transparent: true,
    opacity: theme.darkMode ? 0.35 : 0.1,
    wireframe: true,
  })
  const torusWire = new THREE.Mesh(torusWireGeo, torusWireMat)
  torusWire.position.copy(torus.position)
  scene.add(torusWire)

  // Icosahedron — smaller golden accent
  const icosaGeo = new THREE.IcosahedronGeometry(0.7, 0)
  const icosaMat = new THREE.MeshPhysicalMaterial({
    color: theme.primary,
    emissive: theme.primary,
    emissiveIntensity: theme.darkMode ? 0.5 : 0.1,
    metalness: 0.8,
    roughness: 0.15,
    transparent: true,
    opacity: theme.darkMode ? 0.5 : 0.15,
    wireframe: false,
    clearcoat: 1.0,
  })
  const icosa = new THREE.Mesh(icosaGeo, icosaMat)
  icosa.position.set(4, -0.5, -5)
  scene.add(icosa)

  const icosaWireGeo = new THREE.IcosahedronGeometry(0.75, 0)
  const icosaWireMat = new THREE.MeshPhysicalMaterial({
    color: theme.primary,
    emissive: theme.primary,
    emissiveIntensity: theme.darkMode ? 0.3 : 0.05,
    transparent: true,
    opacity: theme.darkMode ? 0.3 : 0.08,
    wireframe: true,
  })
  const icosaWire = new THREE.Mesh(icosaWireGeo, icosaWireMat)
  icosaWire.position.copy(icosa.position)
  scene.add(icosaWire)

  // Octahedron — subtle blue complement
  const octaGeo = new THREE.OctahedronGeometry(1.0)
  const octaMat = new THREE.MeshPhysicalMaterial({
    color: theme.secondary,
    emissive: theme.secondary,
    emissiveIntensity: theme.darkMode ? 0.3 : 0.05,
    metalness: 0.5,
    roughness: 0.3,
    transparent: true,
    opacity: theme.darkMode ? 0.25 : 0.08,
    wireframe: false,
  })
  const octa = new THREE.Mesh(octaGeo, octaMat)
  octa.position.set(1.5, -2.5, -9)
  scene.add(octa)

  const octaWireGeo = new THREE.OctahedronGeometry(1.05)
  const octaWireMat = new THREE.MeshPhysicalMaterial({
    color: theme.secondary,
    transparent: true,
    opacity: theme.darkMode ? 0.2 : 0.05,
    wireframe: true,
  })
  const octaWire = new THREE.Mesh(octaWireGeo, octaWireMat)
  octaWire.position.copy(octa.position)
  scene.add(octaWire)

  // Golden particles
  const particleCount = 300
  const particlesGeo = new THREE.BufferGeometry()
  const pos = new Float32Array(particleCount * 3)
  const sizes = new Float32Array(particleCount)
  for (let i = 0; i < particleCount; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 40
    pos[i * 3 + 1] = (Math.random() - 0.5) * 30
    pos[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5
    sizes[i] = Math.random() * 0.04 + 0.01
  }
  particlesGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  particlesGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

  const particlesMat = new THREE.PointsMaterial({
    color: theme.primary,
    size: 0.03,
    transparent: true,
    opacity: theme.darkMode ? 0.6 : 0.2,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
  })
  const particles = new THREE.Points(particlesGeo, particlesMat)
  scene.add(particles)

  function updateTheme() {
    theme = readTheme()
    const c1 = theme.primary
    const c2 = theme.secondary
    const dark = theme.darkMode

    torusMat.color.copy(c1)
    torusMat.emissive.copy(c1)
    torusMat.emissiveIntensity = dark ? 0.6 : 0.15
    torusMat.opacity = dark ? 0.55 : 0.2

    torusWireMat.color.copy(c1)
    torusWireMat.emissive.copy(c1)
    torusWireMat.emissiveIntensity = dark ? 0.4 : 0.1
    torusWireMat.opacity = dark ? 0.35 : 0.1

    icosaMat.color.copy(c1)
    icosaMat.emissive.copy(c1)
    icosaMat.emissiveIntensity = dark ? 0.5 : 0.1
    icosaMat.opacity = dark ? 0.5 : 0.15

    icosaWireMat.color.copy(c1)
    icosaWireMat.emissive.copy(c1)
    icosaWireMat.emissiveIntensity = dark ? 0.3 : 0.05
    icosaWireMat.opacity = dark ? 0.3 : 0.08

    octaMat.color.copy(c2)
    octaMat.emissive.copy(c2)
    octaMat.emissiveIntensity = dark ? 0.3 : 0.05
    octaMat.opacity = dark ? 0.25 : 0.08

    octaWireMat.color.copy(c2)
    octaWireMat.opacity = dark ? 0.2 : 0.05

    particlesMat.color.copy(c1)
    particlesMat.opacity = dark ? 0.6 : 0.2
  }

  const themeMedia = window.matchMedia('(prefers-color-scheme: light)')
  themeMedia.addEventListener('change', updateTheme)

  let mouseX = 0
  let mouseY = 0
  let targetX = 0
  let targetY = 0

  document.addEventListener('mousemove', (e) => {
    targetX = (e.clientX / window.innerWidth) * 2 - 1
    targetY = -(e.clientY / window.innerHeight) * 2 + 1
  })

  document.addEventListener('touchmove', (e) => {
    const touch = e.touches[0]
    if (touch) {
      targetX = (touch.clientX / window.innerWidth) * 2 - 1
      targetY = -(touch.clientY / window.innerHeight) * 2 + 1
    }
  }, { passive: true })

  function animate() {
    requestAnimationFrame(animate)

    // Stop rendering when tab is hidden — saves GPU
    if (document.hidden) return

    mouseX += (targetX - mouseX) * 0.05
    mouseY += (targetY - mouseY) * 0.05

    // Main torus
    torus.rotation.x += 0.003
    torus.rotation.y += 0.007
    torus.position.x = -2.5 + mouseX * 0.6
    torus.position.y = 0.5 + mouseY * 0.6
    torusWire.rotation.copy(torus.rotation)
    torusWire.position.copy(torus.position)

    // Icosahedron
    icosa.rotation.x += 0.004
    icosa.rotation.z += 0.005
    icosa.position.x = 4 + mouseX * 0.4
    icosa.position.y = -0.5 + mouseY * 0.4
    icosaWire.rotation.copy(icosa.rotation)
    icosaWire.position.copy(icosa.position)

    // Octahedron
    octa.rotation.y += 0.003
    octa.rotation.x += 0.002
    octa.position.x = 1.5 + mouseX * 0.3
    octa.position.y = -2.5 + mouseY * 0.3
    octaWire.rotation.copy(octa.rotation)
    octaWire.position.copy(octa.position)

    // Particles drift
    particles.rotation.y += 0.0003

    renderer.render(scene, camera)
  }

  animate()

  let resizeTimeout
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(() => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }, 100)
  })

  return { scene, camera, renderer }
}

function oklchToThree(l, c, h) {
  const hr = (h * Math.PI) / 180
  const a = c * Math.cos(hr)
  const b = c * Math.sin(hr)

  const l_ = l + 0.3963377774 * a + 0.2158037573 * b
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b
  const s_ = l - 0.0894841775 * a - 1.291485548 * b

  const l3 = l_ * l_ * l_
  const m3 = m_ * m_ * m_
  const s3 = s_ * s_ * s_

  const r = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3
  const g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3
  const bl = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3

  return new THREE.Color(
    Math.min(1, Math.max(0, r)),
    Math.min(1, Math.max(0, g)),
    Math.min(1, Math.max(0, bl))
  )
}
