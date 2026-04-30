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

  // Primary teal breathing gradient
  tealBreath:  ['#00C9A7', '#00E5C3', '#00B897'],
  tealSoft:    ['rgba(0,201,167,0.18)', 'rgba(0,228,195,0.06)'],

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

  // ── Primary: Teal-Mint (breathing glow) ────────────────────
  primary:      '#00C9A7',     // ana teal-mint
  primaryDark:  '#00A88C',     // basılı / active state
  primaryLight: '#00E5C3',     // hover / glow peak
  secondary:    '#4DD9C0',     // secondary accent
  primarySoft:  'rgba(0,201,167,0.12)',
  primaryGlow:  'rgba(0,201,167,0.25)',  // breathing shadow için
  primaryGlow2: 'rgba(0,229,195,0.08)', // hafif ambient

  // ── Accent ─────────────────────────────────────────────────
  accent:       '#4CC9F0',     // mavi aksan (info)
  accentPurple: '#7B5EA7',     // mor aksan
  accentWarm:   '#FF9F1C',     // sıcak amber aksan

  // ── Status ─────────────────────────────────────────────────
  success:     '#00C9A7',
  successSoft: 'rgba(0,201,167,0.12)',
  warning:     '#FF9F1C',
  warningSoft: 'rgba(255,159,28,0.12)',
  error:       '#FF6B6B',
  errorSoft:   'rgba(255,107,107,0.12)',
  info:        '#4CC9F0',
  infoSoft:    'rgba(76,201,240,0.12)',

  // ── Health semantics ───────────────────────────────────────
  ...health,

  // ── Text ───────────────────────────────────────────────────
  textPrimary:   '#E8F4F3',    // kırık beyaz — gözü yormaz
  textSecondary: '#7FB3AE',    // teal-grisi secondary
  textMuted:     '#4A7570',    // çok soluk
  textTertiary:  '#2E5550',    // neredeyse görünmez
  textInverse:   '#0D1B2A',    // açık bg üstünde

  // ── Border / Divider ───────────────────────────────────────
  border:      'rgba(0,201,167,0.12)',
  borderFocus: 'rgba(0,201,167,0.45)',
  divider:     'rgba(0,201,167,0.07)',

  // ── Shadow tint (elevation rengi) ─────────────────────────
  shadowTint:  '#00C9A7',

  // ── Task & Görev renkleri ──────────────────────────────────
  statusPending:  '#FF9F1C',
  statusActive:   '#4CC9F0',
  statusDone:     '#00C9A7',
  statusProblem:  '#FF6B6B',

  // ── Severity ───────────────────────────────────────────────
  severityLow:    '#00C9A7',
  severityMedium: '#FF9F1C',
  severityHigh:   '#FF6B6B',

  // ── Filigran / Watermark renkleri ─────────────────────────
  watermark:  'rgba(0,201,167,0.04)',
  watermark2: 'rgba(76,201,240,0.03)',
};

// ─── LIGHT THEME ──────────────────────────────────────────────
export const light = {
  // ── Backgrounds — mint-krem, asla saf beyaz değil ─────────
  background: '#EEF9F7',       // nefes alan mint-krem
  surface:    '#FAFFFE',       // kart; saf beyaz değil
  surface2:   '#E6F5F2',       // ikincil panel
  surface3:   '#D8EEE9',       // çok katmanlı
  card:       '#FAFFFE',

  // ── Primary: Teal-Mint ─────────────────────────────────────
  primary:      '#009E82',     // daha koyu teal (light'ta kontrast için)
  primaryDark:  '#007A63',
  primaryLight: '#00C9A7',
  secondary:    '#2BB8A0',
  primarySoft:  'rgba(0,158,130,0.09)',
  primaryGlow:  'rgba(0,158,130,0.18)',
  primaryGlow2: 'rgba(0,201,167,0.05)',

  // ── Accent ─────────────────────────────────────────────────
  accent:       '#0096C7',
  accentPurple: '#6A4C93',
  accentWarm:   '#E76F00',

  // ── Status ─────────────────────────────────────────────────
  success:     '#009E82',
  successSoft: 'rgba(0,158,130,0.09)',
  warning:     '#E76F00',
  warningSoft: 'rgba(231,111,0,0.10)',
  error:       '#D62839',
  errorSoft:   'rgba(214,40,57,0.09)',
  info:        '#0096C7',
  infoSoft:    'rgba(0,150,199,0.09)',

  // ── Health semantics ───────────────────────────────────────
  ...health,

  // ── Text ───────────────────────────────────────────────────
  textPrimary:   '#0F2B28',    // derin koyu teal-siyah
  textSecondary: '#2D6B64',    // orta teal-gri
  textMuted:     '#6B9E99',    // soluk
  textTertiary:  '#A0C4C1',    // çok soluk
  textInverse:   '#FAFFFE',

  // ── Border / Divider ───────────────────────────────────────
  border:      'rgba(0,158,130,0.15)',
  borderFocus: 'rgba(0,158,130,0.50)',
  divider:     'rgba(0,158,130,0.08)',

  // ── Shadow tint ────────────────────────────────────────────
  shadowTint:  '#009E82',

  // ── Task & Görev renkleri ──────────────────────────────────
  statusPending:  '#E76F00',
  statusActive:   '#0096C7',
  statusDone:     '#009E82',
  statusProblem:  '#D62839',

  // ── Severity ───────────────────────────────────────────────
  severityLow:    '#009E82',
  severityMedium: '#E76F00',
  severityHigh:   '#D62839',

  // ── Filigran / Watermark renkleri ─────────────────────────
  watermark:  'rgba(0,158,130,0.05)',
  watermark2: 'rgba(0,150,199,0.04)',
};
