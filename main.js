import './style.css'

// Dynamic import — Three.js (+523kB) يتحمل بعد المحتوى الأساسي
const canvas = document.getElementById('three-canvas')
import('./three-background.js').then(({ initScene }) => {
  initScene(canvas)
})

/* ===== CURSOR GLOW ===== */
const glow = document.getElementById('cursorGlow')
let glowX = -999
let glowY = -999

document.addEventListener('mousemove', (e) => {
  glowX = e.clientX
  glowY = e.clientY
  glow.classList.add('visible')
})

document.addEventListener('mouseleave', () => {
  glow.classList.remove('visible')
})

function animateGlow() {
  const x = parseFloat(glow.style.left) || glowX
  const y = parseFloat(glow.style.top) || glowY
  glow.style.left = `${x + (glowX - x) * 0.08}px`
  glow.style.top = `${y + (glowY - y) * 0.08}px`
  requestAnimationFrame(animateGlow)
}
animateGlow()

/* ===== NAV ===== */
const navToggle = document.getElementById('navToggle')
const navLinks = document.getElementById('navLinks')

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open')
  navToggle.setAttribute('aria-expanded', isOpen)
  document.body.style.overflow = isOpen ? 'hidden' : ''
})

document.querySelectorAll('.nav-link').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open')
    navToggle.setAttribute('aria-expanded', 'false')
    document.body.style.overflow = ''
  })
})

let lastScroll = 0
const nav = document.getElementById('nav')
window.addEventListener('scroll', () => {
  const curr = window.scrollY
  if (curr > 120) {
    nav.style.transform = curr > lastScroll
      ? 'translateX(-50%) translateY(-100px)'
      : 'translateX(-50%) translateY(0)'
  } else {
    nav.style.transform = 'translateX(-50%) translateY(0)'
  }
  lastScroll = curr
}, { passive: true })

/* ===== IMAGE LOADING ===== */
const FOLDERS = {
  'اخر الاعمال': [
    'Untitled25_20260709234538.webp',
    'Untitled27_20260710000430.webp',
    'Untitled28_20260712111947.webp',
    'file_0000000004587230a6cbeb50dfa971c8.webp',
    'file_00000000fa2c71f48b3eb073d0500859.webp',
    'Untitled17.webp',
    'Untitled19.webp',
    'Untitled20_20260624151042.webp',
    'Untitled20_20260624184251.webp',
    'Untitled6_20251215194432.webp',
    'Untitled7_20251218144323.webp',
  ],
  ads: [
    '1742668576341.webp',
    '1742696667695.webp',
    '1742714363878.webp',
    '1742941583671.webp',
    '1743050224018.webp',
    '1743082250172.webp',
    'quality_restoration_20250522130136873.webp',
  ],
  'بانر يوتويب': [
    '1742591532916.webp',
    'Untitled39_20250520123228.webp',
    'Untitled40_20250520123515.webp',
  ],
  'بكج دسكورد': [
    'Untitled32_20250514213458.webp',
    'Untitled32_20250514213657.webp',
    'Untitled33_20250514215716.webp',
    'Untitled34_20250514222208.webp',
    'Untitled36_20250515135517.webp',
    'Untitled6_20251025155518.webp',
  ],
  extra: [
    '1738862026546.webp',
    '1740872762664.webp',
    '1741038167931.webp',
    '1741445236768.webp',
    'quality_restoration_20250709234300067.webp',
    'quality_restoration_20250716144642771.webp',
    'Untitled147_20250913133910.webp',
    'Untitled150_20251004151922.webp',
    'Untitled25_20250512205430.webp',
    'Untitled38_20250519144019.webp',
    'Untitled8_20251102203656.webp',
    'Untitled88_20250802022651.webp',
  ],
}

const SECTION_NAMES = {
  'اخر الاعمال': 'من أعمال HORIZON',
  'ads': 'إعلان من HORIZON',
  'بانر يوتويب': 'بانر يوتيوب من HORIZON',
  'بكج دسكورد': 'بكج ديسكورد من HORIZON',
  'extra': 'تصميم من HORIZON',
}

