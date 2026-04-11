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
