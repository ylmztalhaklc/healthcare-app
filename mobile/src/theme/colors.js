// ═══════════════════════════════════════════════════════════════
//  HealthCare RN — Design Token System
//  Tasarım: Sağlık teması · Teal-Mint primary · Breathing glow
// ═══════════════════════════════════════════════════════════════

// ─── SHARED HEALTH SEMANTICS (tema bağımsız) ──────────────────
export const health = {
  heartRate:   '#FF5A7E',   // kalp atışı kırmızısı
  oxygen:      '#4CC9F0',   // oksijen mavisi
  glucose:     '#F77F00',   // şeker turuncusu
  pressure:    '#7B2FBE',   // tansiyon moru
  medication:  '#FF6FD8',   // ilaç pembesi
  sleep:       '#5E60CE',   // uyku indigo
  activity:    '#06D6A0',   // aktivite yeşil
  temperature: '#EF476F',   // ateş kırmızı
};

// ─── GRADIENT PAIRS (LinearGradient için) ─────────────────────
export const gradients = {
  // Breathing / hero background gradientleri
  darkHero:    ['#0D1B2A', '#0A2540', '#0E3D3A'],
  lightHero:   ['#E0F7F4', '#CCF2EE', '#D6EEF8'],

  // Primary neon teal breathing gradient
  tealBreath:  ['#00F0D0', '#3DFFD8', '#00C9A7'],
  tealSoft:    ['rgba(0,240,208,0.22)', 'rgba(0,240,208,0.06)'],

  // Card gradientleri
  darkCard:    ['#162230', '#111D2B'],
  lightCard:   ['#FFFFFF', '#F5FFFE'],

  // Status gradientleri
  successGrad: ['#00C9A7', '#00E5C3'],
  warningGrad: ['#FF9F1C', '#FFBF69'],
  errorGrad:   ['#FF6B6B', '#EE4266'],
  infoGrad:    ['#4CC9F0', '#4361EE'],
};

// ─── DARK THEME ───────────────────────────────────────────────
export const dark = {
  // ── Backgrounds ────────────────────────────────────────────
  background: '#0D1B2A',       // derin okyanus gecesi
  surface:    '#111D2B',       // kart yüzeyi
  surface2:   '#162230',       // elevated panel
  surface3:   '#1C2D3E',       // çok katmanlı panel
  card:       '#142030',       // card bg (hafif gradient için)

  // ── Primary: Neon Teal-Mint (breathing glow) ────────────────
  primary:      '#00F0D0',     // neon electric mint
  primaryDark:  '#00C9A7',     // basılı / active state
  primaryLight: '#3DFFE3',     // hover / glow peak
  secondary:    '#4DD9C0',     // secondary accent
  primarySoft:  'rgba(0,240,208,0.15)',
  primaryGlow:  'rgba(0,240,208,0.40)',  // güçlü neon glow
  primaryGlow2: 'rgba(0,240,208,0.18)', // ambient

  // ── Accent ─────────────────────────────────────────────────
  accent:       '#A855F7',     // neon violet-purple
  accentPurple: '#C084FC',     // açık mor
  accentWarm:   '#FF9A00',     // neon amber

  // ── Status ─────────────────────────────────────────────────
  success:     '#00E8A0',      // neon yeşil
  successSoft: 'rgba(0,232,160,0.14)',
  warning:     '#FFB800',      // neon amber
  warningSoft: 'rgba(255,184,0,0.14)',
  error:       '#FF3365',      // neon kırmızı-pembe
  errorSoft:   'rgba(255,51,101,0.14)',
  info:        '#00BBFF',      // neon mavi
  infoSoft:    'rgba(0,187,255,0.14)',

  // ── Health semantics ───────────────────────────────────────
  ...health,

  // ── Text ───────────────────────────────────────────────────
  textPrimary:   '#E8F8F5',    // neon teal'e uyumlu parlak beyaz
  textSecondary: '#7ECFBF',    // teal-mint tonu
  textMuted:     '#4E8880',    // visible teal-gray (not near-black)
  textTertiary:  '#265550',    // çok soluk
  textInverse:   '#0D1B2A',    // açık bg üstünde

  // ── Border / Divider ───────────────────────────────────────
  border:      'rgba(0,240,208,0.14)',
  borderFocus: 'rgba(0,240,208,0.55)',
  divider:     'rgba(0,240,208,0.07)',

  // ── Shadow tint (elevation rengi) ─────────────────────────
  shadowTint:  '#00F0D0',

  // ── Task & Görev renkleri ──────────────────────────────────
  statusPending:  '#FFB800',
  statusActive:   '#00F0D0',
  statusDone:     '#00E8A0',
  statusProblem:  '#FF3365',

  // ── Severity ───────────────────────────────────────────────
  severityLow:    '#00E8A0',
  severityMedium: '#FFB800',
  severityHigh:   '#FF3365',

  // ── Filigran / Watermark renkleri ─────────────────────────
  watermark:  'rgba(0,201,167,0.04)',
  watermark2: 'rgba(76,201,240,0.03)',
};

