// API and app-wide constants

export const API_BASE_URL = 'http://10.0.2.2:8000'; // Android emulator
// Use 'http://10.0.2.2:8000' for Android emulator
// Change to your local IP (e.g. 'http://192.168.1.100:8000') for physical device

export const APP_NAME = 'HealthCare';

export const ROLES = {
  RELATIVE: 'hasta_yakini',
  CAREGIVER: 'hasta_bakici',
};

export const TASK_STATUS = {
  PENDING: 'bekliyor',
  IN_PROGRESS: 'devam_ediyor',
  DONE: 'tamamlandi',
  PROBLEM: 'sorun_var',
  CANCELLED: 'iptal',
};

export const TASK_STATUS_LABELS = {
  bekliyor: 'Bekliyor',
  devam_ediyor: 'Devam Ediyor',
  tamamlandi: 'Tamamlandı',
  sorun_var: 'Sorun Var',
  iptal: 'İptal',
};

export const PROBLEM_SEVERITY = {
  LOW: 'hafif',
  MEDIUM: 'orta',
  HIGH: 'ciddi',
};

export const PROBLEM_SEVERITY_LABELS = {
  hafif: 'Hafif',
  orta: 'Orta',
  ciddi: 'Ciddi',
};

// Week day short names
// DAYS_SUN_FIRST: index matches JS Date.getDay() (0=Sun)
export const DAYS_SUN_FIRST = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
// DAYS_MON_FIRST: Monday-indexed (0=Mon), used in weekly bar charts
export const DAYS_MON_FIRST = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

// Turkish month names
export const MONTHS_TR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
