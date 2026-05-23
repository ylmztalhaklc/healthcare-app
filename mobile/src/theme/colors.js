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
  // ── Backgrounds — doğal keten/kağıt tonu ─────────────────
  background: '#F7F3EE',       // doğal keten beyazı
  surface:    '#FEFCF9',       // sıcak beyaz
  surface2:   '#F0EBE2',       // krem panel
  surface3:   '#E8E0D4',       // daha derin krem
  card:       '#FEFCF9',

  // ── Primary: Muted Teal ───────────────────────────────────
  primary:      '#0D9E97',     // mat okyanus teal
  primaryDark:  '#0A7A74',     // basılı
  primaryLight: '#1ABDB5',     // hover
  secondary:    '#35C4BB',     // yumuşak ikincil
  primarySoft:  'rgba(13,158,151,0.09)',
  primaryGlow:  'rgba(13,158,151,0.22)',
  primaryGlow2: 'rgba(13,158,151,0.09)',

  // ── Accent ────────────────────────────────────────────────
  accent:       '#6A5ACD',     // mat lavanta-indigo
  accentPurple: '#8878E0',     // açık lavanta
  accentWarm:   '#D97000',     // sıcak amber

  // ── Status ────────────────────────────────────────────────
  success:     '#1A8F68',      // mat zümrüt
  successSoft: 'rgba(26,143,104,0.10)',
  warning:     '#C97D00',      // mat amber
  warningSoft: 'rgba(201,125,0,0.10)',
  error:       '#C0003A',      // mat kırmızı
  errorSoft:   'rgba(192,0,58,0.08)',
  info:        '#1762B8',      // mat lacivert
  infoSoft:    'rgba(23,98,184,0.09)',

  // ── Health semantics ──────────────────────────────────────
  ...health,

  // ── Text ──────────────────────────────────────────────────
  textPrimary:   '#1C2B38',    // derin lacivert-gri
  textSecondary: '#4A5C6E',    // orta slate
  textMuted:     '#8A9AAA',    // hafif slate
  textTertiary:  '#B0BCC6',
  textInverse:   '#FFFFFF',

  // ── Border / Divider ──────────────────────────────────────
  border:      'rgba(120,95,60,0.12)',
  borderFocus: 'rgba(13,158,151,0.40)',
  divider:     'rgba(120,95,60,0.06)',

  // ── Shadow tint ───────────────────────────────────────────
  shadowTint:  '#0D9E97',

  // ── Task & Görev renkleri ─────────────────────────────────
  statusPending:  '#C97D00',
  statusActive:   '#0D9E97',
  statusDone:     '#1A8F68',
  statusProblem:  '#C0003A',

  // ── Severity ──────────────────────────────────────────────
  severityLow:    '#1A8F68',
  severityMedium: '#C97D00',
  severityHigh:   '#C0003A',

  // ── Filigran / Watermark renkleri ─────────────────────────
  watermark:  'rgba(13,158,151,0.06)',
  watermark2: 'rgba(106,90,205,0.04)',
};