// ─── LIGHT THEME ──────────────────────────────────────────────
export const light = {
  // ── Backgrounds ───────────────────────────────────────────
  background: '#ECF0F7',       // cool blue-gray canvas
  surface:    '#FFFFFF',       // pure white cards
  surface2:   '#F5F7FF',       // lavender-tinted panel
  surface3:   '#E8EDF5',       // deeper section bg
  card:       '#FFFFFF',

  // ── Primary: Electric Cyan-Teal ───────────────────────────
  primary:      '#00B8B0',     // vivid electric teal
  primaryDark:  '#008E88',     // pressed
  primaryLight: '#00D8CE',     // hover
  secondary:    '#4ADFD6',     // secondary accent
  primarySoft:  'rgba(0,184,176,0.13)',
  primaryGlow:  'rgba(0,184,176,0.28)',
  primaryGlow2: 'rgba(0,184,176,0.10)',

  // ── Accent ────────────────────────────────────────────────
  accent:       '#5B4BF5',     // vivid indigo
  accentPurple: '#8B5CF6',     // vivid violet
  accentWarm:   '#FF7A00',     // vivid orange

  // ── Status ────────────────────────────────────────────────
  success:     '#00A86B',      // vivid emerald
  successSoft: 'rgba(0,168,107,0.12)',
  warning:     '#FF8C00',      // vivid amber-orange
  warningSoft: 'rgba(255,140,0,0.12)',
  error:       '#E8003D',      // vivid cherry red
  errorSoft:   'rgba(232,0,61,0.10)',
  info:        '#0072E5',      // vivid royal blue
  infoSoft:    'rgba(0,114,229,0.10)',

  // ── Health semantics ──────────────────────────────────────
  ...health,

  // ── Text ──────────────────────────────────────────────────
  textPrimary:   '#0F2137',    // deep navy
  textSecondary: '#4A6080',    // medium slate
  textMuted:     '#8899AA',    // slate-gray
  textTertiary:  '#B0BEC8',
  textInverse:   '#FFFFFF',

  // ── Border / Divider ──────────────────────────────────────
  border:      'rgba(0,0,0,0.08)',
  borderFocus: 'rgba(0,184,176,0.55)',
  divider:     'rgba(0,0,0,0.05)',

  // ── Shadow tint ───────────────────────────────────────────
  shadowTint:  '#00B8B0',

  // ── Task & Görev renkleri ─────────────────────────────────
  statusPending:  '#FF8C00',
  statusActive:   '#00B8B0',
  statusDone:     '#00A86B',
  statusProblem:  '#E8003D',

  // ── Severity ──────────────────────────────────────────────
  severityLow:    '#00A86B',
  severityMedium: '#FF8C00',
  severityHigh:   '#E8003D',

  // ── Filigran / Watermark renkleri ─────────────────────────
  watermark:  'rgba(0,184,176,0.07)',
  watermark2: 'rgba(91,75,245,0.05)',
};
