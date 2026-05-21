import justifiedLayout from 'justified-layout'

// ─── Gallery — justified layout (Flickr algorithm) ───────────────────────
const IMAGES = [
  { w: 1444, h: 1999, src: '/images/image1.webp', srcset: '/images/image1-800.webp 800w, /images/image1-1200.webp 1200w, /images/image1.webp 1444w', alt: 'Maria Nieves Romo' },
  { w: 1999, h: 1500, src: '/images/image5.webp', srcset: '/images/image5-400.webp 400w, /images/image5-800.webp 800w, /images/image5.webp 1999w', alt: 'Maria Nieves Romo' },
  { w: 1624, h: 2000, src: '/images/image6.webp', srcset: '/images/image6-400.webp 400w, /images/image6-800.webp 800w, /images/image6.webp 1624w', alt: 'Maria Nieves Romo' },
  { w: 1999, h: 1419, src: '/images/image4.webp', srcset: '/images/image4-400.webp 400w, /images/image4-800.webp 800w, /images/image4-1200.webp 1200w, /images/image4.webp 1999w', alt: 'Maria Nieves Romo con familia' },
  { w: 1168, h: 2000, src: '/images/image7.webp', srcset: '/images/image7-400.webp 400w, /images/image7-800.webp 800w, /images/image7.webp 1168w', alt: 'Maria Nieves Romo' },
  { w: 920,  h: 854,  src: '/images/image3.webp', srcset: '/images/image3-400.webp 400w, /images/image3-600.webp 600w, /images/image3.webp 920w', alt: 'Maria Nieves Romo' },
]

function buildGallery() {
  const container = document.querySelector<HTMLElement>('.gallery')
  if (!container) return

  // Derive width from CSS rules without reading DOM geometry (avoids forced reflow).
  // .section has 1.5rem padding on each side; .section__inner has max-width 1200px.
  const sectionPadPx = parseFloat(getComputedStyle(document.documentElement).fontSize) * 1.5
  const containerWidth = Math.min(window.innerWidth - sectionPadPx * 2, 1200)
  if (containerWidth <= 0) return

  const isMobile = containerWidth < 600
  const layout = justifiedLayout(
    IMAGES.map(img => ({ width: img.w, height: img.h })),
    {
      containerWidth,
      targetRowHeight: isMobile
        ? Math.round(containerWidth * 0.55)   // ~214px on 390px screen — 2 per row
        : Math.round(containerWidth * 0.28),  // ~358px on 1280px — 3 per row
      targetRowHeightTolerance: 0.25,
      boxSpacing: isMobile ? 6 : 10,
      containerPadding: 0,
    }
  )

  container.style.position = 'relative'
  container.style.height = layout.containerHeight + 'px'
  container.innerHTML = ''

  layout.boxes.forEach((box, i) => {
    const img = IMAGES[i]
    const figure = document.createElement('figure')
    figure.className = 'gallery__item reveal'
    figure.style.cssText = `
      position: absolute;
      left: ${box.left}px;
      top: ${box.top}px;
      width: ${box.width}px;
      height: ${box.height}px;
      margin: 0;
      overflow: hidden;
    `
    const image = document.createElement('img')
    image.src = img.src
    image.srcset = img.srcset
    image.sizes = `${Math.round(box.width)}px`
    image.alt = img.alt
    image.loading = 'lazy'
    image.style.cssText = 'width:100%;height:100%;object-fit:cover;transition:transform 0.7s cubic-bezier(0.22,1,0.36,1);display:block;'
    figure.addEventListener('mouseenter', () => { image.style.transform = 'scale(1.04)' })
    figure.addEventListener('mouseleave', () => { image.style.transform = 'scale(1)' })
    figure.appendChild(image)
    container.appendChild(figure)
    observer.observe(figure)
  })
}

// Rebuild on resize
let resizeTimer: ReturnType<typeof setTimeout>
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(buildGallery, 150)
})

// ─── Intersection Observer — fade-in reveal ───────────────────────────────
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      }
    })
  },
  { threshold: 0.12 }
)

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))

// Build gallery after observer is ready — defer to rAF so clientWidth read
// happens after the browser has already performed layout, avoiding forced reflow
requestAnimationFrame(buildGallery)

// ─── Language toggle ──────────────────────────────────────────────────────
type Lang = 'es' | 'en' | 'fr'

const html = document.documentElement
const btns = document.querySelectorAll<HTMLButtonElement>('.lang-btn')
const prayerEs = document.querySelector<HTMLElement>('[data-prayer-es]')
const prayerEn = document.querySelector<HTMLElement>('[data-prayer-en]')
const prayerFr = document.querySelector<HTMLElement>('[data-prayer-fr]')

function setLang(lang: Lang) {
  html.lang = lang

  // swap button states
  btns.forEach((btn) => {
    const active = btn.dataset.lang === lang
    btn.classList.toggle('lang-btn--active', active)
    btn.setAttribute('aria-pressed', String(active))
  })

  // swap all data-es / data-en / data-fr text nodes
  document.querySelectorAll<HTMLElement>('[data-es][data-en]').forEach((el) => {
    el.innerHTML = el.dataset[lang] ?? el.dataset.en ?? ''
  })

  // swap prayer blocks
  if (prayerEs) prayerEs.classList.toggle('prayer__lang--hidden', lang !== 'es')
  if (prayerEn) prayerEn.classList.toggle('prayer__lang--hidden', lang !== 'en')
  if (prayerFr) prayerFr.classList.toggle('prayer__lang--hidden', lang !== 'fr')
}

btns.forEach((btn) => {
  btn.addEventListener('click', () => {
    setLang(btn.dataset.lang as Lang)
  })
})

// Default to English on load
setLang('en')

// ─── Responsive parallax dividers ────────────────────────────────────────
const DIVIDER_SRCSETS: Record<string, [number, string][]> = {
  '/images/image4.webp': [[800, '/images/image4-800.webp'], [1200, '/images/image4-1200.webp']],
  '/images/image2.webp': [[800, '/images/image2-800.webp'], [1200, '/images/image2-1200.webp']],
}

function pickDividerSrc(original: string, displayWidth: number): string {
  const variants = DIVIDER_SRCSETS[original]
  if (!variants) return original
  const dpr = window.devicePixelRatio ?? 1
  const needed = displayWidth * dpr
  for (const [w, src] of variants) {
    if (needed <= w) return src
  }
  return original
}

document.querySelectorAll<HTMLElement>('.parallax-divider').forEach((el) => {
  const style = el.getAttribute('style') ?? ''
  const match = style.match(/url\('?([^')]+)'?\)/)
  if (!match) return
  const original = match[1]
  const src = pickDividerSrc(original, window.innerWidth)
  if (src !== original) {
    el.style.backgroundImage = `url('${src}')`
  }
})