/* ===== LIKES SYSTEM (localStorage) ===== */
const LIKES_KEY = 'horizon_likes'
let likes = {}

function loadLikes() {
  try { likes = JSON.parse(localStorage.getItem(LIKES_KEY)) || {} } catch { likes = {} }
}

function saveLikes() {
  localStorage.setItem(LIKES_KEY, JSON.stringify(likes))
}

function isLiked(path) { return !!likes[path] }

function toggleLike(path) {
  if (likes[path]) { delete likes[path]; return false }
  else { likes[path] = true; return true }
}

function createHeartButton(path, liked = false) {
  const btn = document.createElement('button')
  btn.className = 'masonry-like'
  if (liked) btn.classList.add('liked')
  btn.setAttribute('aria-label', 'إعجاب')
  btn.setAttribute('aria-pressed', liked ? 'true' : 'false')
  btn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`
  btn.addEventListener('click', (e) => {
    e.stopPropagation()
    const nowLiked = toggleLike(path)
    saveLikes()
    btn.classList.toggle('liked', nowLiked)
    btn.setAttribute('aria-pressed', nowLiked ? 'true' : 'false')
    if (nowLiked) addToHot(path)
    else removeFromHot(path)
  })
  return btn
}

/* ===== HOT SECTION MANAGEMENT ===== */
let hotItemData = {}

function addToHot(path) {
  const data = hotItemData[path]
  if (!data) return
  const hotContainer = document.getElementById('hotMasonry')
  const empty = document.getElementById('hotEmpty')
  if (!hotContainer) return
  if (hotContainer.querySelector(`[data-path="${CSS.escape(path)}"]`)) return
  const item = createMasonryItem(data.folder, data.file, hotContainer.children.length, true)
  item.dataset.path = path
  hotContainer.appendChild(item)
  requestAnimationFrame(() => item.classList.add('reveal'))
  if (empty) empty.style.display = 'none'
}

function removeFromHot(path) {
  const hotContainer = document.getElementById('hotMasonry')
  const empty = document.getElementById('hotEmpty')
  if (!hotContainer) return
  const item = hotContainer.querySelector(`[data-path="${CSS.escape(path)}"]`)
  if (item) item.remove()
  if (empty && hotContainer.children.length === 0) empty.style.display = 'block'
}

function initHotSection() {
  const hotContainer = document.getElementById('hotMasonry')
  if (!hotContainer) return
  Object.keys(FOLDERS).forEach((folder) => {
    FOLDERS[folder].forEach((file) => {
      const path = `images/${folder}/${file}`
      if (isLiked(path)) {
        hotItemData[path] = { folder, file }
        const item = createMasonryItem(folder, file, hotContainer.children.length, true)
        item.dataset.path = path
        hotContainer.appendChild(item)
      }
    })
  })
  const empty = document.getElementById('hotEmpty')
  if (empty && hotContainer.children.length > 0) empty.style.display = 'none'
}

function createMasonryItem(folder, file, index, liked = false, imageList = null) {
  const item = document.createElement('div')
  item.className = 'masonry-item loading'
  if (!liked) item.style.animationDelay = `${index * 60}ms`

  const img = document.createElement('img')
  img.loading = 'lazy'
  const path = `images/${folder}/${file}`
  img.src = path
  img.alt = `${SECTION_NAMES[folder] || 'تصميم من HORIZON'}`
  item.dataset.path = path

  const navImages = imageList || [file]
  const navIndex = imageList ? imageList.indexOf(file) : 0

  img.addEventListener('load', () => item.classList.remove('loading'))
  img.addEventListener('error', () => {
    item.classList.remove('loading')
    item.style.background = 'oklch(0.06 0.003 270)'
    item.style.minHeight = '160px'
    item.style.display = 'flex'
    item.style.alignItems = 'center'
    item.style.justifyContent = 'center'
    item.textContent = 'فشل تحميل الصورة'
    item.style.color = 'oklch(0.4 0 0)'
    item.style.fontSize = '0.8rem'
  })

  img.addEventListener('click', (e) => {
    e.stopPropagation()
    openLightbox(folder, navImages, navIndex)
  })

  item.appendChild(img)

  item.tabIndex = 0
  item.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); openLightbox(folder, navImages, navIndex) }
  })

  const shine = document.createElement('div')
  shine.className = 'masonry-shine'
  item.appendChild(shine)

  const play = document.createElement('div')
  play.className = 'masonry-play'
  play.setAttribute('aria-hidden', 'true')
  play.innerHTML = `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`
  item.appendChild(play)

  const badge = document.createElement('div')
  badge.className = 'masonry-badge'
  badge.textContent = folder
  badge.setAttribute('aria-hidden', 'true')
  item.appendChild(badge)

  const label = document.createElement('div')
  label.className = 'masonry-label'
  label.textContent = SECTION_NAMES[folder] || 'تصميم من HORIZON'
  label.setAttribute('aria-hidden', 'true')
  item.appendChild(label)

  const heartBtn = createHeartButton(path, liked)
  item.appendChild(heartBtn)

  return item
}

function loadImages() {
  const containers = document.querySelectorAll('.masonry:not(#hotMasonry)')
  containers.forEach((container) => {
    const folder = container.dataset.folder
    const files = FOLDERS[folder]
    if (!files) return

    const shuffled = [...files]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }

    shuffled.forEach((file, index) => {
      const path = `images/${folder}/${file}`
      hotItemData[path] = { folder, file }

      const isLikedAlready = isLiked(path)
      const item = createMasonryItem(folder, file, index, isLikedAlready, shuffled)
      container.appendChild(item)
    })
  })
}

/* ===== REVEAL ON SCROLL ===== */
function observeMasonry() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal')
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  )

  document.querySelectorAll('.masonry-item').forEach((item) => {
    observer.observe(item)
  })
}

/* ===== LIGHTBOX ===== */
const lightbox = document.getElementById('lightbox')
const lightboxImg = document.getElementById('lightboxImg')
const lightboxClose = document.getElementById('lightboxClose')
const lightboxPrev = document.getElementById('lightboxPrev')
const lightboxNext = document.getElementById('lightboxNext')

let lightboxCurrentFolder = ''
let lightboxImages = []
let lightboxIndex = 0

function openLightbox(folder, images, index) {
  lightboxCurrentFolder = folder
  lightboxImages = images
  lightboxIndex = index

  lightboxImg.src = `images/${folder}/${images[index]}`
  lightboxImg.alt = `${SECTION_NAMES[folder] || 'تصميم من HORIZON'}`
  lightbox.classList.add('open')
  document.body.style.overflow = 'hidden'
  updateLightboxNav()
}

function updateLightboxNav() {
  lightboxPrev.style.display = lightboxImages.length > 1 ? 'flex' : 'none'
  lightboxNext.style.display = lightboxImages.length > 1 ? 'flex' : 'none'
}

function closeLightbox() {
  lightbox.classList.remove('open')
  document.body.style.overflow = ''
}

function prevImage() {
  lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length
  lightboxImg.src = `images/${lightboxCurrentFolder}/${lightboxImages[lightboxIndex]}`
}

function nextImage() {
  lightboxIndex = (lightboxIndex + 1) % lightboxImages.length
  lightboxImg.src = `images/${lightboxCurrentFolder}/${lightboxImages[lightboxIndex]}`
}

lightboxClose.addEventListener('click', closeLightbox)
lightboxPrev.addEventListener('click', prevImage)
lightboxNext.addEventListener('click', nextImage)

document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return
  if (e.key === 'Escape') closeLightbox()
  if (e.key === 'ArrowLeft') prevImage()
  if (e.key === 'ArrowRight') nextImage()
})

lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox || e.target === lightboxImg) closeLightbox()
})

/* ===== INIT ===== */
loadLikes()
loadImages()
initHotSection()

setTimeout(() => {
  observeMasonry()
  document.querySelectorAll('.masonry-item').forEach((item, i) => {
    setTimeout(() => item.classList.add('reveal'), i * 80)
  })
}, 300)
