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

// ─── Language toggle ──────────────────────────────────────────────────────
type Lang = 'es' | 'en'

const html = document.documentElement
const btns = document.querySelectorAll<HTMLButtonElement>('.lang-btn')
const prayerEs = document.querySelector<HTMLElement>('[data-prayer-es]')
const prayerEn = document.querySelector<HTMLElement>('[data-prayer-en]')

function setLang(lang: Lang) {
  html.lang = lang

  // swap button states
  btns.forEach((btn) => {
    const active = btn.dataset.lang === lang
    btn.classList.toggle('lang-btn--active', active)
    btn.setAttribute('aria-pressed', String(active))
  })

  // swap all data-es / data-en text nodes
  document.querySelectorAll<HTMLElement>('[data-es][data-en]').forEach((el) => {
    el.innerHTML = el.dataset[lang] ?? ''
  })

  // swap prayer blocks
  if (prayerEs && prayerEn) {
    prayerEs.classList.toggle('prayer__lang--hidden', lang === 'en')
    prayerEn.classList.toggle('prayer__lang--hidden', lang === 'es')
  }
}

btns.forEach((btn) => {
  btn.addEventListener('click', () => {
    setLang(btn.dataset.lang as Lang)
  })
})

// Default to English on load
setLang('en')
